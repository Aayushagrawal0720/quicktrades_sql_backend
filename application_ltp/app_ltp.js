const express = require('express');
const app=  express();
const http = require('http')

const { setToken } = require('./ltp_middleware');

var gio;
function createWebSocket(expressApp){
    const io = require('socket.io')(expressApp);
    const WebSocket = require('ws');
    //const io = new WebSocket.Server({server:expressApp});

    gio=io;
    console.log('createWebSocket');
    io.on('connection', (socket)=>{
        console.log('New device connected');
        socket.emit('all','Hello new device');
        socket.on('ltp', (data)=>{
            console.log('ltp req: '+data);
            setToken(data);
           console.log(data);
        })
    })
}

function emitSocketLtp(data){
    /*
        data contains token, exchange, ltp
    */
    gio.emit(data['token'], data);
}


module.exports= {createWebSocket, emitSocketLtp}
