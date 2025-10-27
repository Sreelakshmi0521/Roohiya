const express=require("express")
const router =express.Router()
const nocache=require("../../middlewares/nocache")
const {requireLogin,checkUserBlocked}=require("../../middlewares/userAuth")
// const setLayout=require("../middlewares/setLayout")
const setPagetitle=require("../../middlewares/setpagetitle")
const productController=require("../../controllers/user/productController")
const userController=require("../../controllers/user/userController")



router.get("/homepage",requireLogin,checkUserBlocked,nocache,setPagetitle("homepage","homepage.css"),userController.loadHomepage)
router.get("/shop",checkUserBlocked,nocache,setPagetitle("shop","shop.css"),productController.loadShop)
router.get("/product/:id",checkUserBlocked,nocache,productController.loadProductDetails)


module.exports=router