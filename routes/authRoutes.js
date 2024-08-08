const express = require('express');
const {
  registerUser,
  authUser,
  getProtectedRoute,
  getUserByEmail,
  updateUserByEmail,
  changePassword,
  resetPassword,
  verifyEmail,
} = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', authUser);
router.get('/protected', protect, getProtectedRoute);

router.get('/user/:email', getUserByEmail);
router.put('/user/:email', updateUserByEmail);

router.put('/change-password', changePassword);

// Route to reset password
router.post('/reset-password', resetPassword);


module.exports = router;
