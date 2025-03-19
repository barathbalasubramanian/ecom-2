const AddressBook = require('../models/AddressBook');
const User = require('../models/User');

const addAddress = async (req, res) => {
    try {
        const newAddress = new AddressBook({
            userId: req.user.id,
            fullName: req.body.fullName,
            phoneNumber: req.body.phoneNumber,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            landmark: req.body.landmark,
            city: req.body.city,
            country: req.body.country,
            postalCode: req.body.postalCode,
            defaultAddress: req.body.defaultAddress || false,
        });

        if (newAddress.defaultAddress) {
            await AddressBook.updateMany({ userId: req.user.id }, { defaultAddress: false });
        }

        const savedAddress = await newAddress.save();

        await User.findByIdAndUpdate(req.user.id, { $push: { addressBook: savedAddress._id } });

        res.status(201).json(savedAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAddress = async (req, res) => {
    try {
        const address = await AddressBook.findById(req.params.addressId);
        if (!address || address.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Address not found' });
        }

        Object.assign(address, req.body);

        if (req.body.defaultAddress) {
            await AddressBook.updateMany({ userId: req.user.id }, { defaultAddress: false });
        }

        const updatedAddress = await address.save();
        res.status(200).json(updatedAddress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const address = await AddressBook.findById(req.params.addressId);
        if (!address || address.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Address not found' });
        }

        await address.remove();

        await User.findByIdAndUpdate(req.user.id, { $pull: { addressBook: req.params.addressId } });

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAddresses = async (req, res) => {
    try {
        const addresses = await AddressBook.find({ userId: req.user.id });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addAddress, updateAddress, deleteAddress, getAddresses };