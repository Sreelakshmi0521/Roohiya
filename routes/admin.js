const express=require("express")
const router =express.Router()
const authController=require("../controllers/admin/authController")
const{isLogin,checkSession}=require("../middlewares/adminAuth")
const nocache=require("../middlewares/nocache")
const setPagetitle=require("../middlewares/setpagetitle")
const customerController=require("../controllers/admin/customerController")
const setLayout=require("../middlewares/setLayout")
const categoryController=require("../controllers/admin/categoryController")
const productController=require("../controllers/admin/productController");
const{uploadVariantImages}=require("../middlewares/uploadMultImage")
const upload = require("../middlewares/upload")


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
router.post("/categories/add",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.addCategory)

router.get("/categories/edit/:id",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.loadEditCategory)
router.put("/categories/edit/:id",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.editCategory)

router.post("/categories/toggle/:id",nocache,checkSession,setPagetitle("categories","categories.css"),categoryController.categoryStatus)

// product management
router.get("/products",nocache,checkSession,setPagetitle("products","products.css"),productController.loadProduct)
router.get("/products/add",nocache,checkSession,setPagetitle("products","addProducts.css"),productController.loadAddProduct)

router.post("/products/add", upload.array('variantImages', 50),productController.addProduct);







router.get("/dashboard",nocache,checkSession,setPagetitle("Admin Dashboard","dashboard.css"),authController.loadDashboard)





module.exports=router
