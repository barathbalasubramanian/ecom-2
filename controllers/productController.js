const Product = require('../models/Product');
const Customization = require('../models/Customization');
const Category = require('../models/Category');

exports.createProduct = async (req, res) => {
    try {
        const productExists = await Product.findOne({ productName: req.body.productName });
        if (productExists) {
            return res.status(400).json({ error: 'Product already exists' });
        }

        let customizationId = null;
        if (req.body.customization && req.body.customizationData) {
            const newCustomization = new Customization(req.body.customizationData);
            await newCustomization.save();
            customizationId = newCustomization._id;
        }

        const product = new Product({
            ...req.body,
            customizationId
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
    
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false, isDesignLab: false })
            .populate('categoryId variantId customizationId');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductsDesign = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false, isDesignLab: true })
            .populate('categoryId variantId customizationId');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId variantId customizationId');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (req.body.customization && req.body.customizationData) {
            if (product.customizationId) {
                await Customization.findByIdAndUpdate(product.customizationId, req.body.customizationData, { new: true });
            } else {
                const newCustomization = new Customization(req.body.customizationData);
                await newCustomization.save();
                product.customizationId = newCustomization._id;
            }
        }

        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFilteredProducts = async (req, res) => {
    try {
        const { categoryType, categoryName, subCategory } = req.query;
        
        const query = { isDeleted: false };
        
        if (categoryType && categoryName) {
            const category = await Category.findOne({ 
                categoryType: categoryType,
                categoryName: categoryName,
                isDeleted: false 
            });
            
            if (!category) {
                return res.status(404).json({ error: 'No category found matching both type and name' });
            }
            
            query.categoryId = category._id;
        } else if (categoryType) {
            const categories = await Category.find({ 
                categoryType: categoryType,
                isDeleted: false 
            });
            
            if (categories.length === 0) {
                return res.status(404).json({ error: 'No categories found for the specified type' });
            }
            
            query.categoryId = { $in: categories.map(cat => cat._id) };
        } else if (categoryName) {
            const category = await Category.findOne({ 
                categoryName: categoryName,
                isDeleted: false 
            });
            
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            
            query.categoryId = category._id;
        }
        
        if (subCategory) {
            const categoriesWithSub = await Category.find({
                subCategories: subCategory,
                isDeleted: false
            });

            if (categoriesWithSub.length === 0) {
                return res.status(404).json({ error: 'No categories found with the specified subcategory' });
            }
            
            if (query.categoryId) {
                const category = await Category.findById(query.categoryId);
                if (!category.subCategories.includes(subCategory)) {
                    return res.status(404).json({ error: 'Subcategory not found in the specified category' });
                }
            } else {
                query.categoryId = { $in: categoriesWithSub.map(cat => cat._id) };
            }
        }

        const products = await Product.find(query)
            .populate('categoryId variantId customizationId');
            
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
