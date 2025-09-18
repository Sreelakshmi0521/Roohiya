const express=require("express")
const router =express.Router()
const authController=require("../controllers/admin/authController")
const{isLogin,checkSession}=require("../middlewares/adminAuth")
const nocache=require("../middlewares/nocache")
const setPagetitle=require("../middlewares/setpagetitle")
const customerController=require("../controllers/admin/customerController")
const setLayout=require("../middlewares/setLayout")
const categoryController=require("../controllers/admin/categoryController")


router.use(setLayout("admin"))

router.get("/login",isLogin,authController.loadLogin)
router.post("/login",authController.adminLogin)

// customer managment
router.get("/customers",nocache,checkSession,setPagetitle("Customers","customers.css"),customerController.loadCustomer)
router.post("/customers/block/:id",checkSession,customerController.blockUser)
router.post("/customers/unblock/:id",checkSession,customerController.unblockUser)

//category management 
router.get("/categories",nocache,checkSession,setPagetitle("categories","categories.css"),categoryController.loadCategory)
router.get("/categories/add",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.loadAddCategory)
router.post("/categories/add",nocache,checkSession,categoryController.addCategory)


router.get("/dashboard",nocache,checkSession,setPagetitle("Admin Dashboard","dashboard.css"),authController.loadDashboard)


module.exports=router
