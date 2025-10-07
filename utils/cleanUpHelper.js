const { cleanupTempFiles } = require("../utils/cleanUpTemp");
const cloudinary = require('../config/cloudinary')

const comprehensiveCleanup = async (tempFilePaths = [], uploadedImages = [], savedVariantIds = [], ProductVariantModel = null) => {
    try {
        if (tempFilePaths.length > 0) {
            await cleanupTempFiles(tempFilePaths);
        }
        
        if (uploadedImages.length > 0) {
            for (const img of uploadedImages) {
                try {
                    await cloudinary.uploader.destroy(img.public_id);
                } catch (cloudinaryError) {
                    console.log(cloudinaryError)
                }
            }
        }
        
        if (savedVariantIds.length > 0 && ProductVariantModel) {
            await ProductVariantModel.deleteMany({ _id: { $in: savedVariantIds } });
        }
    } catch (error) {
       console.log(error)
    }
};


module.exports = {
    comprehensiveCleanup
    
}