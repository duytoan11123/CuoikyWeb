const express = require('express');
const router = express.Router();
const { logoutUser,registerUser,loginUser, googleAuth, googleAuthCallback } = require('../controllers/authController');

// Regular login route
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
// Google authentication routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

module.exports = router;
