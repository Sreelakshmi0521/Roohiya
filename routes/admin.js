const express=require("express")
const router =express.Router()
const authController=require("../controllers/admin/authController")
const{isLogin,checkSession}=require("../middlewares/adminAuth")
const nocache=require("../middlewares/nocache")
const setPagetitle=require("../middlewares/setpagetitle")

router.get("/login",isLogin,authController.loadLogin)
router.post("/login",authController.adminLogin)

router.get("/dashboard",nocache,checkSession,setPagetitle("Admin Dashboard","dashboard.css"),authController.loadDashboard)


module.exports=router
