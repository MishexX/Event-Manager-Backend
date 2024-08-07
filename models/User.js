const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    // required: true,
  },

  date_of_birth: {
    type: Date, 
    // required: true,
  },

  phone_number: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile_image: {
    type: String,
  
  },
  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  },
  
});



UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  console.log('Entered Password for Comparison:', enteredPassword);
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log('Does Password Match?:', isMatch);
  return isMatch;
};



module.exports = mongoose.model('User', UserSchema);
