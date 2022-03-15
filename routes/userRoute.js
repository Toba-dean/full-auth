const userRoutes = require('../controller/userCtrl');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');


const { register, activateEmail, login, getAccessToken, forgetPassword, resetPassword, getUserInfo, getAllUsersInfo, logout, updateUser, updateUserRole, deleteUser, googleLogin, facebookLogin } = userRoutes;

router.route('/register').post(register);
router.route('/activate').post(activateEmail);
router.route('/login').post(login);
router.route('/refresh_token').post(getAccessToken);
router.route('/forget').post(forgetPassword);
router.route('/reset').post(auth, resetPassword);
router.route('/info').get(auth, getUserInfo);
router.route('/all_info').get(auth, authAdmin, getAllUsersInfo);
router.route('/logout').get(logout);
router.route('/update').patch(auth, updateUser);
router.route('/update-role/:id').patch(auth, authAdmin, updateUserRole);
router.route('/delete/:id').delete(auth, authAdmin, deleteUser);


// Social Login
router.route('/google-login').post(googleLogin)
router.route('/facebook-login').post(facebookLogin)



module.exports = router  