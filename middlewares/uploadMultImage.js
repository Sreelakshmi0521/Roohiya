const upload=require("../middlewares/upload")

const uploadMultImage=(fieldName,maxCount=3)=>{
    return upload.array(fieldName,maxCount)
}

module.exports={uploadMultImage}