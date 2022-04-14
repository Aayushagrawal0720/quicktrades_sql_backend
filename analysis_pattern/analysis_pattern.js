const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');

router.get('/getpatterns', (req, res)=>{
    try{
        getPatterns((err,result)=>{
            if(err){
                console.log(err);
                res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                return;
            }else{
                res.send(getJSONResponse(true, '',text.TEXT_SUCCESS,result));
                return;
            }
        })
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
})

function getPatterns(cb){
    var query = `SELECT title FROM analysis;`;
    pool.query(query).then((result)=>{

        cb(undefined, result.rows);
        return;

    }).catch((exception)=>{
        console.log(exception);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    })

}


module.exports= router;

