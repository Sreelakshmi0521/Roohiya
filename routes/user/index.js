const express=require("express")
const router =express.Router()




const authRoutes=require("./authRoutes")
const profileRoutes=require("./profileRoutes")
const addressRoutes=require("./addressRoutes")
const productRoutes=require("./productRoutes")
const reviewRoutes=require("./reviewRoutes")
const cartRoutes=require("./cartRoutes")
const wishlistRoutes=require("./wishlistRoutes")
const checkoutRoutes=require("./checkoutRoutes")

router.use("/",authRoutes)
router.use("/",productRoutes)
router.use("/",reviewRoutes)
router.use("/",profileRoutes)
router.use("/",addressRoutes)
router.use("/",cartRoutes)
router.use("/",wishlistRoutes)
router.use("/",checkoutRoutes)

module.exports=router