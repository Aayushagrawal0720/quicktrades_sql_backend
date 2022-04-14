const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');

router.post('/getadvisorcalls', (req, res)=>{
    try{
        var {uid, tid, status} = req.body;
        if(tid){
            getTraderCalls(uid, status, tid, (err, result)=>{
                if(err){
                    res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, err, {}));
                    return;
                }else if(result==='No record found'){
                    res.send(getJSONResponse(true, '','No record found', result));
                    return;
                }
                else{
                    res.send(getJSONResponse(true, '',text.TEXT_SUCCESS, result));
                    return;
                }
            })
        }else{
            getCallsQuery(uid, status, (err, query, dataset)=>{
                if(err){
                    res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                    return;
                }else{
                    pool.query(query, dataset).then((result)=>{
                        if(result.rowCount>0){
                            res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, result.rows));
                            return;
                        }else{
                            res.send(getJSONResponse(true, '','No record found',{}));
                            return;
                        }
                    }).catch((exception)=>{
                        console.log(exception);
                        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                        return;
                    })
                }
            })
        }
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
});




function getCallsQuery(uid, status,cb){
    var query =``;
    var dataSet=[];
    if(uid && status){
        if(status == 'All'){
            query= query + `SELECT * FROM calls WHERE uid = $1;`;
            dataSet.push(uid);
        }else{
            query = query + `SELECT * FROM calls WHERE uid = $1 AND status = $2;`
            dataSet.push(uid);
            dataSet.push(status);
        }
    }else{
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    cb(undefined, query, dataSet);
    return;
}

function getTraderCalls(uid, status, tid, cb){
    getCallsQuery(uid, status, (err, query, dataSet)=>{
        if(err){
            cb(err);
            return;
        }else{
            pool.query(query, dataSet).then((result)=>{
                if(result.rowCount>0){
                    getTraderCallsId(tid,(err,cids)=>{
                        if(err){
                            cb(err);
                            return;
                        }
                        else if(cids==='no subscription'){
                            cb(undefined, result.rows);
                        }
                        else{
                            var calls = result.rows;    //ALL CALLS
                            var finalCalls = [];
                            calls.forEach((call)=>{     // LOOP WILL STORE ALL IDS TO CALLSID VARIABLE
                                var cid= call.cid;

                                if(cids.indexOf(cid)!==-1){
                                    call['visible']=false
                                    finalCalls.push(call);
                                }else{
                                    call['visible']=true
                                    finalCalls.push(call);
                                }
                            })

                            cb(undefined, finalCalls);

                        }


                    })
                }else{
                    cb(undefined, 'No record found');
                    return;
                }
            }).catch((exception)=>{
                console.log(exception);
                cb(exception);
                return;
            })
    }
});
}

function getTraderCallsId(tid, cb){
    var query = `SELECT * FROM tradercalls WHERE uid = '${tid}'`;
    pool.query(query).then((result)=>{
        if(result.rowCount>0){

            cb(undefined, result.rows);
            return;
        }else{
            cb(undefined, 'no subscription');
            return;
        }
    }).catch((exception)=>{
        console.log(exception);
        cb(exception);
        return;
    });
}


module.exports= router;
