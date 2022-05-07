const mongoose = require('mongoose')
const {ROLE} = require("../data")
const Address = require("./address")


const googleUserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    google_id:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        default:ROLE.BASIC
    },
    createdOn:{
        type:Date,
        default:Date.now
    },
    address: Address.schema
})


module.exports = mongoose.model('GoogleUser', googleUserSchema)