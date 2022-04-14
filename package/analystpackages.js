const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');


router.post('/analystpackages', (req, res)=>{
   try{
        var {aid, analyst} = req.body;
        getAnalystPackageQuery(aid, analyst, (err, query, dataset)=>{
            if(err){
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                pool.query(query, dataset).then((result)=>{
                    var responseData ={};
                    if(result.rowCount>0){
                        responseData['packages'] = result.rows;
                        getDiscountDetails((err, discountData)=>{
                            if(err){
                                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                                return;
                            }else{
                                responseData['discount']= discountData
                                res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, responseData));
                                return;
                            }
                        })

                    }else{
                        res.send(getJSONResponse(true, '', 'no package found', {}))
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
        console.log('------/analystpackages----------');
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }

});


function getAnalystPackageQuery(aid, analyst, cb){
    var query =``;
    var dataset =[];
    if(aid){
        if(analyst){
            query = query + `SELECT * FROM packages WHERE uid = $1;`;
            dataset.push(aid);
        }else{
            query = query + `SELECT * FROM packages WHERE uid = $1 AND NOT amount = '0';`;
            dataset.push(aid);
        }
    }else{
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    cb(undefined, query, dataset);
    return;
}


function getDiscountDetails(cb){
    var query =`SELECT * FROM charges WHERE key= 'admin_discount' and status = 'Active';`;
    pool.query(query).then((result)=>{
        if(result.rowCount>0){
            var row = result.rows;
            cb(false, row);
            return;
        }else{
            cb(false, 'no record');
            return;
        }
    }).catch((exception)=>{
        console.log('------/analystpackages====getDiscountDetails----')
        console.log(exception);
        cb(exception);
        return;
    })
}


module.exports= router;
