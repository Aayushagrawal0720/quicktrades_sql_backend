const { SmartAPI } = require("smartapi-javascript");
const fs = require('fs');
const {connectWebsocket, closeSocketConnection} = require("../broker_ltp/broker_ltp");
const {fetchInstrumentTokens} = require("../instruments/fetchinstruments");
const cron = require('node-cron');

//READ JSON FILE CONTAINING TOKENS FOR ANGEL BROKING API
var data= fs.readFileSync('broker_service/tokens.json');
var jsonToken= JSON.parse(data.toString());

const {ab_api_key, ab_aayush_un, ab_aayush_pw, jwtToken,refreshToken,feedToken} =jsonToken;

//CREATING NEW SMARTAPI INSTANCE 
let smart_api= new SmartAPI({
    api_key:ab_api_key
});

//brokerLogin() FUNCTION WILL BE CALLED FROM index.js FILE TO GENERATE ANGEL BROKING SESSION 
function brokerLogin(){
    //generateSession() WILL GENERATE JWT, REFERESH AND FEED TOKEN THAT WILL BE STORED TO tokens.json FILE
    //token.js FILE WILL BE AVAILABLE TO ALL .js FILES
    smart_api.generateSession(ab_aayush_un,ab_aayush_pw).then((data)=>{
        var sessionData= data.data;
        jsonToken['jwtToken'] = sessionData['jwtToken'];
        jsonToken['refreshToken'] = sessionData['refreshToken'];
        jsonToken['feedToken'] = sessionData['feedToken'];
        //WRITING tokens.json FILE WITH NEW TOKENS DURING INITIALISATION OF SERVER OR AFTER EXPIRATION OF SESSION
        fs.writeFileSync('broker_service/tokens.json',JSON.stringify(jsonToken));

        //CALLING connectWebsocket() WILL CONNECT TO ANGEL BROKING WEBSOCKET FOR MARKET WATCH
        connectWebsocket();

        //FETCHING INSTRUMENTS
        fetchInstrumentTokens();
    }).catch(err=>{
        console.log(err);
    });
}

//HOOK TO WATCH SESSION EXPIRATION
smart_api.setSessionExpiryHook(customSessionHook);

//customSessionHook() WILL LOGOUT EXISTING AB API, DISCONNECT WEBSOCKET AND REGENERATE SESSION
function customSessionHook() {
    smart_api.logout();
    closeSocketConnection();
    brokerLogin();
}

cron.schedule('* 8 * * *',()=>{
    customSessionHook();
})

module.exports = brokerLogin;