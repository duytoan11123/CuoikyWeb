const express = require('express');
const router = express.Router();
const { loginUser, googleAuth, googleAuthCallback } = require('../controllers/authController');

// Regular login route
router.post('/login', loginUser);

// Google authentication routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

module.exports = router;
