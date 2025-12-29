const Wishlist = require("../../models/wishlistModel");
const getUserId = (req) => req.session.user?._id || req.session.user?.id;
const Cart=require("../../models/cartModel")
const ProductVariant=require("../../models/productVariantModel")

exports.loadWishlistPage = async (req, res) => {
  try {
    const userId = getUserId(req);

       if(!userId){
        return res.redirect("/user/login")
    }

    const wishlist = await Wishlist.findOne({ userId }).populate("items.productId") .populate("items.productVariantId");

    return res.render("user/wishlist", {
      user: req.session.user,
      wishlist: wishlist || { items: [] },  
    });

  } catch (error) {
    console.error(error)
        res.status(500).send("Server Error")
  }
}



exports.addToWishlist = async (req, res) => {
  try {

    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const { productId, productVariantId } = req.body;

    if (!productId || !productVariantId) {
      return res.status(400).json({ success: false, message: "Missing IDs" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const existingIndex = wishlist.items.findIndex(item =>
      item.productId.toString() === productId &&
      item.productVariantId.toString() === productVariantId
    );


    if (existingIndex === -1) {
      wishlist.items.push({ productId, productVariantId });
    } else {
      wishlist.items.splice(existingIndex, 1);
    }

    await wishlist.save();

    return res.json({
      success: true,
      added: existingIndex === -1,
      wishlistCount: wishlist.items.length
    });

  } catch (error) {
    console.error("Wishlist ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


exports.removeFromWishlist=async(req,res)=>{
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }


    const{productId,productVariantId}=req.body

    await Wishlist.updateOne({userId},{$pull:{items:{productId,productVariantId}}})

    const updatedWishlist = await Wishlist.findOne({ userId });
    const wishlistCount = updatedWishlist ? updatedWishlist.items.length : 0;

    return res.json({success:true,wishlistCount})

  } catch (error) {
    console.error("Wishlist ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

exports.moveToCart=async(req,res)=>{
try {
  const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const{productId,productVariantId}=req.body

    let cart=await Cart.findOne({userId})
   
    if(!cart){
      cart=new Cart({userId,items:[]})
    }

const exists=cart.items.find(item=>item.productId.toString()===productId &&item.productVariantId.toString()===productVariantId)


const variant=await ProductVariant.findById(productVariantId)
if(!variant) {
  return res.status(404).json({ message: "Variant not found" });
}
const price = variant.discountedPrice ?? variant.price;


if(exists){
  exists.quantity+=1
}else{
  cart.items.push({productId,productVariantId,quantity:1,priceAtTime: price})
}

await cart.save()


await Wishlist.updateOne({userId},{$pull:{items:{productId,productVariantId}}})

const updatedWishlist = await Wishlist.findOne({ userId });
const wishlistCount = updatedWishlist ? updatedWishlist.items.length : 0;

return res.json({success:true, cartCount: cart.items.length,wishlistCount,message: "Moved to cart successfully"})



} catch (error) {
  console.log("Move To Cart Error:",error);
   return res.status(500).json({  success: false, message: "Server error"  });
}


}