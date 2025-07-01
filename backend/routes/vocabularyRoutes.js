const express = require('express');
const router = express.Router();
const { addWord,deleteVocabulary,getRandomWord, getWords, getReviewWords, getSleepWords, getWordsByLevel, updateWordTypes } = require('../controllers/vocabularyController');

router.get('/getWords', getWords);
router.get('/getReviewWords', getReviewWords);
router.get('/getSleepWords', getSleepWords);
router.get('/getWordsByLevel', getWordsByLevel);
router.post('/updateWordTypes', updateWordTypes); // Thêm route mới
router.get("/getRandomWord", getRandomWord);
router.post("/delete", deleteVocabulary)
router.post("/addWord", addWord)    
module.exports = router;