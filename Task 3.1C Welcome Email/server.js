/**
https://www.tutorialspoint.com/styling-html-pages-in-node-js - accessed 18/08/2021
https://www.sololearn.com/Discuss/2209052/css-doesn-t-load-into-my-html-code-using-node-js/ * accessed 18/08/2021
https://expressjs.com/en/guide/using-middleware.html - accessed 20/08/2021
https://www.youtube.com/watch?v=nukNITdis9g - accessed 20/08/2021
https://express-validator.github.io/docs/custom-validators-sanitizers.html - accessed 21/08/2021
https://express-validator.github.io/docs/check-api.html - accessed 21/08/2021
 */

const https = require('https');
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const validator = require("validator");
const expressValidator = require('express-validator');
const {body, check, checkSchema, validationResult} = require('express-validator');
const { join } = require("path");
const { nextTick } = require("process");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/index.html");
});

app.listen(8080, function(request, response)
{
    console.log("Server is running on port 8080!")
});

mongoose.connect ("mongodb://localhost:27017/iServiceDB", {useNewUrlParser:true});


const customerSchema = new mongoose.Schema(
    {
        first_name:{
            type: String,
            /*required: [true, 'Please enter your first name!'],
            trim: true,
            uppercase: true*/
        },
        last_name:{
            type: String,
            /*required: [true, 'Please enter your last name!'],
            trim: true,
            uppercase: true*/
        },
        email:{
            type: String,
            /*required: [true, 'Please enter your email address!'],
            trim: true,            
            lowercase: true,            
            validate: [validator.isEmail, 'Please enter a valid email address!']*/
        },        
        mobile:{
            type: Number,
            trim:true,
            min:10,
            max:10
        },
        password:{                   
            type: String,            
            /*minlength: [8, 'Password must be atleast EIGHT characters long!!'],
            required: [true, 'Please enter a password']*/
        },
        password_confirm:{
            type: String,
            /*required: [true, 'Please confirm your password!!']*/
                        
        },
        address:{
            type: String,
            /*trim: true,
            uppercase: true,
            required: [true, 'Please provide an address!!']*/
        },
        address2:{
            type:String,
            /*trim: true,
            uppercase: true*/
        },
        city:{
            type: String,
            /*trim: true,
            uppercase: true,
            required: [true, 'Please enter your city!!']*/
        },
        state:{
            type: String,
            /*trim: true,
            uppercase: true,
            required: [true, 'Please enter your state!!']*/
        },
        postcode:{
            type: String
        },
        country:{
            type: String,
            /*required: [true, 'Please select your country!!']*/
        },

    }
);

const Customer = mongoose.model("Customer", customerSchema);

app.post("/",
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

(req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) {        
        return res.status(400).json({ errors: errors.array() });
    }

    const ApiKey = "<insert>";
    const list_Id = "<insert>";
    const url = "<insert>"
    
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email
    const mobile = req.body.mobile
    const password = req.body.password
    const password_confirm = req.body.password_confirm
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

    console.log(first_name, last_name, email, mobile, password, password_confirm, address, address2, city, state, postcode, country);

    
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
    
    const customer = new Customer(
        {
            first_name: first_name,
            last_name: last_name,
            email:email,
            mobile: mobile,
            password:password,
            password_confirm:password_confirm,
            address:address + "" + address2,            
            city:city,
            state:state,
            postcode:postcode,
            country:country     
        }
    );

    customer.save(()=>{
        console.log("Inserted Successfully!")
    return res.status(200);
    })
});


    





