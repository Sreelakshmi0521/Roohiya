const Order= require("../../models/orderModel")
const User=require("../../models/userModel")
const ProductVariant=require("../../models/productVariantModel");



exports.loadOrders=async(req,res)=>{
    try {

        let search="";

        if(req.query.search){
            search=req.query.search.trim()
        }
        let statusFilter=req.query.status||""
        let sortBy=req.query.sortBy||"createdAt"
        let sortOrder=req.query.sortOrder||"desc"

        let page=1
        if(req.query.page){
            page=parseInt(req.query.page)
        }
        let limit=10
       let query={}

       if(search){
        query.$or=[
            {orderId:{$regex:search,$options:"i"}},
            {"shippingAddress.name":{$regex:search,$options:"i"}},
            {"shippingAddress.phone":{$regex:search,$options:"i"}},
            {"shippingAddress.city":{$regex:search,$options:"i"}},

        ]
       }

       if(statusFilter){
         query.status=statusFilter
       }

       let sortOptions={}
       sortOptions[sortBy]=sortOrder==="asc"? 1:-1

       const totalOrders=await Order.countDocuments(query)

       const orders=await Order.find(query).populate("userId","name email phone").sort(sortOptions).skip((page-1)*limit).limit(limit).lean()

      const totalPages=Math.ceil(totalOrders/limit)
      
      const statuses=[
         "pending",
            "shipped",
            "out for delivery",
            "delivered",
            "cancelled",
            "partially cancelled",
            "partially returned"
      ]
      
        const orderStats = {
            total: totalOrders,
            pending: await Order.countDocuments({ status: "pending" }),
            shipped: await Order.countDocuments({ status: "shipped" }),
            delivered: await Order.countDocuments({ status: "delivered" }),
            cancelled: await Order.countDocuments({ status: "cancelled" }),
        };
        

        res.render("admin/orders",{
            orders,
            totalOrders,
            currentPage:page,
            totalPages,
            search,
            statusFilter,
            sortBy,
            sortOrder,
            statuses,
            orderStats,
            limit,
            pageJs:"orderManagement.js",
            message:req.query.message||null,
            messageType:req.query.messageType||null
        })

       

    } catch (error) {
        console.error(error)
         res.status(500).render("admin/orders", {
            message: "Error loading orders",
            messageType: "error",
            orders: [],
            totalOrders: 0,
            currentPage: 1,
            totalPages: 0,
            search: "",
            statusFilter: "",
            statuses: [],
            orderStats: {},
            pageJs: "orderManagement.js"
        });
    }
}

exports.viewOrderDetails=async(req,res)=>{
    try {
        const orderId = req.params.id;
       const order=await Order.findById(orderId).populate("userId","name email phone").populate("products.productId","name").populate("products.variantId","color images").lean()
         
       if (!order) {
            return res.redirect("/admin/orders?message=Order not found&messageType=warning");
        }

        order.formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        order.expectedDeliveryFormatted = new Date(order.expectedDelivery).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        order.products.forEach(product=>{
            product.total=product.price *product.quantity
        })

         res.render("admin/orderDetails", {
            order,
            pageJs: "orderDetails.js",
            message: req.query.message || null,
            messageType: req.query.messageType || null
        });

   
    } catch (error) {
         console.error(error)
        res.redirect("/admin/orders?message=Error loading order details&messageType=error")

    }
}

exports.updateOrderStatus=async(req,res)=>{
    try {
        const {orderId,status}=req.body
        const order=await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({success: false,message: "Order not found" })
        }
        
 const validTransitions = {
            "pending": ["shipped", "cancelled"],
            "shipped": ["out for delivery", "cancelled"],
            "out for delivery": ["delivered"],
            "delivered": [],
            "cancelled": [],
            "partially cancelled": [],
            "partially returned": []
        }; 
        
         if (!validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.status} to ${status}`
            });
        }

        if (status === "cancelled" || status === "delivered") {
            for (const item of order.products) {
                const variant = await ProductVariant.findById(item.variantId);
                if (variant) {
                    if (status === "cancelled") {
                        variant.stock += item.quantity;
                    } else if (status === "delivered") {
                    }
                    await variant.save();
                }
            }
        }

                order.status = status;
    if (status === "shipped") {
            order.expectedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        }

                await order.save();

 res.json({
            success: true,
            message: `Order status updated to ${status}`,
            orderId: order._id,
            newStatus: status
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error updating order status"
        });
    }
}

exports.updateProductStatus=async(req,res)=>{
    try {
      const { orderId, productIndex, status, reason } = req.body;

       const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        if (productIndex < 0 || productIndex >= order.products.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid product index"
            });
        }

        const product = order.products[productIndex];
        product.status = status;

          if (status === "cancelled") {
            product.cancelReason = reason || "";

            const variant = await ProductVariant.findById(product.variantId);
            if (variant) {
                variant.stock += product.quantity;
                await variant.save();
            }
        } else if (status === "returned") {
            product.returnReason = reason || "";

            const variant = await ProductVariant.findById(product.variantId);
            if (variant) {
                variant.stock += product.quantity;
                await variant.save();
            }
        }

        const allProducts = order.products;
        const cancelledCount = allProducts.filter(p => p.status === "cancelled").length;
        const returnedCount = allProducts.filter(p => p.status === "returned").length;
        const placedCount = allProducts.filter(p => p.status === "placed").length;


         if (cancelledCount > 0 && cancelledCount < allProducts.length && placedCount > 0) {
            order.status = "partially cancelled";
        } else if (returnedCount > 0 && returnedCount < allProducts.length && placedCount > 0) {
            order.status = "partially returned";
        } else if (cancelledCount === allProducts.length) {
            order.status = "cancelled";
        } else if (returnedCount === allProducts.length) {
            order.status = "cancelled";
        }
                await order.save();
     res.json({
            success: true,
            message: `Product status updated to ${status}`,
            orderId: order._id,
            productIndex,
            newStatus: status
        });

    } catch (error) {
         console.error( error);
        res.status(500).json({
            success: false,
            message: "Error updating product status"
        });
    }
}





