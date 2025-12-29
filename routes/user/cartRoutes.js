const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const setPagetitle=require("../../middlewares/setpagetitle")
const nocache=require("../../middlewares/nocache")
const cartController=require("../../controllers/user/cartController")


router.get("/cart",requireLogin,setPagetitle("Your Store", "cart.css"),cartController.loadCartPage)
router.post("/cart/add",requireLogin, nocache,setPagetitle("Your Store", "cart.css"),cartController.addToCart);
router.get("/cart/items",requireLogin,setPagetitle("Your Store", "cart.css"),cartController.getCartItems)
router.delete("/cart/remove",requireLogin,cartController.removeCartItem)
router.patch("/cart/updateQuantity",requireLogin,cartController.updateQuantity)
module.exports=router