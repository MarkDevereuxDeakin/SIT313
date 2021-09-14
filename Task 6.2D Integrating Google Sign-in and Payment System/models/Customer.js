const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const customerSchema = new mongoose.Schema(
    {
        first_name:{
            type: String           
        },
        last_name:{
            type: String
        },
        email:{
            type: String
        },        
        mobile:{
            type: Number,
            trim:true,
            min:10,
            max:10
        },
        password:{                   
            type: String
        },
        password_confirm:{
            type: String                        
        },
        address:{
            type: String
        },
        address2:{
            type:String
        },
        city:{
            type: String
        },
        state:{
            type: String
        },
        postcode:{
            type: String
        },
        country:{
            type: String
        },

    }
);

customerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Customer", customerSchema);