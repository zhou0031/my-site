const mongoose = require('mongoose')
const {ROLE} = require("../data")


const adminUserSchema = new mongoose.Schema({
    username:{
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
        default:ROLE.ADMIN
    },
    name:{
        type:String,
        required:true,
        default:"Administrator / 管理员"
    }

})


module.exports = mongoose.model('AdminUser', adminUserSchema)
    

