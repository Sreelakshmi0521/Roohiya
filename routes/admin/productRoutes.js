const express=require("express")
const router =express.Router()
const productController = require("../../controllers/admin/productController");
const upload = require("../../middlewares/upload");
const { checkSession } = require("../../middlewares/adminAuth");
const nocache = require("../../middlewares/nocache");
const setPagetitle = require("../../middlewares/setpagetitle");


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
router.post("/products/variants/:id/add",nocache,checkSession,setPagetitle("products", "addVariant.css"),upload.array('variantImages',3),productController.addVariant)

router.get("/products/variants/edit/:id",nocache, checkSession, setPagetitle("products", "editvariants.css"),productController.loadEditVariant)
router.post("/products/variants/edit/:id",nocache, checkSession, setPagetitle("products", "editvariants.css"),upload.array("images",3),productController.updateVariant)

router.patch("/products/variants/toggle/:id", nocache, checkSession, setPagetitle("products", "productvariants.css"),productController.toggleVariantStatus)


module.exports=router