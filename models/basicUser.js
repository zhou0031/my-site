const mongoose = require('mongoose')
const {ROLE} = require("../data")
const Address = require("./address")


const basicUserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
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


module.exports = mongoose.model('BasicUser', basicUserSchema)