const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');


router.post('/updatepackage', (req, res)=>{
   try{
     var {pid, amount}=  req.body;
    getPackageAmountUpdateQuery(pid, amount, (err, query, dataset)=>{
       if(err){
            if(err===errorcodes.PKG_AMOUNT_ZERO){
                res.send(getJSONResponse(true, err, 'Amount should be greater than 0', {}));
                return;
            }else{
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }
        }else{
            pool.query(query, dataset).then((result)=>{
                if(result.rowCount>0){
                    res.send(getJSONResponse(true, '',text.TEXT_SUCCESS,{}));
                    return;
                }else{
                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                    return;
                }
            }).catch((exception)=>{
                console.log(exception);
                res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                return;
            })
        }
    });
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
});

function getPackageAmountUpdateQuery(pid, amount, cb){
    var query=``;
    var dataset=[];
    if(pid && amount){
        if(parseInt(amount)>0){
            query = query + `UPDATE packages SET amount = $1 WHERE pid = $2;`;
            dataset.push(amount);
            dataset.push(pid);
        }else{
            cb(errorcodes.PKG_AMOUNT_ZERO);
            return;
        }
    }else{
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    cb(undefined, query, dataset);
}


module.exports= router;

