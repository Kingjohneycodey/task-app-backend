const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const bearerToken = req.header('Authorization')
    const token = bearerToken.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

const checkAdmin = async (req, res, next) => {
    const userId = req.user.userId;

    try {
        const user = await Admin.findOne({ userId });

        if (user && user.is_admin) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied. You are not an admin.' });
        }
    } catch (error) {
        console.error('Error checking admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const checkUser = async (req, res, next) => {
    const userId = req.user.userId;

    try {
        const user = await User.findOne({ userId });

        if (user) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied. You are not a user.' });
        }
    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {
    verifyToken,
    checkAdmin,
    checkUser,
}