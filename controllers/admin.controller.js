const generator = require('../middleware/generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const nodemailer = require('nodemailer')

const Admin = require('../models/Admin');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await Admin.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        name: user.name,
        email: user.email,
        referralId: user.referralId,
        is_admin: user.is_admin
      },
      secretKey,
      { expiresIn: '12h' }
    );

    res.status(200).json({ message: 'Login successful', user: { token } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = generator.generateUniqueID();

    const sameuser = await Admin.findOne({ name });
    if (sameuser) {
      return res.status(400).json({ error: 'Username is taken' });
    }

    const sameemail = await Admin.findOne({ email });
    if (sameemail) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Admin.create({
      name,
      email,
      password: hashedPassword,
      is_admin: true,
      userId
    });

    res.status(201).json({ message: 'Admin registered successfully', user: newUser });
  } catch (error) {
    res.status(400).json({ error: 'Admin registration not successful' });
  }
};

exports.adminProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await Admin.findOne({ userId }, { password: 0 });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.log(error);
  }
};

exports.editProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.userId;

  try {
    const user = await Admin.findOneAndUpdate(
      { userId },
      { name, email },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating admin details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// users

exports.fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')

    res.status(200).json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.fetchUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findOne({ userId });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching single user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.userId;
  const { status } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { userId },
      {
        status
      },
      { new: true } // To return the updated document
    );

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

