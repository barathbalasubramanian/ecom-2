const express = require('express');
const { signup, login, updateUserProfile, getUserProfile, changePassword, sendResetPasswordLink, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/profile', protect ,updateUserProfile);
router.get('/profile', protect ,getUserProfile);
router.put('/change-password', protect, changePassword);
router.post('/reset-password-link', sendResetPasswordLink);
router.post('/reset-password', resetPassword);

module.exports = router;
