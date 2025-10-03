const multer = require("multer");
const path = require("path");
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'temp');
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                console.error("Error creating upload directory:", err);
                return cb(err); 
            }
            cb(null, uploadPath); 
        });
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

console.log("🟢 Multer + Disk storage initialized");

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, 
        files: 50 
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
            return cb(new Error('Only image files (jpg, jpeg, png) are allowed!'), false);
        }
        cb(null, true);
    }
});


module.exports = upload;