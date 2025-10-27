
const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const setPagetitle=require("../../middlewares/setpagetitle")
const addressController=require("../../controllers/user/addressController")


 // address
router.get("/addresses",requireLogin,setPagetitle("My Addresses", "addresses.css"),addressController.loadAddressesPage);



module.exports=router