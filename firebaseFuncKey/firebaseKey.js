var admin = require("firebase-admin");

var serviceAccount = require("../path/adminsdkkey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://stockadvisory-f4983.firebaseio.com"
});

module.exports = {
  admin,
  serviceAccount
}