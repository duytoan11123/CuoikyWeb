require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.NEWSAPIORG_KEY;
const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

async function fetchNews(req, res) {
    try {
        const response = await axios.get(apiUrl);
        const articles = response.data.articles;
        res.status(200).json(articles);
    } catch (error) {
        console.error('Lỗi khi lấy tin tức:', error);
        res.status(500).json({ error: 'Lỗi khi lấy tin tức' });
    }
}

module.exports = fetchNews;
