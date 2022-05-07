require('dotenv').config()

const compression = require('compression')
const express = require('express')
const app = express()
const passport = require('passport')
const {authUser} = require('./helper/auth')
const flash = require("express-flash")
const session = require("express-session")
const mongoDBStore = require('connect-mongodb-session')(session)
const {setBasicUser, setGoogleUser} = require('./helper/helper')


//Mongodb Session Store
const sessionStore = new mongoDBStore({
  uri:process.env.DATABASE_URL,
  collection:"sessions"
})
sessionStore.on('error',function(error){
  console.log("An error occured in session connecting to mongo db / 数据库服务器出现Session链接故障")
})
  

//Session middleware
sessionMiddleware=session({
  name:"selltobacco",
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false,
  unset:'destroy',
  store:sessionStore,
  cookie:{
    maxAge:14400000
  }
})


//App
app.set('view engine', 'pug')
app.set('views',__dirname+'/views')
app.use(express.static('public'))
app.use(express.static('files'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(compression())
app.use(flash())
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())


//deseriazlize user
app.use(setBasicUser)
app.use(setGoogleUser)


//Paypal
const paypal = require("@paypal/checkout-server-sdk")
const Paypal_Environment = process.env.NODE_ENV === "production" 
  ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Paypal_Environment(process.env.PAYPAL_CLIENT_ID,process.env.PAYPAL_SECRET)
)


//MongoDB
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{
  useUnifiedTopology: true, 
  useNewUrlParser: true,
  useCreateIndex:true})
const db=mongoose.connection
db.on('error',error=>console.error(error))
db.once('open',()=>console.log('Connected to Mongoose'))


//Routes
const indexRouter = require('./routes/index')
const adminRouter = require('./routes/admin/admin')
const userRouter  = require('./routes/user/user')
const cartRouter  = require('./routes/cart')
const paypalRouter= require('./routes/paypal')
app.use('/',indexRouter)
app.use('/admin',adminRouter)
app.use('/user',userRouter)
app.use('/cart',authUser,cartRouter)
app.use('/paypal',paypalRouter)


//404
app.use(function (req, res, next) {
  res.status(404).render("404",{
      title:"404 Not found!!!"
  })
})


//Port listening
app.listen(process.env.PORT||3000)