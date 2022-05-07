const {ROLE} = require('../data') 

function canViewCart(user, cart){
    return(
        user.role === ROLE.ADMIN ||
        cart.userID === user.id 
    )
}

function scopedCarts(user,carts){
    if(user.role === ROLE.ADMIN) return carts
    return carts.filter(cart=>cart.userID === user.id)
}

function canDeleteCart(user, cart){
    return cart.userID === user.id
}

module.exports = {
    canViewCart,
    scopedCarts,
    canDeleteCart

}