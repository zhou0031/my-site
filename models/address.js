const mongoose = require('mongoose')


const addressSchema = new mongoose.Schema({
    street_number: {
        type: Number,
        required:true
    },
    street_name: {
        type: String,
        required:true
    },
    suite: String,
    city: {
        type: String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country: {
        type:String,
        required:true
    },
    postal_code:{ 
        type: String,
        required:true
    },
    phone:{
        type:String,
        required:true
    }
})


module.exports = mongoose.model("Address", addressSchema)