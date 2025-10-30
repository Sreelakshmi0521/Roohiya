const express=require("express")
const router =express.Router()




const authRoutes=require("./authRoutes")
const profileRoutes=require("./profileRoutes")
const addressRoutes=require("./addressRoutes")
const productRoutes=require("./productRoutes")
const reviewRoutes=require("./reviewRoutes")
const cartRoutes=require("./cartRoutes")



router.use("/",authRoutes)
router.use("/",productRoutes)
router.use("/",reviewRoutes)
router.use("/",profileRoutes)
router.use("/",addressRoutes)
router.use("/",cartRoutes)

module.exports=router