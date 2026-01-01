const express=require("express")
const router =express.Router()
const productController = require("../../controllers/admin/productController");
const upload = require("../../middlewares/upload");
const { checkSession } = require("../../middlewares/adminAuth");
const nocache = require("../../middlewares/nocache");
const setPagetitle = require("../../middlewares/setpagetitle");
const {addProductValidation,updateProductValidation}=require("../../validations/productValidation")
const validate=require("../../middlewares/validate")


// product management
router.get("/products",nocache,checkSession,setPagetitle("products","products.css"),productController.loadProduct)
router.get("/products/add",nocache,checkSession,setPagetitle("Add Product", "addProducts.css"),productController.loadAddProduct)
router.post("/products/add",nocache,checkSession,validate(addProductValidation),upload.array('variantImages', 50),productController.addProduct)

router.get("/products/edit/:id", nocache, checkSession, setPagetitle("products", "editProduct.css"), productController.loadEditProduct)
router.post("/products/edit/:id", nocache, checkSession, productController.updateProduct)
router.patch("/products/toggle/:id",nocache, checkSession, setPagetitle("products", "productvariants.css"), productController.toggleProductStatus)

//varaint management
router.get("/products/variants/:id", nocache, checkSession, setPagetitle("products", "productvariants.css"), productController.loadProductVariants)

router.get("/products/variants/:productId/add",nocache,checkSession,setPagetitle("products", "addVariant.css"),productController.loadAddVariant)
router.post("/products/variants/:productId/add",nocache,checkSession,upload.array('variantImages',3),productController.addVariant)

router.get("/products/variants/edit/:id",nocache, checkSession, setPagetitle("products", "editvariants.css"),productController.loadEditVariant)

router.post("/products/variants/edit/:id",nocache, checkSession,upload.fields([
        { name: 'variantImages[0]', maxCount: 1 },
        { name: 'variantImages[1]', maxCount: 1 },
        { name: 'variantImages[2]', maxCount: 1 }
    ]),productController.updateVariant)

router.patch("/products/variants/toggle/:id", nocache, checkSession, setPagetitle("products", "productvariants.css"),productController.toggleVariantStatus)


module.exports=router