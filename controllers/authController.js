const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

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
        const user = await User.findById(req.user.id).select('-password').populate('addressBook');
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

const changePassword = async (req, res) => {
    const { oldPassword, newPassword, id } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendResetPasswordLink = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `${process.env.REACT_APP_BASE_URL}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Password',
            text: `Click the link to reset your password: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset password link sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    signup, 
    login, 
    getUserProfile, 
    updateUserProfile, 
    changePassword, 
    sendResetPasswordLink, 
    resetPassword 
};
