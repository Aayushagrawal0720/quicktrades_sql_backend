const router = require('express').Router();
const pool = require('../databaseconf/psqlconf');
const fs = require('fs');
const { getJSONResponse } = require('../functions/responsefunction');
const dbconstants = require('../constants/dbconstants');
const text = require('../constants/text');
const errorcodes = require('../constants/errorcodes');
const {searchInstruumentToken} = require('../broker_service/instruments/fetchinstruments');


router.post('/searchinstrument', (req, res)=>{
    try{
        var {search} = req.body;
        if(search){
            searchInstruumentToken(search, (searchResult)=>{
                res.send(getJSONResponse(true, '', text.TEXT_SUCCESS, searchResult));
                return;
            })
        }else{
            res.send(getJSONResponse(false, errorcodes.INVALID_REQUEST, text.TEXT_INVALIDREQUEST, {}));
            return;
        }
    }catch(err){
        console.log(err);
        res.send(getJSONResponse(false, errorcodes.SOMETHING_WENT_WRONG, text.TEXT_SOMETHINGWENTWRONG,{}));
        return;
    }
})



module.exports= router;
