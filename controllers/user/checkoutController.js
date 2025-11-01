const Address= require("../../models/addressModel")
const Cart=require("../../models/cartModel")
const getUserId=(req)=>req.session.user?._id||req.session.user?.id


exports.loadCheckoutPage=async(req,res)=>{
    try {
        const userId=getUserId(req)

    if(!userId){
   return res.redirect("/user/login")
    }

    const addresses=await Address.find({userId})


    const cart=await Cart.findOne({userId}).populate("items.productId").populate("items.productVariantId")
  
   if (!cart || cart.items.length === 0) {
  return res.redirect("/user/cart")
}


  let subtotal=0
  let youSave=0

  cart.items.forEach((item)=>{
    const originalPrice=item.priceAtTime
    const discountPrice=item.discountedPriceAtTime||originalPrice

   subtotal+=discountPrice*item.quantity
   if(discountPrice<originalPrice){
    youSave+=(originalPrice-discountPrice)*item.quantity
   }

  })

  const tax=+(subtotal*0.05).toFixed(2)

  const shipping=subtotal>599?0:50

  const total=subtotal+tax+shipping

  res.render("user/checkout",{
    addresses,
    cartItems:cart.items.map((item)=>({
        name:item.productId?.name||"Unknown Product",
        image: item.productVariantId?.images?.[0] ,
        quantity:item.quantity,
        price:item.discountedPriceAtTime||item.priceAtTime,
        originalPrice:item.priceAtTime
    })),
    summary:{
        subtotal,
        tax,
        shipping,
        total,
        youSave
    },
    user: req.session.user,

  })

 } catch (error) {
    console.error(error)
     res.status(500).send("Internal Server Error")

    }
}

exports.getAddressById=async(req,res)=>{
    try {
     const userId=getUserId(req)
    const addressId = req.params.id

if(!userId){
 return res.status(401).json({ message: "User not logged in" })
 
}
const address=await Address.findOne({_id:addressId, userId})

   if (!address) {
      return res.status(404).json({ message: "Address not found" })
    } 

    res.json(address)
    
    } catch (error) {
        console.error(error)
            res.status(500).json({ message: "Server error" })

    }
}


exports.addAddress=async(req,res)=>{
    try {
   const userId = getUserId(req)
  if (!userId) {
      return res.status(401).json({ message: "User not logged in" })
    }

    const {name,phone,houseName,locality,city,state,pincode,country,landmark,addressType,isDefault}=req.body

      if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false })
    }
    const newAddress=new Address({userId,name,phone,houseName,locality,city,state,pincode,country,landmark,addressType,isDefault})

    await newAddress.save()
     res.status(200).json({ message: "Address added successfully!" })

    } catch (error) {
     console.error(error)
     
    res.status(500).json({ message: "Failed to add address" })

    }
}

exports.editAddress=async(req,res)=>{
    try {
           const userId = getUserId(req)
            const addressId = req.params.id

                const address = await Address.findOneAndUpdate(
                { _id: addressId, userId },
                req.body,
                { new: true }
                )
   
            if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    res.status(200).json({ message: "Address updated successfully!" })

    } catch (error) {
       console.error(error)
   res.status(500).json({ message: "Failed to update address" })

    }
}