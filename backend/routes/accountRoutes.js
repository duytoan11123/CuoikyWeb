const express = require('express');
const router = express.Router();
const {getUserId,
    getAccountName,
    getAccountVocabulary,
    updateAccountName,
    changePassword } = require('../controllers/accountController');

router.get('/getUserId', getUserId);
router.get('/getAccountName', getAccountName);
router.get('/getAccountVocabulary', getAccountVocabulary);
router.post('/updateAccountName', updateAccountName);
router.post('/changePassword', changePassword);


module.exports = router;