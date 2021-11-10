//dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const { join } = require("path");
const Expert = require('./models/Expert.js');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const { send } = require('process');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.static("/public"));
app.use(express.static(path.join(__dirname, "/public")));
/*app.use(session(
    {
        cookie: {maxAge: 120000},
        resave: false,
        saveUninitialized: false,
        secret: '<insert>'
    }
))

app.use(passport.initialize());
app.use(passport.session());*/

//mongoose
mongoose.connect('mongodb://localhost:27017/iServiceDB', {useNewUrlParser:true, useUnifiedTopology: true});
/*passport.use(Expert.createStrategy());
passport.serializeUser(Expert.serializeUser());
passport.deserializeUser(Expert.deserializeUser());*/

//routes
//1. Retrieving, adding and removing ALL experts
app.route('/experts')
    .get((req, res)=>{
        Expert.find((err, expertList) =>{
            if(err){res.send(err);}
            else{res.send(expertList);}
        })
    })
    .post((req, res) =>{
        const expert = new Expert({
            username: req.body.username,
            password:req.body.password,
            address:req.body.address,
            mobile:req.body.mobile
        })
        expert.save((err)=>{
            if(err) return handleError(err);
            else{res.send('Successfully added a new Expert!')}
        })
    })
    .delete((req, res)=>{
        Expert.deleteMany((err)=>{
            if(err){res.send(err)}
            else{res.send('Successfully deleted all Experts!')}
        })
    })

//2, 3, 4. Retrieving, updating and removing a specific expert
app.route('/experts/:id')
.get((req, res)=>{
    Expert.findOne({_id: req.params.id}, (err, foundExpert)=>{
        if(foundExpert){res.send(foundExpert)}
        else{res.send("No matching expert found!")}
    })
})    
.patch((req, res)=>{
    
    Expert.updateOne({_id: req.params.id}, {$set: req.body}, (err, foundExpert)=>{
        if(foundExpert){res.send('Successfully upddated Expert: ' + req.params.id)}
        else{res.send(err)};
    })
})
.delete((req, res)=>{
    Expert.deleteOne({_id: req.params.id}, (err, foundExpert)=>{
        if(foundExpert){res.send('Successfully deleted Expert: ' + req.params.id)}
        else{res.send(err)}
    })
})

let port = 8080;
if(port == null || port ==""){
    port = 8080;
}

app.listen(port, function(request, response)
{
    console.log("Server is running on port " + port)
});
