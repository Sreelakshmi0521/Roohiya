const Address=require("../../models/addressModel")

const getUserId=(req)=>req.session.user?._id||req.session.user?.id


exports.loadAddressesPage=async(req,res)=>{
  try {
    const userId=getUserId(req)
    const addresses= await Address.find({userId})
    res.render("user/addresses",{
      user:req.session.user,
      addresses,
      message:null,
      messageType:null,

    })

  } catch (error) {
    console.error(error)
        res.status(500).send("Server Error")

  }
}



exports.addAddress=async(req,res)=>{
  try {
    const userId=getUserId(req)
    const { name, phone, houseName, locality, pincode, city, state, country, landmark, addressType } = req.body
  
const newAddress= new Address({
  userId,name,phone,houseName,locality,city,state,country,pincode,landmark,addressType
})
await newAddress.save()
console.log(newAddress)

return res.status(201).json({
      success: true,
      message: "Address added successfully!",
      address: newAddress,
    })

  } catch (error) {
    console.error(error);
  return res.status(500).json({ success: false, message: "Failed to add address" });

  }
}

exports.loadEditAddressPage=async(req,res)=>{
  try {
    const address=await Address.findById(req.params.id)


    if(!address){
      return res.status(404).json({ success: false, message: "Address not found" });
    }
        return res.status(200).json({ success: true, address });

  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "Error fetching address" });

  }
}

exports.editAddress=async(req,res)=>{
  try {
    const updated=await Address.findByIdAndUpdate(req.params.id,req.body,{new:true})
  
  if(!updated){
          return res.status(404).json({ success: false, message: "Address not found" });

  }
  
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updated,
    })
  
  
  } catch (error) {
    console.error(error)
     return res.status(400).json({ success: false, message: "Failed to update address" });

    
  }
}



exports.deleteAddress=async(req,res)=>{

try {
  
  const userId=getUserId(req)
  const addressId=req.params.id

  const address=await Address.findByIdAndDelete({_id: addressId, userId })
  if(!address){
     return res.status(404).json({ success: false, message: "Address not found or unauthorized" });

  }
      return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    })
} catch (error) {
  console.error(error);
  
      return res.status(500).json({ success: false, message: "Error deleting address" });

}
}

exports.setDefaultAddress=async(req,res)=>{
  try {

    const userId=getUserId(req)
    const addressId=req.params.id

    await Address.updateMany({userId},{$set:{isDefault:false}})
     
    const updated =await Address.findOneAndUpdate({_id:addressId,userId},{$set:{isDefault:true}},{new:true})
    

    if(!updated){
           return res.status(404).json({ success: false, message: "Address not found or unauthorized" });
 
    }

       return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    })


  } catch (error) {
    console.error(error);
        return res.status(500).json({ success: false, message: "Error setting default address" });

  }
}

