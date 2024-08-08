const express = require('express');
const router = express.Router();
const { createRegistration, getRegistrationsByEmail } = require('../controllers/registrationController');

// Route to create a new registration
router.post('/register', createRegistration);

// Route to get all registrations for a specific user email
router.get('/registrations/:userEmail', getRegistrationsByEmail);

module.exports = router;
