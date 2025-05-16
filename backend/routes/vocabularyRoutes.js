const express = require('express');
const router = express.Router();
const {addWord} = require('../controllers/vocabularyController');

// Regular login route
router.post('/addWord', addWord);


module.exports = router;
