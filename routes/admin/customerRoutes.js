const express=require("express")
const router =express.Router()
const customerController = require("../../controllers/admin/customerController");
const {checkSession } = require("../../middlewares/adminAuth");
const nocache = require("../../middlewares/nocache");
const setPagetitle = require("../../middlewares/setpagetitle");

// customer managment
router.get("/customers",nocache,checkSession,setPagetitle("Customers","customers.css"),customerController.loadCustomer)
router.post("/customers/block/:id",checkSession,customerController.blockUser)
router.post("/customers/unblock/:id",checkSession,customerController.unblockUser)



module.exports=router