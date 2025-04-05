const express = require('express');
const { createProduct, getProducts, getProduct, updateProduct, getProductsDesign, getFilteredProducts, getFeaturedProducts } = require('../controllers/productController');
const router = express.Router();

router.post('/addproduct', createProduct);
router.get('/getallproducts', getProducts);
router.get('/getallproducts/design', getProductsDesign);
router.get('/getproduct/:id', getProduct);
router.put('/editproduct/:id', updateProduct);
router.get('/filter', getFilteredProducts);
router.get('/featured', getFeaturedProducts);

module.exports = router;