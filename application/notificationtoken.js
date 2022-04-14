const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');


router.post('/settoken', (req, res)=>{
   try{
       var {token, uid} = req.body;
       updateNotificationToken(token, uid,(err, result)=>{
            if (err) {
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                res.send(getJSONResponse(true, '' , text.TEXT_SUCCESS, {}));
                return;
            }
    })
    }catch(exception){
        console.log(exception);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
        return;
    }
});

function updateNotificationToken(token, uid, cb){
    var query = `UPDATE users SET value = $1 WHERE key = $2 AND uid = $3;`;
    var dataSet =[token, dbconstants.DB_NOTITOKEN, uid];

    pool.query(query, dataSet).then((result)=>{
        cb(false, true);
    }).catch((exception)=>{
        console.log('------------/settoken------updateNotificationToken-----');
        console.log(exception);
        cb(exception);
        return;
    })

}


module.exports= router;
