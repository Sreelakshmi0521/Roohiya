const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const setPagetitle=require("../../middlewares/setpagetitle")
const checkoutController=require("../../controllers/user/checkoutController")
const validate=require("../../middlewares/validate")
const{addAddressValidation,editAddressValidation}=require("../../validations/addressValidation")



router.get("/checkout",requireLogin,setPagetitle("Checkout","checkout.css"),checkoutController.loadCheckoutPage)

router.get("/checkout/address/:id",requireLogin,checkoutController.getAddressById)
router.post("/checkout/address/add",requireLogin,validate(addAddressValidation),checkoutController.addAddress)
router.put("/checkout/address/edit/:id",requireLogin,validate(editAddressValidation),checkoutController.editAddress)



module.exports=router