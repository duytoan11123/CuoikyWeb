const express = require('express');
const router = express.Router();
const { addWord, getWords, getReviewWords, getSleepWords, getWordsByLevel, updateWordTypes } = require('../controllers/vocabularyController');

router.post('/addWord', addWord);
router.get('/getWords', getWords);
router.get('/getReviewWords', getReviewWords);
router.get('/getSleepWords', getSleepWords);
router.get('/getWordsByLevel', getWordsByLevel);
router.post('/updateWordTypes', updateWordTypes); // Thêm route mới

module.exports = router;