const { SmartAPI, WebSocket } = require("smartapi-javascript");
const fs = require('fs');
const {getTokenLength, getTokens, resetTokenList} = require('../../application_ltp/ltp_middleware');
const { emitSocketLtp } = require("../../application_ltp/app_ltp");
var socketConnected= false;

//READ JSON FILE CONTAINING TOKENS FOR ANGEL BROKING API
var data= fs.readFileSync('broker_service/tokens.json');
var jsonToken= JSON.parse(data.toString());

const {ab_api_key, ab_aayush_un, ab_aayush_pw, jwtToken,refreshToken,feedToken} =jsonToken;

//CREATING NEW AB WEBSOCKET CLIENT
let web_socket = new WebSocket({
    client_code: ab_aayush_un,   
    feed_token: feedToken
});

//connectWebsocket() IS CALLED AFTER NEW SESSION IS GENERATED FROM broker_login.js FILE
function connectWebsocket(){
    web_socket.connect()
    .then(() => {
        //ENABLING FLAG AFTER SUCCESSFULL CONNECTION OF AB WEBSOCKET
        socketConnected=true;
    //    getMarketTick('NSE','1594');
        getMarketTick();
    })


    //HOOK TO LISTEN NEW TICK FROM AB WEBSOCKET
    web_socket.on('tick', receiveTick)
}

//closeSocketConnection() IS CALLED AFTER SESSION IS EXPIRED FROM broker_login.js FILE
function closeSocketConnection(){
    socketConnected=false;
    web_socket.close();
    resetTokenList();
}

//getMarketTick(exchange, token) IS USED TO SEND TOKEN TO AB WEBSOCKET TO FETCH LTP
function getMarketTick(){
    if(socketConnected){
        setInterval(()=>{
            if(getTokenLength()>0){
                var tokens = getTokens();
                tokens.forEach((token)=>{
                    var exchange = token['exchange'];
                    var token = token['token'];
                    exchange = getExchangeSymbol(exchange);
                    web_socket.runScript(`${exchange}|${token}`,'mw');
                })

            }
        }, 1000)
    }
}

//RECIEVER FUNCTION TO HANDLE NEW TICK FROM AB WEBSOCKET
function receiveTick(data) {
    data.forEach((tick)=>{
        // console.log(tick);
        console.log(tick['ltp']);
        console.log(tick['tk']);
        
        if(tick['ltp']){

            emitSocketLtp({
                exchange: tick['e'],
                token: tick['tk'],
                ltp: tick['ltp']
            })
        }
    })
 }


//EXCHANGE SYMBOL DICTIONARY FROM AB API
function getExchangeSymbol(exchange){
    switch(exchange){
        case 'NSE' : return 'nse_cm'
        case 'BSE' : return 'bse_cm'
        case 'NFO' : return 'nse_fo'
        case 'MCX' : return 'mcx_fo'
        case 'NCDEX' : return 'ncx_fo'
        case 'CDS' : return 'cde_fo'
    }
}

module.exports ={connectWebsocket, closeSocketConnection, getMarketTick};