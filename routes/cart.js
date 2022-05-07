const express = require('express')
const router  = express.Router()
const {carts} = require('../data')
const {authUser} = require('../helper/auth')
const {canViewCart, canDeleteCart, scopedCarts} = require('../permissions/cart')

router.get('/',(req,res)=>{
    res.json(scopedCarts(req.user,carts))
})

router.get('/:cartID', setCart, authUser,authGetCart,(req,res)=>{
    res.json(req.cart)
})

router.delete('/:cartID',setCart, authUser, authDeleteCart,(req,res)=>{
    res.send('Deleted cart')
})


function setCart(req,res,next){
    const cartID=parseInt(req.params.cartID)
    req.cart=carts.find(cart=>cart.id===cartID)
    if(req.cart==null){
        res.status(404)
        return res.send('Cart not found')
    }
    next()
}

function authGetCart(req,res,next){
    if(!canViewCart(req.user,req.cart)){
        res.status(401)
        return res.send('Not allowed')
    }
    next()
}

function authDeleteCart(req,res,next){
    if(!canDeleteCart(req.user,req.cart)){
        res.status(401)
        return res.send('Not allowed')
    }
    next()
}


module.exports = router