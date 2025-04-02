const express = require('express');
const { createProduct, getProducts, getProduct, updateProduct, getProductsDesign, getFilteredProducts } = require('../controllers/productController');
const router = express.Router();

router.post('/addproduct', createProduct);
router.get('/getallproducts', getProducts);
router.get('/getallproducts/design', getProductsDesign);
router.get('/getproduct/:id', getProduct);
router.put('/editproduct/:id', updateProduct);
router.get('/filter', getFilteredProducts);

module.exports = router;