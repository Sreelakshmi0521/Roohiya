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
// const{uploadVariantImages}=require("../middlewares/uploadMultImage")
const upload = require("../middlewares/upload")


router.use(setLayout("admin"))

router.get("/login",isLogin,authController.loadLogin)
router.post("/login",authController.adminLogin)
router.get("/logout",nocache,checkSession,authController.adminLogout)

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
router.post("/products/add",nocache,checkSession,setPagetitle("products","addProducts.css"),upload.array('variantImages', 50),productController.addProduct)
router.get("/products/edit/:id", nocache, checkSession, setPagetitle("products", "editProduct.css"), productController.loadEditProduct)
router.post("/products/edit/:id", nocache, checkSession, setPagetitle("products", "editProduct.css"), productController.updateProduct)
router.patch("/products/toggle/:id",nocache, checkSession, setPagetitle("products", "productvariants.css"), productController.toggleProductStatus)

//varaint management
router.get("/products/variants/:id", nocache, checkSession, setPagetitle("products", "productvariants.css"), productController.loadProductVariants)

router.get("/products/variants/:id/add",nocache,checkSession,setPagetitle("products", "addVariant.css"),productController.loadAddVariant)
router.post("/products/variants/:id/add",nocache,checkSession,setPagetitle("products", "addVariant.css"),upload.array("images",3),productController.addVariant)

router.get("/products/variants/edit/:id",nocache, checkSession, setPagetitle("products", "editvariants.css"),productController.loadEditVariant)
router.post("/products/variants/edit/:id",nocache, checkSession, setPagetitle("products", "editvariants.css"),upload.array("images",3),productController.updateVariant)

router.patch("/products/variants/toggle/:id", nocache, checkSession, setPagetitle("products", "productvariants.css"),productController.toggleVariantStatus)





router.get("/dashboard",nocache,checkSession,setPagetitle("Admin Dashboard","dashboard.css"),authController.loadDashboard)





module.exports=router
