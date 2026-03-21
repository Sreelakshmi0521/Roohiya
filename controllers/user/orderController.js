const Order = require("../../models/orderModel")
const Cart = require("../../models/cartModel")
const Address = require("../../models/addressModel")
const getUserId = (req) => req.session.user?._id || req.session.user?.id
const {getColorCode}=require("../../helpers/orderIcon")
const  { reduceProductStock,restoreProductStock,checkStockAvailability }=require("../../helpers/stockManage")





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


         for (const item of cart.items) {
            if (item.productVariantId) {
                const stockCheck = await checkStockAvailability(
                    item.productVariantId._id,
                    item.quantity
                );
                
                if (!stockCheck.available) {
                    return res.status(400).json({ 
                        message: `${item.productId?.name || 'Product'}: ${stockCheck.message}`
                    });
                }
            }
        }

        let totalAmount = 0
        const products = []

         for (const item of cart.items) {
            const price = item.discountedPriceAtTime || item.priceAtTime;
            const subtotal = price * item.quantity;
            totalAmount += subtotal;

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
             if (item.productVariantId) {
                try {
                    await reduceProductStock(item.productVariantId._id, item.quantity);
                } catch (stockError) {
                    console.error(`Failed to reduce stock for ${item.productId?.name}:`, stockError);
                    
                    return res.status(400).json({ 
                        message: `Failed to process ${item.productId?.name}: ${stockError.message}` 
                    });
                }
            }
        }

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
        const userId = getUserId(req);
        const orderId = req.params.id;

        if (!userId) {
            return res.redirect("/user/login");
        }

        const order = await Order.findOne({ _id: orderId, userId })
            .populate({
                path: 'products.variantId',
                select: 'images color price', 
                model: 'ProductVariant'
            });
        
        if (!order) {
            return res.status(404).send("Order not found");
        }
         if (!order.confirmedAt && order.status !== 'pending') {
      order.confirmedAt = new Date(order.createdAt.getTime() + 2*60*60*1000);
    }
    
    if (!order.shippedAt && ['shipped', 'out for delivery', 'delivered'].includes(order.status)) {
      order.shippedAt = new Date(order.createdAt.getTime() + 24*60*60*1000); 
    }
    
    if (!order.outForDeliveryAt && ['out for delivery', 'delivered'].includes(order.status)) {
      order.outForDeliveryAt = new Date(order.createdAt.getTime() + 48*60*60*1000);
    }
    
    if (!order.deliveredAt && order.status === 'delivered') {
      order.deliveredAt = new Date(order.createdAt.getTime() + 72*60*60*1000);
    }
    
    if (!order.cancelledAt && order.status === 'cancelled') {
      order.cancelledAt = new Date(); 
    }


        res.render("user/orderDetails", {
            order,
            user: req.session.user,
            getColorCode
        });

    } catch (error) {
        console.error('Error loading order details:', error);
        res.status(500).send("Internal Server Error");
    }
};

exports.getOrderList = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { search, page = 1, limit = 10 } = req.query;
        
        if (!userId) {
            return res.redirect("/user/login");
        }

        let filter = { userId };
        
        if (search) {
            filter.$or = [
                { orderId: { $regex: search, $options: "i" } },
                { "products.name": { $regex: search, $options: "i" } }
            ];
        }

        const orders = await Order.find(filter)
            .populate({
                path: 'products.variantId',
                select: 'images color',
                model: 'ProductVariant'
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.render("user/orders", {
            orders,
            user: req.session.user,
            search: search || "",
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            getColorCode
        });

    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).send("Internal Server Error");
    }
};


exports.cancelOrder=async(req,res)=>{
    try {
        const userId = getUserId(req)

        const {orderId,reason}=req.body
        if(!userId){
       return res.status(401).json({ message: "User not logged in" });

        }

        const order=await Order.findOne({_id:orderId,userId})
       if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if(!["pending","shipped","out for delivery"].includes(order.status)){
             return res.status(400).json({ message: "Order cannot be cancelled at this stage"});
        }
        order.status="cancelled"
         order.cancelledAt = new Date();

        for(let product of order.products){
            if(product.status==="placed"){
                product.status="cancelled"
                product.cancelReason=reason||""

              try {
               await restoreProductStock(product.variantId, product.quantity);

              } catch (stockError) {
             console.error(`Failed to restore stock for variant ${product.variantId}:`, stockError);

              }

            }
        }
            await order.save();
      res.json({  success: true,message: "Order cancelled successfully", updatedOrder: order });
    
    
    
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to cancel order" });
    }
}

exports.cancelOrderItem=async(req,res)=>{
    try {
                const userId = getUserId(req);
  const {orderId,productIndex,reason}=req.body

  if (!userId) {
            return res.status(401).json({ message: "User not logged in" });
        }

  const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

 if (productIndex >= order.products.length) {
            return res.status(400).json({ message: "Invalid product" });
        }

        const product=order.products[productIndex]

    if (product.status !== "placed") {
            return res.status(400).json({ 
                message: "Product cannot be cancelled" 
            });
        }

        if (!["pending", "shipped", "out for delivery"].includes(order.status)) {
            return res.status(400).json({ 
                message: "Product cannot be cancelled at this stage" 
            });
        }

      product.status = "cancelled";
      product.cancelReason = reason || "";
    
      await restoreProductStock(product.variantId, product.quantity)

       const allCancelled = order.products.every(p => p.status === "cancelled");
        const somePlaced = order.products.some(p => p.status === "placed");

   if (allCancelled) {
            order.status = "cancelled";
             order.cancelledAt = new Date();
        } else if (!somePlaced && order.status !== "cancelled") {
            order.status = "partially cancelled";
        }
        
        await order.save();
         res.json({ 
            success: true, 
            message: "Product cancelled successfully",
            updatedOrder: order 
        });




    } catch (error) {
        console.error( error);
        res.status(500).json({ message: "Failed to cancel product" });
    }
}

exports.returnOrder=async(req,res)=>{
    try {
      const userId = getUserId(req);
        const { orderId, reason } = req.body

         if (!userId) {
            return res.status(401).json({ message: "User not logged in" });
        }

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ message: "Return reason is required" });
        }
    
        const order = await Order.findOne({ _id: orderId, userId });
       if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

         if (order.status !== "delivered") {
            return res.status(400).json({ message: "Only delivered orders can be returned"});
        }
        order.status = "returned";

        for (let product of order.products) {
            if (product.status === "placed") {
                product.status = "returned";
                product.returnReason = reason;

                await restoreProductStock(product.variantId, product.quantity);
            }
        }
          await order.save();

   res.json({  success: true,  message: "Return request submitted successfully",updatedOrder: order})

    } catch (error) {
         console.error( error)
        res.status(500).json({ message: "Failed to process return" })
    }
}

exports.returnOrderItem=async(req,res)=>{
    try {
      const userId = getUserId(req);
      const { orderId, productIndex, reason } = req.body;

 if (!userId) {
            return res.status(401).json({ message: "User not logged in" });
        }

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ message: "Return reason is required" });
        }
        
        const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
if (order.status !== "delivered") {
            return res.status(400).json({ 
                message: "Only delivered orders can be returned" 
            });
        }

        if (productIndex >= order.products.length) {
            return res.status(400).json({ message: "Invalid product" });
        }

                const product = order.products[productIndex];
     if (product.status !== "placed") {
            return res.status(400).json({ 
                message: "Product cannot be returned" 
            });
        }
        product.status = "returned";
        product.returnReason = reason;

       await restoreProductStock(product.variantId, product.quantity)

        const allReturned = order.products.every(p => p.status === "returned");
        const somePlaced = order.products.some(p => p.status === "placed");

         if (allReturned) {
            order.status = "returned";
        } else if (!somePlaced && order.status !== "returned") {
            order.status = "partially returned";
        }
                await order.save();

   res.json({ 
            success: true, 
            message: "Product return request submitted successfully",
            updatedOrder: order 
        })

    } catch (error) {
        console.error( error);
        res.status(500).json({ message: "Failed to process return" });
   
    }
}



