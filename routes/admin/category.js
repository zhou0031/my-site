const express  = require("express")
const router   = express.Router()
const Category = require("../../models/category")
const methodOverride = require("method-override")

router.use(methodOverride("_method"))

router.get("/",(req,res)=>{
    res.render("admin/category")
})





module.exports=router
