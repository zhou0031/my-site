const LocalStrategy = require('passport-local').Strategy
const bcrypt = require ('bcrypt')
const {ROLE} = require('./data')

/********************   Initilize Admin *************************/
function initializePassportAdmin(passport,getUserByUsername,getUserByID){
    
    const authenticateAdmin = async(username, password, done) => {
        const admin = await getUserByUsername(username)
        if(admin == null){
            return done(null,false,{message:"No admin with that username / 管理员用户名不存在"})
        }

        if (admin.role !== ROLE.ADMIN){
            return done(null,false,{message:"Not Authorized / 没有管理员权限"})
        }
        
        //admin username is right
        try{
            if(await bcrypt.compare(password, admin.password)){//find admin user
                return done(null, admin)
            } else {//admin password didn't match
                return done(null,false,{message: "Admin password incorrect / 管理员密码有错"})
            }
        }catch(e){
            return done(e)
        }
    }

    passport.use('localAdmin',new LocalStrategy({
        usernameField:"username"
    },authenticateAdmin))
    
    passport.serializeUser((admin,done)=> done(null, admin.id))
    passport.deserializeUser(async(id,done)=>{
        return done(null, await getUserByID(id))
    })
}


module.exports =  { 
    initializePassportAdmin,
}