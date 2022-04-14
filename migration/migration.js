const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');

router.get('/traderdata', (req, res)=>{
    var walletQuery = `INSERT INTO wallet (uid, key, value) VALUES `;
    var count =1;
    var walletCount=1;
    var walletDataSet=[];
    var dataSet=[];
    fs.readFile('./advisors.json','utf8', (err, jsonString)=>{
        if(err){
            console.log(err);
            res.send(err)
            return;
        }
        var traderData = JSON.parse(jsonString);
        var keys = Object.keys(traderData);
       keys.forEach(element => {
            var user = traderData[element];
            console.log(user)
            var userKeys= Object.keys(user);
            var uid = user['uid'];
            var email = user['email'];
            var accuracy = user['Accuracy'];
            var phone = user['phone_no']
            var name= user['name'].split(' ');
            var fname = name[0];
            var lname=''
            if(name.length>0){
                name.forEach((n)=>{
                    if(name.indexOf(n)!==0){
                        lname= n + ' ';
                    }
                })
            }

            var query = `INSERT INTO users (uid, key, value) VALUES ('${uid}', 'accuracy', '${accuracy}');`;
         //   query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}', 'email', '${email}');`;
           // query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}', 'mobile', '${phone}');`;
           // query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}', 'fname', '${fname}');`;
           // query = query + `INSERT INTO users (uid, key, value) VALUES ('${uid}', 'lname', '${lname}');`;

            pool.query(query).then((result)=>{
                console.log(result.rowCount);
            }).catch((excption)=>{
                console.log(excption);
            })
   /*         query= query + `($${count++},$${count++},$${count++}), `;
            dataSet.push(uid);
            dataSet.push('usertype')
            dataSet.push('advisor');

            userKeys.forEach((key)=>{

                    if(key === 'email'){
                        query= query + `($${count++},$${count++},$${count++}), `;
                        dataSet.push(uid);
                        dataSet.push('email')
                        dataSet.push(user['email']);
                    }else if(key ==='noti_token'){
                        query= query + `($${count++},$${count++},$${count++}), `;
                        dataSet.push(uid);
                        dataSet.push('notitoken')
                        dataSet.push(user['noti_token']);
                    }else if(key ==='phone_no'){
                        query= query + `($${count++},$${count++},$${count++}), `;
                        dataSet.push(uid);
                        dataSet.push('mobile')
                        dataSet.push(user['phone_no']);
                    }else if(key ==='name'){
                        query= query + `($${count++},$${count++},$${count++}), `;
                        query= query + `($${count++},$${count++},$${count++}), `;

                        var name= user['name'].split(' ');
                        var fname = name[0];
                        var lname
                        name.forEach((n)=>{
                            if(name.indexOf(n)!==0){
                                lname= n + ' ';
                            }
                        })
                        dataSet.push(uid);
                        dataSet.push('fname')
                        dataSet.push(fname);

                        dataSet.push(uid);
                        dataSet.push('lname')
                        dataSet.push(lname);
                    }

            })

        });
        query = query.substring(0,query.lastIndexOf(','));
            console.log(query);
        pool.query(query, dataSet).then((res)=>{
            console.log(res.rowCount);
        }).catch((err)=>{
            console.log(err);
        });*/
        //res.send(traderData);
        //return;
        
    })
    });
});


router.get('/exportanalysis', (req, res)=>{
    var query =`INSERT INTO analysis (title, description, image) VALUES`;
    var dataSet=[];
    var count =1;
    fs.readFile('analysis.json', 'utf8', (err,  jsonString)=>{
        if(err){
            console.log(err);
            res.send(err)
            return;
        }else{
            var analysisData = JSON.parse(jsonString);
            var keys = Object.keys(analysisData);
            keys.forEach(element=>{
                var anaData = analysisData[element];
                var description = anaData['desc'];
                var img = anaData['img'];
                query = query + ` ($${count++},$${count++},$${count++}),`;
                dataSet.push(element);
                dataSet.push(description);
                dataSet.push(img);
            })

            query = query.substring(0,query.lastIndexOf(','));
            console.log(query);
            pool.query(query, dataSet).then((result)=>{
                res.send('done');
            }).catch((excption)=>{
                console.log(excption);
                res.send(excption);
            })
        }
    })
})


router.get('/calls', (req, res)=>{
    var query = `INSERT INTO calls (recordtype, scriptname, subrecordtype, analysisimageurl, analysistitle, tradetype, date, description, entryltp, entryprice, exchange, instrumenttoken, tradingsymbol, status, slprice, slprice2, targetprice, targetprice2, uid,cid) VALUES `;

    var dataSet=[];
    var count = 1;
    fs.readFile('calls.json', 'utf8', (err, jsonString)=>{
        if(err){
             console.log(err);
            res.send(err)
            return;
        }else{
            var callsData = JSON.parse(jsonString);
            var keys = Object.keys(callsData);
            keys.forEach((element)=>{
                var callData = callsData[element];
                query = query + ` ($${count++},$${count++},$${count++},$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++} ,$${count++}),`;
                dataSet.push(callData['Record_Type'])
                dataSet.push(callData['Script Name'])
                dataSet.push(callData['Sub_record_Type'])
                dataSet.push(callData['analysisImageUrl'])
                dataSet.push(callData['analysisTitle'])
                if(callData['buySell']==0){
                    dataSet.push('buy')
                }else if(callData['buySell']==1){
                    dataSet.push('sell')
                }
                dataSet.push('NOW()');
                dataSet.push(callData['description'])
                dataSet.push(parseInt(callData['entry_ltp']));
                dataSet.push(parseInt(callData['entry_price']))
                dataSet.push(callData['exchange'])
                dataSet.push(callData['instrument_token'])
                dataSet.push(callData['tradingsymbol'])
                dataSet.push(callData['status'])
                dataSet.push(parseInt(callData['stop_loss']))
                dataSet.push(parseInt(callData['SL Price 2']))
                dataSet.push(parseInt(callData['target_value']))
                dataSet.push(parseInt(callData['target_value_2']))
                dataSet.push(callData['uid'])
                dataSet.push(callData['cid'])
            })
            query = query.substring(0,query.lastIndexOf(','));
                console.log(query);
            pool.query(query, dataSet).then((result)=>{
                res.send('done');
            }).catch((excption)=>{
                console.log(excption);
                res.send(excption);
            })

        }
    })
})


router.get('/packagess', (req, res)=>{
    var query =``;
    var dataSet=[];
    var uUids={};
    fs.readFile('packages.json', 'utf8', (err, jsonString)=>{
        if(err){
            console.log(err);
            res.send(err)
            return;
        }else{
            console.log(jsonString);
            var packageData = JSON.parse(jsonString);
            var packageKey = Object.keys(packageData);
            packageKey.forEach((key)=>{
                console.log(key);
                var pack = packageData[key];
                uUids[pack['uid']] = pack['uid'];


            })

            var uniqueUids = Object.keys(uUids);
            uniqueUids.forEach((uid)=>{

                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONECALL}',50);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEDAY}',200);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEWEEK}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEMONTH}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_THREEMONTHS}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_SIXMONTHS}',0);`;
                query = query + `INSERT INTO packages (uid, duration, amount) VALUES ('${uid}','${dbconstants.DB_ONEYEAR}',0);`;
            })



            pool.query(query).then((result)=>{
                res.send('done');
            }).catch((excption)=>{
                console.log(excption);
                res.send(excption);
            })
        }
    })

})

module.exports= router;









