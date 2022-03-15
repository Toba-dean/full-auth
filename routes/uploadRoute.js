const uploadRoutes = require('../controller/uploadCtrl');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadImage = require('../middleware/uploadImg');


router.route('/').post(uploadImage, auth, uploadRoutes.uploadAvatar)


module.exports = router  