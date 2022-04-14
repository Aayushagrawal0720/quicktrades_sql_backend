const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');



router.post('/accuracy', (req, res)=>{
    try{
        var {uid} = req.body;

        getAccuracyByUid(uid, (err, accuracy)=>{
            if(err){
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, accuracy));
                return;
            }
        })
    }catch(exception){
        console.log(exception);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
})

function getAccuracyByUid(uid, cb){
    var query = `SELECT value FROM users WHERE uid = $1 AND key = $2;`;
    var dataSet=[uid, dbconstants.DB_ACCURACY];

    pool.query(query, dataSet).then((result)=>{
        var accuracy=0;
        if(result.rowCount>0){
            accuracy = result.rows[0].value;
            cb(false, {'accuracy': accuracy});
        }else{
            cb(false, {'accuracy': accuracy});
        }
    }).catch((exception)=>{
        console.log('-------/accuracy------getAccuracyByUid---');
        console.log(exception);
        cb(exception);
        return;
    })
}



module.exports= router;
