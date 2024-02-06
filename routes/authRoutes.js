const express = require('express');
const router = express.Router();
const multer = require('multer')
const authController = require('../controllers/authController');
const auth = require('../middleware/auth')
// router.route('/register').post(adminController.register)
var imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"./uploads");
    },
    filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}.${file.originalname}`)
    }
});


// img filter
const isImage = (req,file,callback)=>{
    if(file.mimetype.startsWith("image")){
        callback(null,true)
    }else{
        callback(null,Error("only image is allowd"))
    }
}

var upload = multer({
    storage:imgconfig,
    fileFilter:isImage
})

router.post('/register',upload.single('image'), authController.register)
router.post('/login', authController.login)
router.get('/me',auth, authController.getme)

module.exports = router