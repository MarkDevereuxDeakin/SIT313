/**
https://www.tutorialspoint.com/styling-html-pages-in-node-js - accessed 18/08/2021
https://expressjs.com/en/guide/using-middleware.html - accessed 20/08/2021
 */

//dependencies
const https = require('https');
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const Customer = require('./models/Customer.js');
const mongoose = require("mongoose");
const expressValidator = require('express-validator');
const {body, check, checkSchema, validationResult} = require('express-validator');
const { join } = require("path");
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const { send } = require('process');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "/public")));

//sessions
app.use(session(
    {
        cookie: {maxAge: 120000},
        resave: false,
        saveUninitialized: false,
        secret: '<insert>'
    }
))

app.use(passport.initialize());
app.use(passport.session());

//mongoose 
mongoose.connect (<insert>, {useNewUrlParser:true, useUnifiedTopology: true});

//mongoose local database
//mongoose.connect('mongodb://localhost:27017/iServiceDB', {useNewUrlParser:true, useUnifiedTopology: true});

passport.use(Customer.createStrategy());
passport.serializeUser(Customer.serializeUser());
passport.deserializeUser(Customer.deserializeUser());

//routes
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/public/html/custlogin.html");
});

const htmlRouter = express.Router();
app.use('/html', htmlRouter);

htmlRouter.route('/custregister')
.get((request, response) => {
    response.sendFile(path.join(__dirname + '/html/custregister.html'));
})
htmlRouter.route('/custlogin')
.get((request, response) => {
    response.sendFile(path.join(__dirname + '/html/custlogin.html'));
})

let port = process.env.PORT;
if(port == null || port ==""){
    port = 8080;
}

app.listen(port, function(request, response)
{
    console.log("Server is running on port " + port)
});

//Postman debugging route 1. Retrieving, adding and removing ALL Customers
app.route('/customers')
    .get((req, res)=>{
        Customer.find((err, customerList) =>{
            if(err){res.send(err);}
            else{res.send(customerList);}
        })
    })
    .post((req, res) =>{
        const customer = new Customer({            
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password, 
            address: req.body.address,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            postcode: req.body.postcode,
            country: req.body.country
        })
        customer.save((err)=>{
            if(err) return handleError(err);
            else{res.send('Successfully added a new Customer!')}
        })
    })
    .delete((req, res)=>{
        Customer.deleteMany((err)=>{
            if(err){res.send(err)}
            else{res.send('Successfully deleted all Customers!')}
        })
    })

//Postman debugging route 2. Retrieving, updating and removing a specific Customer
app.route('/customers/:id')
.get((req, res)=>{
    Customer.findOne({_id: req.params.id}, (err, foundCustomer)=>{
        if(foundCustomer){res.send(foundCustomer)}
        else{res.send("No matching Customer found!")}
    })
})    
.patch((req, res)=>{    
    Customer.updateOne({_id: req.params.id}, {$set: req.body}, (err, foundCustomer)=>{
        if(foundCustomer){res.send('Successfully upddated Customer: ' + req.params.id)}
        else{res.send(err)};
    })
})
.delete((req, res)=>{
    Customer.deleteOne({_id: req.params.id}, (err, foundCustomer)=>{
        if(foundCustomer){res.send('Successfully deleted Customer: ' + req.params.id)}
        else{res.send(err)}
    })
})

app.post("/custlogin",
//check that a VALID email has been entered (REQUIRED)
check('email')
.trim()
.notEmpty()
.withMessage('Please enter your Email Address!')
.isEmail()
.withMessage('Email Address is not valid!!')
.toLowerCase(),
//check that a password has been entered (REQUIRED) AND matches the password confirmation input
check('password')
.notEmpty()
.withMessage('Please enter a Password!!')
.isLength({min:8})
.withMessage('Password must be at least 8 characters long!!'),

async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);     

    if (!errors.isEmpty()) {        
        return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;    
    const password = req.body.password;

    
    Customer.findOne({email:email})
    .then(customer => {        
        if (customer){
            bcrypt.compare(password, customer.password, function(err, result){
                if(err){
                    console.log(err)
                    res.status(400).json({
                        error: err
                    })
                }
                if(result){
                    //res.sendFile(__dirname + "/public/html/custtask.html");
                    console.log('Login Successful');
                    res.status(200).json({
                        message: 'Login Successful!!'
                    })
                    
                }
                else {
                    console.log('Username and/or Password is Incorrect!!')
                    res.status(400).json({
                        message: 'Username and/or Password is Incorrect!!'
                    })
                }
            })
        }
        else {
            console.log('User Does Not Exist')            
            res.status(400).json({
                message: 'Username and/or Password is Incorrect!!'
            })          

        }
        
    }).catch((err) => console.log(err));   
    
})

app.post("/custregister",
    //check that a first name has been entered (REQUIRED)
    check('first_name')
    .trim()
    .notEmpty()
    .withMessage('Please enter your First Name!')
    .toUpperCase(),
    //check that a last name has been entered (REQUIRED)
    check('last_name')
    .trim()
    .notEmpty()
    .withMessage('Please enter your Last Name!')
    .toUpperCase(),
    //check that a VALID email has been entered (REQUIRED)
    check('email')
    .trim()
    .notEmpty()
    .withMessage('Please enter your Email Address!')
    .isEmail()
    .withMessage('Email Address is not valid!!')
    .toLowerCase(),
    //check that a password has been entered (REQUIRED) AND matches the password confirmation input
    check('password')
    .notEmpty()
    .withMessage('Please enter a Password!!')
    .isLength({min:8})
    .withMessage('Password must be at least 8 characters long!!')
    .custom((value, {req}) => {
        if(value !== req.body.password_confirm){
            throw new Error('Passwords do not match!!');
        }
        return true;
    }),
    //check that an address has been entered (REQUIRED)
    check('address')
    .trim()
    .notEmpty()
    .withMessage('Please enter your Postal Address!')
    .toUpperCase(),
    //check that a city has been entered (REQUIRED)
    check('city')
    .trim()
    .notEmpty()
    .withMessage('Please enter your City!')
    .toUpperCase(),
    //check that a state has been entered (REQUIRED)
    check('state')
    .trim()
    .notEmpty()
    .withMessage('Please enter your State, Province or Region!'),
    //check that a country has been entered (REQUIRED)
    check('country')
    .notEmpty()
    .withMessage('Please enter your Country!'),

async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) {        
        return res.status(400).json({ errors: errors.array() });
    }

    const ApiKey = "<insert>";
    const list_Id = "<insert>";
    const url = "<insert>"//members/{subscriber_hash}/notes/{id}"
        
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email
    const mobile = req.body.mobile
    const password = req.body.password    
    const address = req.body.address
    const address2 = req.body.address2
    const city = req.body.city
    const state = req.body.state
    const postcode = req.body.postcode
    const country = req.body.country
    const data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: first_name,
                LNAME: last_name
            }
        }]
    }
    jsonData = JSON.stringify(data); 
    
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const customer = new Customer(
            {
                first_name: first_name,
                last_name: last_name,
                email:email,
                mobile: mobile,
                password:hashedPassword,                
                address:address + "" + address2,            
                city:city,
                state:state,
                postcode:postcode,
                country:country     
            }
        );

        customer.save(()=>{
            console.log("Inserted Successfully!")            
        return res.status(200).sendFile(__dirname + "/public/html/custlogin.html");
        })

        const options = {
            method: "Post",
            auth: "<insert>"
        }
    
        const request = https.request(url, options, (response) => {
            response.on("data", (data) => {
                console.log(JSON.parse(data))
            })
    
        })
    
        request.write(jsonData);
        request.end();
        
    } 
    catch {
        res.status(500).send();
    }
});



    





