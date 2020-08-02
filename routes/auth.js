const express = require('express');

const {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);

router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:resettoken', resetPassword);

module.exports = router;
