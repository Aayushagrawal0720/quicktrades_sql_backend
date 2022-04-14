const express = require('express');
const app = express();
const http = require('http')
const port= 3001;
const path = require('path')
const cors = require('cors')
const server = http.createServer(app);

//APIs
const authentication = require('./auth/authentication');
const newcall= require('./calls/newcall');
const fetchAnalystCalls = require('./calls/fetch_analyst_calls')
const packageSubscription = require('./package/package_subscription');
const analystpackages = require('./package/analystpackages');
const updateAnalystPackage = require('./package/update_analyst_package')
const userCheck = require('./application/check_user_uid');
const searchInstrument = require('./application/search_instrument');
const advisorProfile  = require('./profile/advisor_profile');
const migration = require('./migration/migration');
const withdraw = require('./wallet/withdraw');
const advisors  = require('./profile/advisors');
const tradercalls = require('./calls/tradercalls');
const randomCalls = require('./calls/random_calls');
const analysis_pattern= require('./analysis_pattern/analysis_pattern');
const analysis_details = require('./analysis_pattern/pattern_details');
const transactions = require('./wallet/transaction_fetch')
const add_wallet = require('./wallet/add_wallet')
const notificationtoken = require('./application/notificationtoken');
const tradertoadvisor= require('./application/trader_to_advisor');
const walletfetchapi = require('./wallet/wallet_fetch_api');
const accuracy =  require('./profile/accuracy');

//BROKET FILES
const broker_login = require('./broker_service/broker_login/broker_login');
const brokerLogin = require('./broker_service/broker_login/broker_login');
const {createWebSocket} = require('./application_ltp/app_ltp');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', parameterLimit: 50000, extended: true }));
app.use(cors({
     "origin": "*",
}))
app.use(authentication);
app.use(newcall);
app.use(fetchAnalystCalls);
app.use(packageSubscription);
app.use(analystpackages);
app.use(updateAnalystPackage);
app.use(userCheck);
app.use(advisorProfile);
app.use(searchInstrument);
app.use(migration);
app.use(withdraw);
app.use(advisors);
app.use(tradercalls);
app.use(randomCalls);
app.use(analysis_pattern);
app.use(analysis_details)
app.use(transactions);
app.use(add_wallet);
app.use(notificationtoken);
app.use(tradertoadvisor);
app.use(walletfetchapi);
app.use(accuracy);

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/',(req, res)=>{
    res.sendFile('./public/index.html')
    // res.send('Quicktrades SQL Server');
});

//brokerLogin();

server.listen(port,()=>{
    //createWebSocket(server);
    console.log("listning to port "+ port);
})


