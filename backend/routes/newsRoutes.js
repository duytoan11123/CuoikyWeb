const express = require('express');
const router = express.Router();
const {fetchNews, fetchHtmlFromUrl} = require('../controllers/getNewsController');

router.get("/news",fetchNews);
router.post("/fetchHtmlFromUrl", fetchHtmlFromUrl);

module.exports = router