const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const setPagetitle=require("../../middlewares/setpagetitle")
const nocache=require("../../middlewares/nocache")
const wishlistController=require("../../controllers/user/wishlistController")



// router.get("/wishlist",requireLogin,setPagetitle("My Wishlist", "wishlist.css"),wishlistController.loadWishlistPage)
// router.post("/wishlist/add", requireLogin, wishlistController.addToWishlist);
// router.post("/wishlist/remove",requireLogin,wishlistController.removeFromWishlist)

module.exports=router