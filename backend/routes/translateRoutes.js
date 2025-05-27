const express = require("express");
const router = express.Router();
const {translateVietnameseWord, getExample} = require("../controllers/translateController");

router.post("/translate", translateVietnameseWord);

// Route để lấy từ ngẫu nhiên
router.post("/getExample", getExample);

module.exports = router;