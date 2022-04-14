const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');


router.post('/tradercalls', (req, res)=>{
    try{
     var {uid, status}=  req.body;
     getTraderCallsQuery(uid, status,  (err, query, dataSet)=>{
         pool.query(query, dataSet).then((result)=>{
             if(result.rowCount>0){

                 getAdvisorData(result.rows,(err,calls)=>{
                     if(err){
                        console.log(err);
                        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                        return;
                    }else{
                        res.send(getJSONResponse(true, '',text.TEXT_SUCCESS,calls))
                        return;
                    }
                })


            }else{
                res.send(getJSONResponse(true, '','no record found', {}));
                return;
            }
        }).catch((exception)=>{
            console.log(exception);
            res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
            return;
        })
    })
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
})

function getTraderCallsQuery(uid, status, cb){
    var query =``;
    var dataSet =[];
    if(uid && status){
        if(status=='All'){
            query = query + `SELECT * FROM calls WHERE cid IN (SELECT cid FROM tradercalls WHERE uid = $1)`;
            dataSet.push(uid)
        }
        else if(status=='Active/Pending'){
            query = query + `SELECT * FROM calls WHERE cid IN (SELECT cid FROM tradercalls WHERE uid = $1 AND (status = $2 OR status = $3))`;
            dataSet.push(uid)
            dataSet.push('Active')
            dataSet.push('Pending')
        }
        else if(status=='Closed calls'){
            query = query + `SELECT * FROM calls WHERE cid IN (SELECT cid FROM tradercalls WHERE uid = $1 AND (status = $2 OR status = $3))`;
            dataSet.push(uid)
            dataSet.push('Target Hit')
            dataSet.push('Loos Booked')
    }
    }else{
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    cb(undefined, query, dataSet);
    return;
}

function getAdvisorData(calls, cb){
    var finalCalls=[];
    var query = `SELECT * FROM users WHERE (`;
    var dataSet =[];
    var index = 0;
    var finalAdvisorData={};
    calls.forEach((call)=>{
        var uid = call.uid;
        index++;
        query = query+ `uid = $${index}`;
        dataSet.push(uid);
        if(calls.indexOf(call)!==calls.length-1){
            query = query+ ` OR `;
        }
        finalAdvisorData[uid]={};
    })
        query = query+ `) AND (key = $${++index} OR key= $${++index} OR key = $${++index} OR key= $${++index});`;

        dataSet.push(dbconstants.DB_FNAME)
        dataSet.push(dbconstants.DB_LNAME)
        dataSet.push(dbconstants.DB_PHOTOURL)
        dataSet.push(dbconstants.DB_ACCURACY)
        pool.query(query, dataSet).then((result)=>{
            var rows = result.rows;
            rows.forEach((row)=>{
                var tUid = row.uid;
                var temp = finalAdvisorData[tUid];
                temp[row.key]= row.value;
                finalAdvisorData[tUid]= temp
            })
            calls.forEach((call)=>{
                call['advisor']= finalAdvisorData[call.uid];
                finalCalls.push(call);
            })
            cb(undefined, finalCalls);
            return;
        }).catch((exception)=>{
                console.log('-----getAdvisorData----/tradercalls--');
                console.log(exception);
                cb(exception);
                return;
        })
}

function getAdvisorQuery(uid, cb){
    var query = ``;
    var dataSet =[];

    if(uid){
        query = query +`SELECT * FROM users WHERE uid = $1 AND (key = $2 OR key= $3 OR key = $4 OR key= $5);`;
        dataSet.push(uid)
        dataSet.push(dbconstants.DB_FNAME)
        dataSet.push(dbconstants.DB_LNAME)
        dataSet.push(dbconstants.DB_PHOTOURL)
        dataSet.push(dbconstants.DB_ACCURACY)

        pool.query(query, dataSet).then((result)=>{
            if(result.rowCount>0){
                var rows = result.rows;
                var finalAdvisorData ={};
                rows.forEach((row)=>{
                    finalAdvisorData[row.key]= row.value;
                })

                cb(undefined, finalAdvisorData);
                return;
            }else{
                cb('not found');
                return;
            }
        }).catch((exception)=>{
            console.log('-----getAdvisorQuery----/tradercalls--');
            console.log(exception);
            cb(exception);
            return;
        })
    }else{
        cb(errorcodes.INVALID_REQUEST)
        return;
    }
}


module.exports= router;
