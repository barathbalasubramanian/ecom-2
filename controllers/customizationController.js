const Customization = require('../models/Customization');

const createCustomization = async (req, res) => {
    try {
        const customization = new Customization(req.body);
        await customization.save();
        res.status(201).json(customization);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomization = async (req, res) => {
    try {
        const customization = await Customization.findById(req.params.id);
        if (customization) {
            res.status(200).json(customization);
        } else {
            res.status(404).json({ message: 'Customization not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCustomization = async (req, res) => {
    try {
        const customization = await Customization.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (customization) {
            res.status(200).json(customization);
        } else {
            res.status(404).json({ message: 'Customization not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCustomization, getCustomization, updateCustomization };
