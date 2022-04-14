const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');
const { v4 : uuidv4 } = require('uuid');
const axios = require('axios');
const notification = require('../middleware/notificationService');

router.post('/purchasepackage', (req, res)=>{
    try{
        var {pid, uid, aid, cid, amount} = req.body;
        var userWamt;
        var advisorWamt;
        var pkgAmt;
        getWalletbalanceQuery(uid, aid, (err, walletQuery, walletDataArr)=>{
            if(err){
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                pool.query(walletQuery, walletDataArr).then((walletResult)=>{
                    var walletRows= walletResult.rows;
                    walletRows.forEach((wRow)=>{
                        if(wRow['uid']===uid){
                            userWamt=wRow['value']
                        }
                        if(wRow['uid']===aid){
                            advisorWamt=wRow['value']
                        }
                    })
                             pkgAmt= amount;
                            if(parseInt(userWamt)<parseInt(pkgAmt)){
                                res.send(getJSONResponse(true, '','Insufficient balance',{}))
                                return;
                            }else{
                                    var tAmt = parseInt(userWamt) - parseInt(pkgAmt);
                                    var aAmt = parseInt(advisorWamt) + parseInt(pkgAmt)
                                    var id = uuidv4();
                                    getPurchaseRequestQuery(id, pid, uid, aid, pkgAmt,tAmt, aAmt, cid, (err, purchaseQuery, purchaseQueryData)=>{
                                        if(err){
                                            res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                                            return;
                                        }else{
                                            pool.query(purchaseQuery, purchaseQueryData).then((purchaseResult)=>{
                                                        //console.log(purchaseResult);
                                            axios({method: 'post',
                                                url: 'http://172.26.0.197:3002/newpkgpur',
                                                data: {
                                                id:id
                                            }}).then((response)=>{
                                                console.log('then response');
                                                console.log(response.data);
                                            }).catch((err)=>{
                                                console.log('catch response');
                                                console.log(err);
                                            })
                                            setTransactions(id, uid, aid, pkgAmt);
                                            notification(aid, 'New subscription', 'you have a new subscriber');
                                            res.send(getJSONResponse(true, '',text.TEXT_SUCCESS, {}));
                                            return;
                                        }).catch((exception)=>{
                                            console.log(exception);
                                            if(exception.hint === 'package already subscribed'){
                                                res.send(getJSONResponse(true, '','Package already subscribed',{}))
                                                return;
                                            }
                                            res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                                            return;
                                    })
                                }
                        } )
                    }

                  /*  getpackageAmountQuery(pid, (err, pkgQuery, pkgDataArr)=>{
                        if(err){
                            res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                            return;
                        }else{
                            pool.query(pkgQuery, pkgDataArr).then((pkgResult)=>{
                                if(pkgResult.rowCount>0){

                                }else{
                                    res.send(getJSONResponse(false,errorcodes.PACKAGE_NOT_FOUND, text.TEXT_PACKAGENOTFOUND, {}));
                                    return;
                                }
                            }).catch((exception)=>{
                                console.log(exception);
                                res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
                                return;
                            })
                        }
                    })*/
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
});

function getPurchaseRequestQuery(id, pid, uid, aid, amount,tAmt, aAmt, cid,cb){
    var query = ``;
    var dataArr=[];
    if(pid && uid ){
        query = query + `DO $$
                        DECLARE
                        pcount integer := 0;
                        BEGIN SELECT count(*) INTO pcount FROM packagesubscription WHERE uid = '${uid}' AND pid = '${pid}' AND (status = 'Pending' or status = 'Active');

                        IF pcount>0
                            THEN RAISE EXCEPTION USING message= 'package already subscribed', errcode = 'P0001', hint = 'package already subscribed';
                            ELSE `
    }else{
        cb(errorcodes.INVALID_REQUEST)
        return;
    }
    //WALLET UPDATE QUERY
    if(tAmt.toString() && aAmt.toString() && aid.toString() && amount.toString()){

        query = query + `INSERT INTO packagesubscription (id, pid, uid, aid,status, amount, purchasedate) VALUES ('${id}', '${pid}', '${uid}', '${aid}', 'Pending' ,'${amount}', NOW());`;
        query = query + `UPDATE wallet SET value = '${tAmt}' WHERE key = '${dbconstants.DB_WALLET}' AND uid = '${uid}'; `;
        query = query + `UPDATE wallet SET value = '${aAmt}' WHERE key = '${dbconstants.DB_WALLET}' AND uid = '${aid}'; `;

    }else{
        cb(errorcodes.INVALID_REQUEST)
        return;
    }

    if(cid){
        query = query + `INSERT INTO tradercalls(uid, cid) VALUES ('${uid}' , '${cid}');`;
    }
    query = query + `END IF;
                     END $$`;

    cb(undefined, query, dataArr);
}

function getWalletbalanceQuery(uid, aid,cb){
    var query = ``;
    var dataArr=[];
    if(uid && aid){
        query= query + `SELECT * FROM wallet WHERE uid IN ($1, $2) AND key = $3;`;
        dataArr.push(uid);
        dataArr.push(aid);
        dataArr.push(dbconstants.DB_WALLET);
    }else{
        cb(errorcodes.INVALID_REQUEST)
        return;
    }

    cb(undefined, query, dataArr);
    return;
}

function getpackageAmountQuery(pid, cb){
   var query = ``;
       var dataArr=[];
   if(pid){
        query = query + `SELECT amount FROM packages WHERE pid = $1;`;
        dataArr.push(pid);
    }else{
        cb(errorcodes.INVALID_REQUEST)
        return;
    }

    cb(undefined, query,dataArr);
}

function setTransactions(subid, uid, aid, pkgAmt){
    var query =``;
    var ttxnid = uuidv4()
    var atxnid = uuidv4()
    var gateway_result= JSON.stringify({sub_id: subid});
    if(subid && uid && aid && pkgAmt){
        query = query +`INSERT INTO transactions (txnid, dfrom, cto, gateway_result, amount, uid, status, datetime) VALUES ('${ttxnid}','${dbconstants.DB_WALLET}','${dbconstants.DB_PKGSUB}','${gateway_result}','${pkgAmt}','${uid}','sucess','NOW()'), ('${atxnid}','${dbconstants.DB_PKGSUB}','${dbconstants.DB_WALLET}','${gateway_result}','${pkgAmt}','${aid}','sucess','NOW()');`;
        pool.query(query).then((result)=>{

        }).catch((exception)=>{
            console.log(`--------FAILED TO ADD TRANSACTIONS ${subid}-------------------`);
            console.log(exception);
        })
    }

}



module.exports= router;
