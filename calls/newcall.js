const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const notification = require('../middleware/notificationService');

 const {createClient} = require('redis');

 var redisClient=  createClient();

 redisClient.connect().then((val)=>{
    }).catch((err)=>{
    console.log(err)
});
const subscriber = redisClient.duplicate();

subscriber.connect().then(async (v)=>{
    subscriber.subscribe('it', (message)=>{
        console.log(message);
    })
}).catch((err)=>{
    console.log(err);
});

const publisher = redisClient.duplicate();

publisher.connect().then(async (v)=>{

}).catch((err)=>{
    console.log(err);
});



router.post('/newcall', (req, res) => {
    publisher.publish('it',"{it:'instrumenttoken'}")
    res.send({it:'instrumenttoken'})
  /*  try {
        var { recordtype, slprice2, scriptname, subrecordtype, analysisimageurl, analysistitle, tradetype, description, entryltp, entryprice, exchange, instrumenttoken, ltp, status, slprice, targetprice, targetprice2, tradingsymbol, uid } = req.body;
        getCallInsertQuery(recordtype, slprice2, scriptname, subrecordtype, analysisimageurl, analysistitle, tradetype, description, entryltp, entryprice, exchange, instrumenttoken, ltp, status, slprice, targetprice, targetprice2, tradingsymbol, uid, (err, query, cid) => {
            if (err) {
                console.log(err);
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            } else {
                pool.query(query,[recordtype, slprice2, scriptname, subrecordtype, analysisimageurl, analysistitle, tradetype, description, entryltp, entryprice, exchange, instrumenttoken, status, slprice, targetprice, targetprice2, tradingsymbol, uid]).then((result) => {
                    if (result.rowCount > 0) {
                        res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, {}));

                     /*   axios({method: 'post',
                            url: 'http://172.26.0.102:3001/newtoken',
                            data: {
                            it:instrumenttoken
                        }}).then((response)=>{
                            console.log('then response');
                            console.log(response.data);
                        }).catch((err)=>{
                            console.log('catch response');
                            console.log(err);
                        })
                        subscriber.publish('it',{it:instrumenttoken})
                        sendCallToUser(uid, cid);
                        sendNotificationToSubscribers(scriptname, uid);
                        return;
                    } else {
                        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
                        return;
                    }
                }).catch((err) => {
                    console.log(err);
                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
                    return;
                });
            }
        });
    } catch (err) {
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
        return;
    }*/
});

function setInstrumentToken(instrumenttoken){
    axios({method: 'post',
        url: 'http://172.26.0.102:3001/newtoken',
        data: {it:instrumenttoken}
    }).then((response)=>{
    }).catch((err)=>{
        console.log('catch response');
        console.log(err);
    })
}

function getCallInsertQuery(recordtype, slprice2, scriptname, subrecordtype, analysisimageurl, analysistitle, tradetype, description, entryltp, entryprice, exchange, instrumenttoken, ltp, status, slprice, targetprice, targetprice2, tradingsymbol, uid, cb) {

    var query = `INSERT INTO calls (${dbconstants.DB_RECORD_TYPE}, ${dbconstants.DB_SLPRICE2}, ${dbconstants.DB_SCRIPTNAME}, ${dbconstants.DB_SUBRECORDTYPE}, ${dbconstants.DB_ANALYSISIMAGEURL}, ${dbconstants.DB_ANALYSISTITLE}, ${dbconstants.DB_BUYSELL}, ${dbconstants.DB_DESCIPTION}, ${dbconstants.DB_ENTRYLTP}, ${dbconstants.DB_ENTRYPRICE}, ${dbconstants.DB_EXCHANGE}, ${dbconstants.DB_INSTRUMENTTOKEN}, cid,${dbconstants.DB_STATUS}, ${dbconstants.DB_SLPRICE},${dbconstants.DB_TARGETVALUE},${dbconstants.DB_TARGETVALUE2},${dbconstants.DB_TRADINGSYMBOL}, ${dbconstants.DB_UID}, ${dbconstants.DB_DATE}) VALUES (`;
    var cid = uuidv4();
    if (recordtype) {
        query = query + `$1,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (slprice2) {
        query = query + `$2,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (scriptname) {
        query = query + `$3,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (subrecordtype) {
        query = query + `$4,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (analysisimageurl) {
        query = query + `$5,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (analysistitle) {
        query = query + `$6,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (tradetype) {
        query = query + `$7,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (description) {
        query = query + `$8,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (entryltp) {
        query = query + `$9,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (entryprice) {
        query = query + `$10,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (exchange) {
        query = query + `$11,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (instrumenttoken) {
        query = query + `$12,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (cid) {
        query = query + `'${cid}',`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (status) {
        query = query + `$13,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (slprice) {
        query = query + `$14,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (targetprice) {
        query = query + `$15,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (targetprice2) {
        query = query + `$16,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (tradingsymbol) {
        query = query + `$17,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    if (uid) {
        query = query + `$18,`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    query = query + `NOW());`;
    cb(undefined, query, cid);
}


function sendCallToUser(uid, cid){
    var query = `SELECT uid FROM packagesubscription WHERE aid = '${uid}' AND status = 'Active';`;
    pool.query(query).then((result)=>{
        var rows = result.rows;
        rows.forEach((row)=>{
            var tid = row.uid;
            if(tid){
                var traderCallQuery = `INSERT INTO tradercalls (uid, cid) VALUES ('${tid}', '${cid}');`;
                pool.query(traderCallQuery).then((result)=>{

                }).catch((exception)=>{
                    console.log('---------/newcall------sendCallToUser 2----');
                    console.log(exception);
                });
            }
        })
    }).catch((exception)=>{
        console.log('---------/newcall------sendCallToUser----');
        console.log(exception);
    })
}


function sendNotificationToSubscribers(scriptname, uid){
    var query = `SELECT uid FROM packagesubscription WHERE aid = '${uid}'`;
    pool.query(query).then((result)=>{
        var rows = result.rows;
        rows.forEach((row)=>{
            var uid = row.uid;
            if(uid){
                notification(uid, 'New Call', `You got new ${scriptname} call from your analyst`);
            }
        })
    }).catch((exception)=>{
        console.log('---------/newcall------sendNotificationToSubscribers----');
        console.log(exception);
    })
}

module.exports = router;
