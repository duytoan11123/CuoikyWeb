const express = require("express");
const router = express.Router();
const {translateTextWithMyMemory, translateVietnameseWord, getExample} = require("../controllers/translateController");

router.post("/translate", translateVietnameseWord);
router.post("/translateP", translateTextWithMyMemory)
// Route để lấy từ ngẫu nhiên
router.post("/getExample", getExample);

module.exports = router;