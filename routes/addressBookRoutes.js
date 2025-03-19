const express = require('express');
const { addAddress, updateAddress, deleteAddress, getAddresses } = require('../controllers/addressBookController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, addAddress);
router.put('/:addressId', protect, updateAddress);
router.delete('/:addressId', protect, deleteAddress);
router.get('/', protect, getAddresses);

module.exports = router;