const express = require('express');
const { signup, login, updateUserProfile, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/profile', protect ,updateUserProfile);
router.get('/profile', protect ,getUserProfile);

module.exports = router;
