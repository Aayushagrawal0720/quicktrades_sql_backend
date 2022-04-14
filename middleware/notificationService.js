var admin = require("firebase-admin");
require("../firebaseFuncKey/firebaseKey");
const pool = require('../databaseconf/psqlconf');

module.exports= async (id, title, body) => {

    var query =`SELECT value FROM users WHERE key = 'notitoken' AND uid = '${id}';`;
    pool.query(query).then((result)=>{
        console.log(result.rows);
        if(result.rowCount>0){
            var row= result.rows[0];
            var token = row.value;
            const message = {
                notification: {
                    title: title,
                    body: body,
                },
                android: {
                    notification: {
                        // sound: 'default',
                        channel_id: "0"
                    }
                },
                apns: { headers: { 'apns-priority': '10' }, payload: { aps: { sound: 'default' } } },
                // apns: {
                //   payload: {
                //     aps: {
                //       sound: "default"
                //     }
                //   }
                // },
                token: token

            };


            admin.messaging().send(message).then((sn) => { }).catch((err) => {
                console.log(err)
            });
        }
    })
}

