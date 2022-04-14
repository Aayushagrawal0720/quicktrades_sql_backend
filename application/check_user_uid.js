const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');


router.post('/checkuid', (req, res)=>{
    try{
        var {uid, usertype} =  req.body;
        checkUserQuery(uid, usertype, (err, userCheckQuery, dataSet)=>{
            if (err) {
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                pool.query(userCheckQuery, dataSet).then((result)=>{
                    if(result.rowCount>0){
                        var rows = result.rows;
                        rows.forEach((row)=>{
                            if(row.key==='usertype'){
                                if(row.value === usertype){
                                    if(!res.headersSent){
                                        res.send(getJSONResponse(true, '' , 'user found', {}));
                                        return;
                                    }
                                }else{
                                    if(!res.headersSent){
                                        res.send(getJSONResponse(true, '' , 'usertype', {}));
                                        return;
                                    }
                                }
                            }

                        })
                    }else{
                        res.send(getJSONResponse(true, '' , 'user not found', {}));
                        return;
                    }
                }).catch((err) => {
                    console.log(err);
                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
                    return;
                });
            }
        })
    }catch (err) {
        console.log('-------------/checkuid----catch------')
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
        return;
    }
});

function  checkUserQuery(uid, usertype, cb){
    var query = ``;
    var dataSet=[];
    if(uid && usertype){
        //query = query + `SELECT * FROM users WHERE uid = $1 AND key = $2 AND value = $3;`;
        query = query + `SELECT * FROM users WHERE uid = $1;`;
        dataSet.push(uid)
        //dataSet.pus(dbconstants.DB_USERTYPE);
        //dataSet.push(usertype);
    }else{
        cb(errorcodes.INVALID_REQUEST)
        return;
    }
    cb(undefined, query, dataSet);
    return;
}


module.exports = router;
