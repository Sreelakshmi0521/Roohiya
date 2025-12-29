const Cart=require("../../models/cartModel")
const Product=require("../../models/productModel")
const ProductVariant=require("../../models/productVariantModel")
const Category=require("../../models/categoryModel")
const Wishlist=require("../../models/wishlistModel")
const getUserId=(req)=>req.session.user?._id||req.session.user?.id




exports.loadCartPage=async(req,res)=>{
    try {
       
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
            res.status(500).send("Internal Server Error")

    }
}

exports.addToCart=async(req,res)=>{
    try {
        const userId = getUserId(req)
 console.log("hai")
        const {productId,variantId,quantity=1}=req.body

        if(!userId){
            return res.status(401).json({ success: false, message: "Please login first" })
        }
        const variant=await ProductVariant.findById(variantId)

        if (!variant) {
        return res.status(404).json({ success: false, message: "Variant not found" })
        }
         
        if(!variant.isListed){
        return res.status(400).json({ success: false, message: "This product variant is currently unavailable" })  
        }
          if (variant.stock < 1) {
           return res.status(400).json({ success: false, message: "This variant is out of stock" })
           }

        const product=await Product.findById(productId).populate("category")

         if(!product){
            return res.status(404).json({ success: false, message: "Product not found" })
         }
         if (!product.isListed) {
          return res.status(400).json({ success: false, message: "This product is currently unavailable for purchase" })
          }

          if(!product.category.isListed){
            return res.status(400).json({ success: false, message: "This product’s category is currently unavailable" })
  
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
         
await Wishlist.updateOne(
  { userId },
  { $pull: { items: { productId, productVariantId: variantId } } }
);
         await cart.save()
         const cartItems = cart.items; 
         res.json({ success: true, message: "Item added to cart", cartCount: cartItems.length })

    } catch (error) {
        console.error(error)
     res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}

exports.getCartItems=async(req,res)=>{
    try {
        const userId = getUserId(req)
       if(!userId){
            return res.status(401).json({ success: false, message: "Please login " })
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
        console.error(error)
         res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}

exports.removeCartItem=async(req,res)=>{
    try {
         const userId = getUserId(req)
         const{productId,variantId}=req.body

         if(!userId){
              return res.status(401).json({ success: false, message: "Please login first" })
         }

         const cart=await Cart.findOne({userId})
         if(!cart){
        return res.status(404).json({ success: false, message: "Cart not found" })
          
         }

         const updatedItems=cart.items.filter((item)=>!(item.productId.toString()===productId && item.productVariantId.toString()=== variantId))
   

         if(updatedItems.length=== cart.items.length){
           return res.status(404).json({ success: false, message: "Item not found in cart" })
       
         }

         cart.items=updatedItems
         await cart.save()
      return res.json({ success: true, message: "Item removed from cart successfully" })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal Server Error" })

    }
}

exports.updateQuantity=async(req,res)=>{
console.log("hai")
  try {
    const userId=getUserId(req)
    if(!userId){
        return res.status(401).json({ success: false, message: "User not logged in" })
    }
    const {productId,variantId,action}=req.body

       if (!productId || !variantId || !action) {
      return res.status(400).json({ success: false, message: "Missing productId, variantId, or action" })
    }

    const cart=await Cart.findOne({userId})
     if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }
    const itemIndex=cart.items.findIndex((item)=>item.productId.toString()===productId && item.productVariantId.toString()===variantId)

    if(itemIndex===-1){
    return res.status(404).json({ success: false, message: "Item not found in cart" }) 
    }
     const item = cart.items[itemIndex]

const variant=await ProductVariant.findById(variantId)
if(!variant){
 return res.status(404).json({ success: false, message: "Product variant not found" })   
}
    let newQuantity = item.quantity
if (action === "increment") {
      if (newQuantity >= 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 items allowed per product",
          quantity: newQuantity,
          remainingStock: variant.stock,
        })
      }

   if (newQuantity + 1 > variant.stock) {
        return res.status(400).json({success: false, message: `Only ${variant.stock} items available in stock`, quantity: newQuantity, remainingStock: variant.stock, })
      }

      newQuantity += 1


    }else if (action === "decrement") {
      if (newQuantity <= 1) {
        return res.status(400).json({
          success: false,
          message: "Minimum quantity is 1",
          quantity: newQuantity,
          remainingStock: variant.stock,
        })
      }

      newQuantity -= 1

    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action type" })
    }


      cart.items[itemIndex].quantity = newQuantity

   await cart.save()

 const subtotal = cart.items.reduce((sum, i) => sum + (i.discountedPriceAtTime ?? i.priceAtTime) * i.quantity,0 )

    const tax = +(subtotal * 0.05).toFixed(2) 
    const total = +(subtotal + tax).toFixed(2)

 return res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      quantity: newQuantity,
      subtotal,
      tax,
      total,
      remainingStock: variant.stock,
    })

    
  } catch (error) {
    console.error(error)
      return res.status(500).json({ success: false, message: "Something went wrong" })
  }

}