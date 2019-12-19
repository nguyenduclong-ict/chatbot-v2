const admin = require("firebase-admin");
var serviceAccount = require("../config/firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://webhook-2306.firebaseio.com"
});
