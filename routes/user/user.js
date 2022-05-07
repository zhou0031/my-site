const express               = require('express')
const router                = express.Router()
const methodOverride        = require('method-override')
const {ROLE}                = require('../../data')
const {authRole}            = require('../../helper/auth')
const bcrypt                = require('bcrypt')
const BasicUser             = require('../../models/basicUser')
const emailValidator        = require('email-validator')
const {validateRecaptchaV2,validateRecaptchaV3}   = require('../../captcha/recaptcha')
const {RECAPTCHA}           = require('../../data')


const googleRoute=require('./google')


router.use("/google",googleRoute)


router.use(methodOverride('_method'))


/******************* Router ******************/
//signup page
router.get('/signup',checkNotAuthenticated, (req,res)=>{
    res.render('user/signup', 
    {
        basicUser: new BasicUser(),
        title:"Sign up"
    })
})

//user signup
router.post('/signup',validateRecaptchaV2,signup_handleRecaptcha,validateBasicSignup,isUserExisted,signup_handleUserExisted,async(req,res)=>{

    try{
        const hashedPassword = await bcrypt.hash(req.body.password1,10)
        const user = new BasicUser({email:req.body.email,password:hashedPassword})
        await user.save()
        res.redirect('/user')
    }catch{
        console.log("An error occured in creating a new user / 创建新用户出错")
        res.redirect('/user/signup')
    }
})

//login page
router.get('/',checkNotAuthenticated,(req,res)=>{
    return res.render('user/login',{title:"Sign in"})
})

//login user
router.post('/',validateRecaptchaV3,login_handleRecaptcha,async(req,res)=>{
    let errorMessages=[]
    let user
    try{
        user = await BasicUser.findOne({email:req.body.email})
        if(await bcrypt.compare(req.body.password, user.password)){
            //serialize user 
            req.session.basicUser={"id":user.id,"email":user.email}
            res.redirect('/user/index')
        }else{
            //password incorrect
            errorMessages.push("Wrong password")
            return res.status(401).render("user/login",{
                email:req.body.email,
                errorMessages:errorMessages
            })
        }
    }catch(error){
        if(user==null) {
            errorMessages.push(`User doesn't exist`)
            return res.status(403).render("user/login",{
                email:req.body.email,
                errorMessages:errorMessages
            })
        }
        console.log(error)
        return res.status(500).send("An error occured on server / 服务器出现故障")
    }
})

//logout user
router.delete('/',(req,res)=>{
    delete req.session.basicUser
    res.redirect('/user')
})

//dashboard
router.get('/index', checkAuthenticated, authRole(ROLE.BASIC), (req,res)=>{
    return res.render('user/index',{
        user:req.user
    })
})

/********************************* Functions ************************************/
//if captcha failed, re-login
function login_handleRecaptcha(req,res,next){
    if(res.captcha<RECAPTCHA.MIN_SCORE){
        let errorMessages=[]
        email = req.body.email
        errorMessages.push("Need to pass reCaptcha.")
        return res.status(401).render("user/login",{
            email:email,
            title: "Sign in - Recaptcha Test",
            errorMessages:errorMessages
        })
    }
    next()
}

//if captcha test failed, re-sign up
function signup_handleRecaptcha(req,res,next){
    if(!res.captcha){
        let errorMessages=[]
        email = req.body.email
        errorMessages.push("Need to pass reCaptcha.")
        return res.status(401).render("user/signup",{
            basicUser:new BasicUser({email:email}),
            title: "Sign up - Recaptcha Test",
            errorMessages:errorMessages
        })
    }
    next()
}

//validate basic signup inputs
function validateBasicSignup(req,res,next){
    let errorMessages=[]
    const {email,password1,password2}=req.body
    if(!emailValidator.validate(email))
        errorMessages.push("Enter a valid email.")
   
    if(password1=="" || password2=="")
        errorMessages.push("Enter passwords.")  
    else if(password1!==password2)
        errorMessages.push("Passwords are different.")

    if(errorMessages.length>0){
        return res.render("user/signup",{
            basicUser:new BasicUser({email:email}),
            title: "Sign up - Validation",
            errorMessages:errorMessages
        })
    }
    next()
}

//Check if user is already signed up in database
async function isUserExisted(req,res,next){
    try{  
        const basicUser = await BasicUser.findOne({email:req.body.email})
        if (basicUser !== null){
           res.basicUser=basicUser
        }
        next()
    }catch(error){
        console.log(error)
        res.status(500)
        return res.send("An error occured on server / 服务器出现故障")
    }
}

//if user existed, re-render signup page with error message 
function signup_handleUserExisted(req,res,next){
    if(res.basicUser){//user already existed
        return res.render("user/signup",{
            errorMessages:["User already existed"],
            title:`Sign up - ${res.basicUser.email} User already existed`,
            basicUser:new BasicUser({email:res.basicUser.email})
        })
    }
    next()
}

/*
If not authenticated, 
redirect to user login page 
which is at "/user" path
Otherwise, continue to user content page
*/
function checkAuthenticated(req,res,next){
    if(req.session.basicUser!=null){
        return next()
    }
    if(req.session.googleUser!=null){
        return next()
    }
    res.redirect('/user')
}

/*
If authenticated, redirect to user content page
Otherwise, continue on. 
This is userful when user already login, 
otherwise go back to login page at "/user" path
*/
function checkNotAuthenticated(req,res,next){
    if(req.session.basicUser!=null){
        return res.redirect('/user/index')
    }
    if(req.session.googleUser!=null){
        return res.redirect('/user/index')
    }
    next()
}


//Modue export
module.exports = router