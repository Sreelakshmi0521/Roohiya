const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/admin/orderController");
const { checkSession } = require("../../middlewares/adminAuth")
const nocache = require("../../middlewares/nocache")
const setPagetitle = require("../../middlewares/setpagetitle")

router.use(checkSession);

// Order management routes
router.get("/orders",setPagetitle("orders","orders.css"), orderController.loadOrders);
router.get("/orders/:id",setPagetitle("ordersDetails","ordersDetails.css"), orderController.viewOrderDetails);
router.post("/orders/update-status", orderController.updateOrderStatus);
router.post("/orders/update-product-status", orderController.updateProductStatus);

module.exports = router;