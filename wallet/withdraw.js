const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');
const { v4 : uuidv4 } = require('uuid');

router.post('/withdraw', (req, res)=>{

    try{
        var {uid, amount, bankdetails} = req.body;
        checkWalletForAmount(uid, amount, (err, sufficientBalance)=>{
            if(err){
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                if(sufficientBalance){
                    var wid = uuidv4();
                    getWithdrawQuery(wid, uid, amount, bankdetails, (err, query, dataSet)=>{
                        if(err){
                            res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                            return;
                        }else{
                           pool.query(query, dataSet).then((result)=>{
                                if(result.rowCount>0){
                                    res.send(getJSONResponse(true, '',text.TEXT_SUCCESS, {}));
                                    setTransactions(wid, uid, amount);
                                    return;
                                }
                            }).catch((excpetion)=>{
                                console.log('------/withdraw db operation----------');
                                console.log(excpetion);
                                res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                                return;
                            })
                        }
                    })
                }else{
                    res.send(getJSONResponse(true, '', 'insufficient balance', {}));
                    return;
                }
            }
        })

    }
    catch(excpetion){
        console.log('------/withdraw----------');
        console.log(excpetion);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
});

function checkWalletForAmount(uid, amount, cb){
    try{
        var query =`SELECT value FROM wallet WHERE uid = $1 AND key= 'wallet';`;
        var dataSet=[uid];
        if(uid){
            pool.query(query, dataSet).then((result)=>{
                if(result.rowCount>0){
                    var row = result.rows[0];
                    var walletAmount = row['value']
                    if(walletAmount<parseInt(amount)){
                        cb(false, false)
                    }else{
                        cb(false, true)
                    }
                }else{
                    cb(true)
                }
            }).catch((exception)=>{
                console.log('-----------')
                console.log(exception);
                cb(true);
            })
        }else{
            cb(true)
        }
    }catch(err){
        console.log(err);
        cb(true)
    }
}

function getWithdrawQuery(wid, uid, amount, bankdetails, cb){
    var query = ``;
    var dataSet = [];
    if(uid && amount && bankdetails){
        query = query + `INSERT INTO withdraw (wid, uid, amount, bankdetails) VALUES ($1, $2, $3, $4)`;
        dataSet.push(wid);
        dataSet.push(uid)
        dataSet.push(amount)
        dataSet.push(bankdetails)
    }else{
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    cb(undefined, query, dataSet);
}


function setTransactions(wid, uid, amt){
    var query =``;
    var txnid = uuidv4()
    var gateway_result= JSON.stringify({wid: wid});
    if(wid && uid && amt){
        query = query + `INSERT INTO transactions (txnid, dfrom, cto, gateway_result, amount, uid, status, datetime) VALUES ('${txnid}','${dbconstants.DB_WALLET}','Bank','${gateway_result}','${amt}','${uid}','Pending','NOW()');`;

        pool.query(query).then((result)=>{

        }).catch((exception)=>{
            console.log(`--------FAILED TO ADD TRANSACTIONS ${wid}-------------------`);
            console.log(exception);
        })
    }

}


module.exports= router;
