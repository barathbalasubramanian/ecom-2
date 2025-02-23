const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res) => {
    const { username, email, password, phoneNumber, address } = req.body;

    try {
        const existingUser = await User.findOne({ 
            $or: [{ email }, { phoneNumber }] 
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone number already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            phoneNumber,
            address
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { email, phoneNumber, password } = req.body;

    try {
        const user = await User.findOne({ 
            $or: [{ email }, { phoneNumber }] 
        });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email/phone number or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.status(200).json(user);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            user.username = req.body.username;
            user.phoneNumber = req.body.phoneNumber;
            user.address = req.body.address
            user.save();
            res.status(200).json(user);
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { signup, login, getUserProfile, updateUserProfile };
