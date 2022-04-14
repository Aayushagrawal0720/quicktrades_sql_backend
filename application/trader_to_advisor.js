const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');

router.post('/tradertoadvisor', (req, res)=>{
    try{
        var {uid} = req.body;
        tradertoadvisor(uid, (err, result)=>{
            if(err){
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                if(result){
                    res.send(getJSONResponse(true, '' , text.TEXT_SUCCESS, {}));
                    return;
                }else{
                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
                    return;
                }
            }
        })
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
        return;
    }
})


function tradertoadvisor(uid, cb){
    var query =`UPDATE users SET value = '${text.TEXT_ADVISOR}' WHERE uid = '${uid}' AND key = '${dbconstants.DB_USERTYPE}';`;
    pool.query(query).then((result)=>{
        if(result.rowCount>0){
            cb(false, true);
            return;
        }else{
            cb(false, false)
            return;
        }
    }).catch((exception)=>{
        console.log('-------------/tradertoadvisor----tradertoadvisor-----')
        console.log(exception);
        cb(exception);
        return;
    })
}


module.exports = router;
