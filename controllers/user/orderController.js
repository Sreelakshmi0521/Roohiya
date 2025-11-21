const Order = require("../../models/orderModel")
const Cart = require("../../models/cartModel")
const Address = require("../../models/addressModel")
const getUserId = (req) => req.session.user?._id || req.session.user?.id



exports.placeOrderCOD=async(req,res)=>{

 try{
    const userId=getUserId(req)
    if(!userId){
        return res.status(401).json({message:"User not logged in "})
    }
    const {selectedAddress}=req.body

        if (!selectedAddress) {
            return res.status(400).json({ message: "Please select a shipping address" });
        }

        const cart=await Cart.findOne({userId}).populate("items.productId").populate("items.productVariantId")
           if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        const address=await Address.findOne({_id:selectedAddress,userId})
        if (!address) {
            return res.status(400).json({ message: "Invalid address selected" });
        }

        let totalAmount = 0
        const products = []

        cart.items.forEach((item) => {
            const price = item.discountedPriceAtTime || item.priceAtTime
            const subtotal = price * item.quantity
            
            totalAmount += subtotal

            products.push({
                productId: item.productId._id,
                variantId: item.productVariantId?._id,
                name: item.productId?.name || "Unknown Product",
                color: item.productVariantId?.color || "Default",
                price: price,
                quantity: item.quantity,
                subtotal: subtotal,
                status: "placed"
            })
        })

        const tax = +(totalAmount * 0.05).toFixed(2)
        const shipping = totalAmount > 599 ? 0 : 50
        totalAmount = totalAmount + tax + shipping

        const order = new Order({
            userId,
            products: products,
            totalAmount: totalAmount,
            shippingAddress: {
                name: address.name,
                phone: address.phone,
                houseName: address.houseName,
                locality: address.locality,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                country: address.country
            },
            paymentMethod: 'COD',
            status: 'pending',
            expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })

        await order.save()

        await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } }
        )

        res.status(200).json({ 
            success: true, 
            message: "Order placed successfully!", 
            orderId: order._id 
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to place order" })
    }
}

exports.getOrderSuccess = async (req, res) => {
    try {
        const userId = getUserId(req)
        const orderId = req.params.id

        if (!userId) {
            return res.redirect("/user/login")
        }

        const order = await Order.findOne({ _id: orderId, userId })
        
        if (!order) {
            return res.status(404).send("Order not found")
        }

        res.render("user/orderSuccess", {
            order: order,
            user: req.session.user,
            
        })

    } catch (error) {
        console.error( error)
        res.status(500).send("Internal Server Error")
    }
}

exports.getOrderDetails = async (req, res) => {
    try {
        const userId = getUserId(req)
        const orderId = req.params.id

        if (!userId) {
            return res.redirect("/user/login")
        }

        const order = await Order.findOne({ _id: orderId, userId })
        
        if (!order) {
            return res.status(404).send("Order not found")
        }

        res.render("user/orderDetails", {
            order,
            user: req.session.user,
            
        })

    } catch (error) {
        console.error('Error loading order details:', error)
        res.status(500).send("Internal Server Error")
    }
}