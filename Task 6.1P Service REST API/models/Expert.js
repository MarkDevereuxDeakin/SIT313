const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const expertSchema = new mongoose.Schema(
    {  
        username: String,        
        password: String,
        address: String,
        mobile: String
    }
)

expertSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Expert", expertSchema);