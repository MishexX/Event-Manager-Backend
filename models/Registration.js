const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  eventName: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  admin: { type: String, required: true },
  date: { type: Date, }
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
