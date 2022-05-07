const express = require('express')
const router  = express.Router()


//Load Paypal Module
const paypal = require("@paypal/checkout-server-sdk")
//Load Paypal Environment
const Environment = process.env.NODE_ENV === 'prodcution'
    ?paypal.core.LiveEnvironment
    :paypal.core.SandboxEnvironment 
//Create Paypal Client
const paypalClient = new paypal.core.PayPalHttpClient(new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET    
))


const storeItems = new Map([
    [1,{price:100,name:"Chung Hua"}],
    [2,{price:200,name:"Camo"}],
])


router.post('/create-order',async(req,res)=>{
    const request = new paypal.orders.OrdersCreateRequest()
    const total = req.body.items.reduce((sum,item)=>{ 
        return sum + storeItems.get(item.id).price * item.quantity
    },0)
    request.prefer("return=representation")
    request.requestBody({
        intent:'CAPTURE',
        purchase_units:[
            {
                amount:{
                    currency_code: "USD",
                    value:total,
                    breakdown:{
                        //shipping_total
                        item_total:{
                            currency_code:"USD",
                            value:total
                        }
                    }
                },
                items: req.body.items.map(item=>{
                    const storeItem = storeItems.get(item.id)
                    return {
                        name:storeItem.name,
                        unit_amount:{
                            currency_code:"USD",
                            value:storeItem.price
                        },
                        quantity:item.quantity
                    } 
                })
            }
        ]
    })

    try{
        const order = await paypalClient.execute(request)
        res.json({id:order.result.id})
    }catch(e){
        res.status(500).json({error:e.message})
    }
})


module.exports = router