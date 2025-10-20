const multer = require("multer")
const path = require("path")
const fs = require('fs')


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const uploadPath = path.join(process.cwd(), 'temp')
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                console.error("error:",err)
                return  callback(err) 
            }
             callback(null, uploadPath) 
        })
    },
    filename: (req, file, callback) => {
         callback(null, Date.now() + '-' + file.originalname)
    }
})


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
        files: 50 
    },
    fileFilter: (req, file,  callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
            return  callback(new Error('Only image files (jpg, jpeg, png) are allowed!'), false)
        }
         callback(null, true)
    }
})


module.exports = upload