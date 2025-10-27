const express=require("express")
const router =express.Router()
const categoryController = require("../../controllers/admin/categoryController")
const { checkSession } = require("../../middlewares/adminAuth")
const nocache = require("../../middlewares/nocache")
const setPagetitle = require("../../middlewares/setpagetitle")




//category management 
router.get("/categories",nocache,checkSession,setPagetitle("categories","categories.css"),categoryController.loadCategory)
router.get("/categories/add",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.loadAddCategory)
router.post("/categories/add",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.addCategory)

router.get("/categories/edit/:id",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.loadEditCategory)
router.put("/categories/edit/:id",nocache,checkSession,setPagetitle("categories","addeditCategory.css"),categoryController.editCategory)

router.post("/categories/toggle/:id",nocache,checkSession,setPagetitle("categories","categories.css"),categoryController.categoryStatus)


module.exports=router