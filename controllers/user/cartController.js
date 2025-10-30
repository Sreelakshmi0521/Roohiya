const Cart=require("../../models/cartModel")
const Product=require("../../models/productModel")
const ProductVariant=require("../../models/productVariantModel")
const getUserId=(req)=>req.session.user?._id||req.session.user?.id




exports.loadCartPage=async(req,res)=>{
    try {
        // console.log("hai");
    const userId=getUserId(req)
    if(!userId){
        return res.redirect("/user/login")
    }

    let cart=await Cart.findOne({userId}).populate("items.productId").populate("items.productVariantId")

    if(!cart){
        cart={items:[]}
    }

    cart.items=cart.items.filter((item)=>item.productId && item.productVariantId)

    let subtotal=0
    let totalSavings=0

    cart.items.forEach((item)=>{
        const actualPrice=item.priceAtTime
        const discountPrice=item.discountedPriceAtTime||actualPrice

         subtotal+=discountPrice*item.quantity

         if(item.discountedPriceAtTime && item.discountedPriceAtTime< item.priceAtTime){
            totalSavings+=(item.priceAtTime-item.discountedPriceAtTime)*item.quantity
         }
    })
    const tax=subtotal*0.05
    const total=subtotal+tax

   res.render("user/cart",{
    cart,
    subtotal,
    tax,
    total,
    totalSavings
   })

        
    } catch (error) {
        console.error(error)
            res.status(500).send("Internal Server Error");

    }
}

exports.addToCart=async(req,res)=>{
    try {
        const userId = getUserId(req)

        const {productId,variantId,quantity=1}=req.body

        if(!userId){
            return res.status(401).json({ success: false, message: "Please login first" });
        }
        const variant=await ProductVariant.findById(variantId)
        if(!variant||variant.stock<1){
             return res .status(400).json({ success: false, message: "Product out of stock" });
        }
        const product=await Product.findById(productId)
         if(!product){
            return res.status(404).json({ success: false, message: "Product not found" });
         }

         let cart =await Cart.findOne({userId})
         if(!cart){
            cart = new Cart({ userId, items: [] })
         }
         const priceAtTime=variant.price
         const discountedPriceAtTime=variant.discountedPrice||priceAtTime

         const existingItem=cart.items.find((item)=>item.productId.toString()=== productId && item.productVariantId.toString()===variantId)


         if(existingItem){
            if(existingItem.quantity + quantity>10){
                  return res.status(400).json({ success: false, message: "You can’t add more than 10 items of this product"})
            }
            existingItem.quantity+=quantity
         }else{
            cart.items.push({
                productId,
                productVariantId:variantId,
                quantity,
                priceAtTime,
                discountedPriceAtTime
            })
         }

         await cart.save()
         res.json({ success: true, message: "Item added to cart" })

    } catch (error) {
        console.error(error)
     res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}

exports.getCartItems=async(req,res)=>{
    try {
        const userId = getUserId(req)
       if(!userId){
            return res.status(401).json({ success: false, message: "Please login " });
        }
         const  cart=await Cart.findOne({userId}).populate("items.productId").populate("items.productVariantId")

         if(!cart||!cart.items.length){
        return res.json({ success: true, items: [] })
         }
          const items = cart.items.map((item) => ({
      productId: item.productId?._id?.toString(),
      productVariantId: item.productVariantId?._id?.toString() || null,
    }))
       res.json({ success: true, items })

    } catch (error) {
        console.error(error);
         res.status(500).json({ success: false, message: "Internal Server Error" });

    }
}
