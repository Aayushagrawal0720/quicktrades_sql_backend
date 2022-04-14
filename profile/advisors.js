const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');

router.get('/analysts', (req, res)=>{
  try{
      var {tid} = req.headers;

    getAnalysist(tid, (err, result)=>{
        if(err){
            console.log('------/randomanalyst----------');
            console.log(err);
            res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
            return;
        }else{
            res.send(getJSONResponse(true,'',text.TEXT_SUCCESS, result));
            return;
        }
    })

    }catch(excpetion){
        console.log('------/randomanalyst----------');
        console.log(excpetion);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
})


function getAnalysist(tid, cb){
    var query =`SELECT * FROM users WHERE uid IN (SELECT uid FROM users WHERE key = '${dbconstants.DB_USERTYPE}' AND value = '${text.TEXT_ADVISOR}')`;
    pool.query(query).then((result)=>{
        getSubscribedAID(tid, (err, aids)=>{
            if(err){
                cb(err);
                return;
            }else{

                if(aids.length>0){
                    var advisors = result.rows;
                    var newRadvisor = [];
                    var newSadvisor = [];
                    advisors.forEach((advisor)=>{
                        if(aids.indexOf(advisor.uid)===-1){
                            newRadvisor.push(advisor);
                        }else{
                            newSadvisor.push(advisor);
                        }
                    })
                    cb(undefined, {'subscribed':newSadvisor, 'random': newRadvisor});
                }else{
                    cb(undefined, {'subscribed':[], 'random': result.rows});
                }
                return;
            }
        })
    }).catch((exception)=>{
        cb(exception);
    })
}


function getSubscribedAID(tid, cb){
    var query = `SELECT aid FROM packagesubscription WHERE uid = '${tid}' AND (status = 'Active' OR status = 'Pending')`;
    pool.query(query).then((result)=>{
        var rows = result.rows;
        var finalAids =[];
        rows.forEach((row)=>{
            finalAids.push(row.aid);
        })
      cb(undefined, finalAids);
    }).catch((exception)=>{
        console.log('------getSubscribedAID----/analysts--')
        console.log(exception);
        cb(exception);
    })
}



module.exports= router;

