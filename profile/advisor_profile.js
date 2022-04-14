const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');


router.post('/advisorcountprofile', (req, res)=>{
    try{
        var {aid} = req.body;
        getAdvisorCountProfile(aid, (err, query)=>{
            if (err) {
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                pool.query(query).then((result)=>{
                  var responseData={} ;
                  if(result.length>0){
                        result.forEach((obj)=>{
                            if(obj.rowCount>0){
                                var rowData = obj.rows[0];
                                var key = Object.keys(rowData)[0];
                                var value= Object.values(rowData)[0];

                                responseData[key]=value;
                            }
                        })
                        res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, responseData));
                        return;
                    }
                }).catch((exception)=>{
                    console.log(exception);
                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                    return;
                })
            }
        })
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
})


function getAdvisorCountProfile(aid, cb){
    var query = ``;
    if(aid){
        query = query + `SELECT value as wallet FROM users WHERE key = '${dbconstants.DB_WALLET}' AND uid = '${aid}';`
        query = query + `SELECT count(*) as subscribers FROM packagesubscription WHERE aid = '${aid}';`
        query = query + `SELECT count(*) as current_subscribers FROM (SELECT DISTINCT(uid) FROM packagesubscription WHERE aid = '${aid}' AND (status = 'Pending' or status = 'Active')) as current_subscribers;`
        query = query + `SELECT count(*) as all_calls FROM calls WHERE uid = '${aid}';`
        query = query + `SELECT count(*) as pending_calls FROM calls WHERE uid = '${aid}' AND status = 'Pending';`
        query = query + `SELECT count(*) as active_calls FROM calls WHERE uid = '${aid}' AND status = 'Active';`
        query = query + `SELECT count(*) as hit_calls FROM calls WHERE uid = '${aid}' AND status = 'Target Hit';`
        query = query + `SELECT count(*) as loss_calls FROM calls WHERE uid = '${aid}' AND status = 'Loss Booked';`
    }else{
        cb(errorcodes.INVALID_REQUEST);
        return;
    }

    cb(undefined, query);
}


module.exports= router;

