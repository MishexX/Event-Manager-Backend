const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto')


const path = require('path');

const fs = require('fs');
const { sendVerificationEmail } = require('../config/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// exports.registerUser = async (req, res) => {
//   console.log('hello');
//   const { name, email, password } = req.body;

//   try {
//     const userExists = await User.findOne({ email });

//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const user = await User.create({ name, email, password });

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification token and set expiration
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires
    });

    // Send verification email
    const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email,  verificationToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: 'Please check your email to verify your account.'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Redirect to frontend URL with a query parameter indicating success
    res.redirect('http://127.0.0.1:8080?emailVerified=true'); // Update with your frontend URL
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};






exports.authUser = async (req, res) => {
  console.log('authUser function hit'); // Add this line
  
  const { email, password } = req.body;

  console.log(email);
  

  try {
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log('Invalid email or password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





exports.getProtectedRoute = async (req, res) => {
  res.json({ message: 'accessed protected route' });
};



// personal information 

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}



exports.updateUserByEmail = async (req, res) => {
  const { name, last_name, date_of_birth, phone_number } = req.body;
  const profileImage = req.files?.profile_image;

  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.last_name = last_name || user.last_name;
    user.date_of_birth = date_of_birth || user.date_of_birth;
    user.phone_number = phone_number || user.phone_number;

    if (profileImage) {
      const uploadPath = path.join(uploadDir, profileImage.name);
      
      profileImage.mv(uploadPath, async (err) => {
        if (err) {
          console.error('Failed to upload image:', err);
          return res.status(500).json({ message: 'Failed to upload image' });
        }
        user.profile_image = `/uploads/${profileImage.name}`;
        
        await user.save();
        res.json({ message: 'Profile updated successfully' });
      });
    } else {
      await user.save();
      res.json({ message: 'Profile updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
// personal information 





// Change Password Controller
exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Update password (hashing is handled by the pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Reset Password Controller
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (hashing is handled by the pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
