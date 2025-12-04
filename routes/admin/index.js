const express=require("express")
const router =express.Router()
const setLayout = require("../../middlewares/setLayout");


const authRoutes=require("./authRoutes")
const categoryRoutes=require("./categoryRoutes")
const customerRouter=require("./customerRoutes")
const productRoutes=require("./productRoutes")
const orderRoutes=require("./orderRoutes")

router.use(setLayout("admin"))

router.use("/",authRoutes)
router.use("/",customerRouter)
router.use("/",categoryRoutes)
router.use("/",productRoutes)
router.use("/",orderRoutes)

module.exports=router