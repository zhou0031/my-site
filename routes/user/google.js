const express               = require('express')
const router                = express.Router()
const GoogleUser             = require('../../models/googleUser')
const methodOverride        = require('method-override')
const {OAuth2Client}        = require('google-auth-library');
const client                = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID);


router.use(methodOverride('_method'))


//signin google user
router.post("/",verifyGoogleIdToken,isUserExisted,google_handleUserExisted,(req,res)=>{
    if(res.payload!=null){
        payload=res.payload
        req.session.googleUser = {"id":payload.sub,"email":payload.email}
        return res.json({"signedin":true})
    }
    return res.json({"signedin":false})
})

//signout google user
router.delete('/',(req,res)=>{
    delete req.session.googleUser
    res.redirect('/user')
})


/****************************** Functions ********************************/
async function verifyGoogleIdToken(req,res,next){
    const token = req.body.id_token
    
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_AUTH_CLIENT_ID
        })
        const payload = ticket.getPayload()
        
        if(payload['aud']==process.env.GOOGLE_AUTH_CLIENT_ID){
            res.payload=payload
            next()
        }
        else
            return res.status(401).send("the app is not intended for the user 客户端请求与Client ID 不符（GOOGLE_AUTH_CLIENT_ID）")
    }catch(error){
        console.log(error)
    }
}

//check if googe user already existed
async function isUserExisted(req,res,next){
    try{  
        const googleUser = await GoogleUser.findOne({email:res.payload.email})
        if (googleUser !== null)//google user already in database
           res.googleUser=googleUser
        next()
    }catch(error){
        console.log(error)
        return res.status(500).send("isUserExisted: An error occured on server / 服务器出现故障")
    }
}

async function google_handleUserExisted(req,res,next){
    if(!res.googleUser){//create a new google user
        const googleUser = new GoogleUser({email:res.payload.email, name:res.payload.name,google_id:res.payload.sub})
        await googleUser.save()
    }
    next()
}


//Module export
module.exports = router