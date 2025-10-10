const express=require("express")
const router=express.Router()
const userController=require("../controllers/user/userController")
const setPagetitle=require("../middlewares/setpagetitle")


router.get("/",setPagetitle("Roohiya","landing.css"),userController.loadLanding)


module.exports=router