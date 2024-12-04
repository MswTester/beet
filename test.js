const express = require('express')
const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyAmqNS5JpDe9XSgdMXJI0ju626RaA7av-4",
    authDomain: "weflash-0153.firebaseapp.com",
    databaseURL: "https://weflash-0153-default-rtdb.firebaseio.com",
    projectId: "weflash-0153",
    storageBucket: "weflash-0153.firebasestorage.app",
    messagingSenderId: "1089313427482",
    appId: "1:1089313427482:web:0e75055ddfca55dd8341a3",
};

firebase.initializeApp(firebaseConfig);
let database = firebase.database();

const app = express();

app.post('/', (req, res) => {
    const json = req.body;
    database.ref('entries').set({
        name:json.name,
        message:json.message,
        comment:json.comment
    }, (error) => {
        console.log(error)
    })
    res.json({ok:true})
})

app.listen(3000, () => {
    console.log('listen')
})