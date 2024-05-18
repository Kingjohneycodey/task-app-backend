const generator = require('../middleware/generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const otpHelper = require('../helpers/otpHelper')
const nodemailer = require('nodemailer')
const User = require('../models/User');
const Job = require('../models/Job');

// user authentication
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status === 'pending') {
      return res.status(401).json({ error: 'Your account has not been verified. Please check your email for the verification email' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        userId: user.userId,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        is_admin: 'false'
      },
      process.env.JWT_SECRET,
      { expiresIn: '120h' }
    );

    res.status(200).json({ message: 'Login successful', user: { token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}; 

async function generateUniqueNumber() {
  while (true) {
      // Generate a random 9-digit number
      const randomNumber = Math.floor(100000000 + Math.random() * 900000000);

      // Combine with a timestamp
      const timestamp = new Date().getTime();

      // Generate account number
      const uniqueNumber = timestamp.toString().slice(-3) + randomNumber.toString().slice(-7);

      // Check if the generated account number already exists in the database
      const existingAccount = await User.findOne({ uniqueNumber });

      if (!existingAccount) {
          // If account number doesn't exist, return it
          return uniqueNumber;
      }
  }
}


exports.registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Check if required fields are present
    // if (!firstname || !lastname || !email || !password) {
    //   return res.status(400).json({ error: 'All fields are required' });
    // }

       // Check if firstname is missing
       if (!firstname) {
        return res.status(400).json({ error: 'First name is required' });
      }
  
      // Check if lastname is missing
      if (!lastname) {
        return res.status(400).json({ error: 'Last name is required' });
      }
  
      // Check if email is missing
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      // Check if password is missing
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

    const userId = generator.generateUniqueID();
    const hashedPassword = await bcrypt.hash(password, 10);

    
    // const expirationTime = 30 * 60; // 30 minutes in seconds
    // const otp = otpHelper.generateOTP();
    // const otpcode =otp
    // const token = jwt.sign({ email, otp: otpcode }, process.env.JWT_SECRET, { expiresIn: expirationTime });

    // await otpHelper.sendOTPByEmail(email, otpcode, token, firstname);


    const sameEmail = await User.findOne({ email });
    if (sameEmail) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      userId,
      status: 'active',
    });

    res.status(201).json({ message: 'User registered successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'User registration not successful' });
  }
};


// user profile

exports.userProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findOne({ userId }).select('-password');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.editProfile = async (req, res) => {
  const { firstname, lastname } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        firstname, lastname
      },
      { new: true } // To return the updated document
    );

    console.log("Updated user:", updatedUser); // Log the updated user object
    res.status(200).json({ success: true, message: "User profile updated successfully" });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller function to create a new job
exports.createJob = async (req, res) => {
  // Check if all required fields are present
  const requiredFields = ["title", "type", "description", "timeline", "price"];
  const missingFields = requiredFields.filter(field => !(field in req.body));

  if (missingFields.length > 0) {
    return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const currentDate = new Date(); // Get the current date
    const jobData = {
      ...req.body,
      status: 'available',
      clientId: req.user.id,
      date: currentDate,
    };
    
    const job = new Job(jobData);
    await job.save();
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Controller function to update a job by ID
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndUpdate(id, req.body, { new: true });
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Controller function to get a single job by ID
exports.getSingleJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCreatedJobsByUser = async (req, res) => {
  try {
    const clientId = req.user.id;
    const jobs = await Job.find({ clientId });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

