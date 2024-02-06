const express = require('express');
const multer = require('multer')
const router = express.Router()
const userController = require('../controllers/userController');
const auth = require('../middleware/auth')

var imgconfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./uploads");
    },
    filename: (req, file, callback) => {
        callback(null, `image-${Date.now()}.${file.originalname}`)
    }
});


// img filter
const isImage = (req, file, callback) => {
    if (file.mimetype.startsWith("image")) {
        callback(null, true)
    } else {
        callback(null, Error("only image is allowd"))
    }
}

const upload = multer({
    storage: imgconfig,
    fileFilter: isImage
})

router.post('/create', auth, upload.single('image'), userController.create)

router.get('/all', auth, userController.getUsers)

router.patch('/update/:id', userController.updateUser)
router.patch('/update-user/:id', userController.updateProfile)
router.patch('/update-standard/:id' ,userController.updateStandard)
router.delete('/delete-user/:id', auth, userController.deleteProfile)
router.delete('/delete/:id', auth, userController.deleteUser)

module.exports = router