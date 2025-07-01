const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// Lấy hội thoại ngẫu nhiên theo chủ đề
router.get('/conversation/:topic', conversationController.getConversation);

// Lưu kết quả học của user
router.post('/conversation/result', conversationController.saveUserResult);

// Dịch nghĩa từ
router.post('/conversation/translate', conversationController.translateWord);

module.exports = router;