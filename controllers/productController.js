const Product = require('../models/Product');
const Customization = require('../models/Customization');

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
        const products = await Product.find({ isDeleted: false })
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
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
