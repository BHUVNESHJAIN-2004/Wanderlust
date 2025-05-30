const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email :{
        type : String,
        required : true
    },
});

//here passport-local-mongoose automatically add usename and password field

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema); 