const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const blogRoutes = require('./blogRoutes');
const authRoutes = require('./authRoutes')

router.use('/user',userRoutes);
router.use('/blogs',blogRoutes)
router.use('/auth',authRoutes)
module.exports = router