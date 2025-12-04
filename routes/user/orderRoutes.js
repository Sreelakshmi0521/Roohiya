const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const setPagetitle=require("../../middlewares/setpagetitle")
const orderController=require("../../controllers/user/orderController")
const {returnOrderSchema,returnOrderItemSchema}=require("../../validations/orderValidation")
const validate=require("../../middlewares/validate")
const invoiceController=require("../../controllers/user/invoiceController")

router.get("/orders", requireLogin,setPagetitle("My orders", "orders.css"), orderController.getOrderList);
router.get("/orders/:id", requireLogin, setPagetitle("Order Details", "orderDetails.css"),orderController.getOrderDetails);
router.post("/orders/cancel", requireLogin, orderController.cancelOrder);
router.post("/orders/cancel-item", requireLogin,orderController.cancelOrderItem);
router.post("/orders/return", requireLogin,validate(returnOrderSchema), orderController.returnOrder);
router.post('/orders/return-item',requireLogin,validate(returnOrderItemSchema), orderController.returnOrderItem);
router.get('/orders/invoice/:id', invoiceController.generateInvoice)




module.exports=router