const express = require('express');
const multer = require("multer");
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');
const { restrictTo } = require('../middleware/permissions');

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
    if (file.mimetype.startsWith("video")) {
        callback(null, true)
    } else {
        callback(null, Error("only video is allowd"))
    }
}

var upload = multer({
    storage: imgconfig,
    fileFilter: isImage
})

router.post('/add', auth, upload.single('video'), blogController.createBlogs);
router.get('/all', auth, blogController.getAll);
router.get('/one/:id', blogController.getOne);
router.get('/current', auth, blogController.getCurrentUser)
router.get('/search/:key', blogController.search);
router.patch('/update/:id', auth, upload.single('image'), restrictTo('admin', 'publisher'), blogController.update);
router.delete('/delete/:id', auth, restrictTo('admin', 'publisher'), blogController.remove);
router.patch('/publish/:id', auth, restrictTo('admin'), blogController.publish)
router.get('/published', auth, restrictTo('admin'), blogController.allpublished)
router.patch('/published-all', auth, restrictTo('admin'), blogController.publishAllBlogs)
router.patch('/update-comments/:id', auth, restrictTo('admin', 'publisher'), blogController.updateComment)
router.patch('/add-comments/:id', auth, blogController.createComment)
router.delete('/delete-comments/:id', auth, restrictTo('admin', 'publisher'), blogController.deleteComment)
module.exports = router