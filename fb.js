const firebase = require('firebase')
require('dotenv').config()

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DB_URL,
    projectId: "mention-bot-telegram",
    storageBucket: "mention-bot-telegram.appspot.com",
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.APP_ID,
    measurementId: process.env.measurementId
}

firebase.initializeApp(firebaseConfig)

var email = "margaryan.gor.55@gmail.com";
var password = process.env.PASS;


module.exports.firebase = firebase
module.exports.fdb = firebase.database().ref()
module.exports.init = async () => {
    await firebase.auth().signInWithEmailAndPassword(email, password)
    console.log('User is successfully signed in')
}
