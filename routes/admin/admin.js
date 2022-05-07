const express = require('express')
const router  = express.Router()
const methodOverride = require('method-override')
const {ROLE} = require('../../data')
const {authRole} = require('../../helper/auth')
const {validateRecaptchaV3}   = require('../../captcha/recaptcha')
const {RECAPTCHA} = require('../../data')
const {setAdmin} = require('../../helper/helper')
const categoryRoute=require("./category")


router.use("/category",checkAuthenticated,categoryRoute)
router.use(methodOverride('_method'))
router.use(setAdmin)


//Passport 
const passport = require('passport')
const { initializePassportAdmin } = require('../../passport-config')
const AdminUser = require('../../models/adminUser')
initializePassportAdmin(
    passport,
    username=> AdminUser.findOne({username:username}),
    id => AdminUser.findById(id)
)


/************************** Routes *****************************/
//login page
router.get('/',checkNotAuthenticated,(req,res)=>{
    res.render('admin/login',
        {
            "title":"Admin panel",
            'admin':req.session.admin
        })
})

//login user
router.post('/',validateRecaptchaV3,login_handleRecaptcha,
    (req,res,next)=>{
        req.session.admin=req.body.username
        next()
    },
    passport.authenticate('localAdmin',{
    successRedirect:'/admin/index',
    failureRedirect:'/admin',
    failureFlash:true
}))

//log out
router.delete('/',(req,res)=>{
    req.logOut()
    delete req.session.admin
    delete req.session.passport
    res.redirect('/admin')
})

//admin dashboard
router.get('/index',checkAuthenticated,authRole(ROLE.ADMIN),(req,res)=>{
    res.render('admin/index',
    {
        "name":req.user.name,
        "title":"Admin panel"
    })
})
    

/******************************** Functions ***********************************/
//if captcha failed, re-login
function login_handleRecaptcha(req,res,next){
    if(res.captcha<RECAPTCHA.MIN_SCORE){
        return res.redirect("/admin")
    }
    next()
}

/*
If not authenticated, 
redirect to admin login page 
which is at "/admin" path
Otherwise, continue to admin content page
*/
function checkAuthenticated(req,res,next){
    if(req.session.passport!=null){
        return next()
    }
    res.redirect('/admin')
}

/*
If authenticated, redirect to admin content page
Otherwise, continue on. 
This is userful when admin already login, 
otherwise go back to login page at "/admin" path
*/
function checkNotAuthenticated(req,res,next){
    if(req.session.passport!=null){
       return res.redirect('/admin/index')
    }
    next()
}


//export module
module.exports = router