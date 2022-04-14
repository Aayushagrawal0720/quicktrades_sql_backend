const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');

router.post('/login', (req, res) => {
    try {
        var { phone_no, usertype } = req.body;
        getloginQuery(phone_no, (err, query) => {
            if (err) {
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }
            else {
                pool.query(query).then((result) => {
                    if (result.rowCount > 0) {
                        res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, result.rows));
                        return;
                    } else {
                        res.send(getJSONResponse(true, '', text.TEXT_USERNOTFOUND, {}));
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
    }
});

router.post('/register', (req, res) => {
    try {
        var { uid, fname, lname, mobile, email,photourl ,usertype } = req.body;

        checkForExistingEmailQuery(email, (err, emailQuery, dataSet)=>{
             if (err) {
                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                return;
            }else{
                pool.query(emailQuery, dataSet).then((result)=>{
                   if(result.rowCount>0){
                        res.send(getJSONResponse(true, '', 'Email already registered', {}));
                        return;
                    }else{
                        getRegisterQuery(uid, fname, lname, mobile, email,photourl ,usertype, (err, query) => {
                            if (err) {
                                res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
                                return;
                            } else {
                                pool.query(query).then((result) => {
                                    if (result.length > 0) {
                                        res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, {}));
                                    }
                                }).catch((err) => {
                                    console.log(err);
                                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
                                    return;
                                });
                            }
                        });
                    }
                }).catch((err) => {
                    console.log(err);
                    res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
                    return;
                });
            }
        })


    }
    catch (err) {
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG, {}));
        return;
    }
});

function checkForExistingEmailQuery(email, cb){
    try{
        var query = ``;
        var dataSet= [];
        if(email){
            query = query + `SELECT * FROM users WHERE key = $1 AND value = $2;`;
            dataSet.push(dbconstants.DB_EMAIL);
            dataSet.push(email);
        }else{
            cb(errorcodes.INVALID_REQUEST)
            return;
        }
    } catch (err) {
        console.log(err)
        cb(errorcodes.SOMETHING_WENT_WRONG)
        return;
    }
    cb(undefined, query, dataSet);
}

async function getRegisterQuery(uid, fname, lname, mobile, email,photourl ,usertype, cb) {
    try {
        var query = ``;
        if (uid) {
            if (fname) {
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_FNAME}','${fname}');`;
            } else {
                cb(errorcodes.INVALID_REQUEST)
                return;
            }
            if (lname) {
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_LNAME}','${lname}');`;
            } else {
                cb(errorcodes.INVALID_REQUEST)
                return;
            }
            if (mobile) {
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_MOBILE}','${mobile}');`;
            } else {
                cb(errorcodes.INVALID_REQUEST)
                return;
            }
            if (usertype) {
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_USERTYPE}','${usertype}');`;
            } else {
                cb(errorcodes.INVALID_REQUEST)
                return;
            }
            if (email) {
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_EMAIL}','${email}');`;
            }
            if (photourl) {
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_PHOTOURL}','${photourl}');`;
            }
            query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_NOTITOKEN}','null');`;
            if (usertype == text.TEXT_ADVISOR) {
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_ACCURACY}','0');`;
                query = query + `INSERT INTO wallet (uid, key, value) VALUES ('${uid}','${dbconstants.DB_WALLET}','0');`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONECALL}',50);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEDAY}',200);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEWEEK}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEMONTH}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_THREEMONTHS}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_SIXMONTHS}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEYEAR}',0);`;
            }
            if (usertype == text.TEXT_TRADER) {

                var result = await getNewUserCoupon()
                var amount='0'
                if(result===errorcodes.SOMETHING_WENT_WRONG){
                    amount='0';
                }else{
                    amount=result;
                }
                query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}','${dbconstants.DB_WALLET}','${amount}');`;

            }
            cb(undefined, query);
        } else {
            cb(errorcodes.INVALID_REQUEST)
            return;
        }
    } catch (err) {
        console.log(err)
        cb(errorcodes.SOMETHING_WENT_WRONG)
        return;
    }

}

async function getNewUserCoupon() {
    var query = `SELECT * FROM coupons WHERE key = '${dbconstants.DB_NEWUSER}' LIMIT 1;`;
    var result = await pool.query(query);
        if (result.rowCount > 0) {
            var row = result.rows;
            var amount = row[0]['value'];
            return amount;
        } else {
            return "0";
        }
}

function getloginQuery(phone_no, cb) {
    var query = ``;
    if (phone_no) {
        query = query + `SELECT * FROM users WHERE uid IN (SELECT uid FROM users WHERE key = '${dbconstants.DB_MOBILE}' AND value = '${phone_no}');`;
    } else {
        cb(errorcodes.INVALID_REQUEST);
        return;
    }
    cb(undefined, query);
}




module.exports = router;
