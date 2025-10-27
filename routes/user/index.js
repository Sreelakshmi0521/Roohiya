const express=require("express")
const router =express.Router()




const authRoutes=require("./authRoutes")
const profileRoutes=require("./profileRoutes")
const addressRoutes=require("./addressRoutes")
const productRoutes=require("./productRoutes")
const reviewRoutes=require("./reviewRoutes")




router.use("/",authRoutes)
router.use("/",productRoutes)
router.use("/",reviewRoutes)
router.use("/",profileRoutes)
router.use("/",addressRoutes)


module.exports=router