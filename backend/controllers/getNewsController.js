require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio')
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ explicitArray: true });
const { htmlToText } = require('html-to-text');
function cleanDescription(rawHtml) {
  return htmlToText(rawHtml, {
    wordwrap: false, // Không tự động xuống dòng
    selectors: [
      { selector: 'a', format: 'skip' }, // Bỏ qua các link "Continue reading..."
    ],
  }).trim();
}
async function fetchNews(req, res) {
  try {
    const response = await axios.get('https://www.theguardian.com/world/rss'); // ví dụ
    const result = await parser.parseStringPromise(response.data);

    const items = result.rss.channel[0].item;

    const cleaned = items.map(item => ({
      title: item.title?.[0] || '',
      description: cleanDescription(item.description?.[0]) || '',
      link: item.link?.[0] || '',
      pubDate: item.pubDate?.[0] || '',
      thumbnail: item['media:content']?.[0]?.$.url || null,
    }));
    res.json(cleaned);
  } catch (error) {
    console.error('Error fetching RSS:', error.message);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
}

async function fetchHtmlFromUrl(req, res) {
  const { decodeUrl } = req.body;
  console.log("URL cần fetch:", decodeUrl);

  try {
    const response = await axios.get(decodeUrl, {
      headers: {
        // 2. Giả lập trình duyệt thật
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000, // 10s timeout
    });
    const $ =cheerio.load(response.data);

    const data = $('#maincontent').html();
    res.status(200).json({html: data});
  } catch (err) {
    console.error('Lỗi khi lấy HTML:', err.message);
    res.status(500).json({ error: 'Không thể lấy nội dung từ URL đã cho' });
  }
}
module.exports = {fetchNews, fetchHtmlFromUrl}
