const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');


router.post('/patterndeatils', (req, res)=>{
    try{
        var {title} = req.body;
        getPatternDetailQuery(title, (err, query, dataSet)=>{
            if (err) {
                console.log(err);
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                pool.query(query, dataSet).then((result)=>{
                    if(result.rowCount>0){
                        res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, result.rows));
                        return;
                    }else{
                        res.send(getJSONResponse(true, '', 'no record found', {}));
                        return;
                    }
                }).catch((err) => {
                    console.log(err);
                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
                    return;
                });
            }
        })
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
})

function getPatternDetailQuery(title, cb){
    var query =``;
    var dataSet = [];
    if(title){
        query = query + `SELECT * FROM analysis WHERE title = $1;`;
        dataSet.push(title);
    }else{
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    cb(undefined, query, dataSet);
    return;
}


module.exports= router;
