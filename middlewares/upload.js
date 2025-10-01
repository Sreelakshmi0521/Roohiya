const multer=require("multer")
const {CloudinaryStorage}=require("multer-storage-cloudinary")
const cloudinary=require("../config/cloudinary")

const storage= new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        // upload_preset:"products_images",
        folder:"products",
        allowed_formats: ['jpg','jpeg','png'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }] // optional extra resizing

    }
})
const upload=multer({storage})
module.exports=upload
