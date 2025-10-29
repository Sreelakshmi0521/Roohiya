
const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const setPagetitle=require("../../middlewares/setpagetitle")
const addressController=require("../../controllers/user/addressController")
const validate=require("../../middlewares/validate")
const{addAddressValidation,editAddressValidation}=require("../../validations/addressValidation")


 // address
router.get("/addresses",requireLogin,setPagetitle("My Addresses", "addresses.css"),addressController.loadAddressesPage);
router.post( "/addresses/add",requireLogin,validate(addAddressValidation),setPagetitle("My Addresses", "addresses.css"),addressController.addAddress);
router.get("/addresses/:id", requireLogin, addressController.loadEditAddressPage);
router.put("/addresses/edit/:id",requireLogin,validate(editAddressValidation),addressController.editAddress);
router.delete("/addresses/delete/:id",requireLogin,addressController.deleteAddress)
router.put("/addresses/setDefault/:id",requireLogin,addressController.setDefaultAddress)

module.exports=router


