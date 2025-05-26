const { sql, poolPromise } = require('../config/db');
const axios = require('axios');
const cheerio = require('cheerio');

const addWord = async (req, res) => {
  const pool = await poolPromise;
  const { userId, word, type } = req.body;
  try {
    const [check] = await pool.query('SELECT * FROM vocabulary WHERE userId = ? AND word = ?', [userId, word]);
    if (check.length > 0) {
      res.status(500).json({
        status: 'failed',
        message: 'Từ đã tồn tại',
      });
      return;
    }
    await pool.query('INSERT INTO vocabulary (word, userId, type) VALUES (?, ?,?)', [word, userId, type || 'review']);
    res.status(200).json({
      status: 'success',
      message: 'Thêm từ thành công',
    });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const fetchTranslation = async (word) => {
  const url = `http://vdict.com/${encodeURIComponent(word)},1,0,0.html`;
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    const $ = cheerio.load(response.data);
    const results = [];

    const phonetic = $('.pronunciation.text-muted')?.text().trim();
    const academicDefinition = $('#academicDefinition');

    $(academicDefinition)
      .find('.word-type-section')
      .each((index, section) => {
        if (index === 0) {
          const partOfSpeech = $(section).find('.word-type').text().trim();
          let meaning;
          $(section)
            .find('ol.meanings-list li.meaning')
            .each((meaningIndex, meaningEl) => {
              if (meaningIndex === 0) {
                $(meaningEl)
                  .find('.meaning-value')
                  .each((valueIndex, meaningVl) => {
                    if (valueIndex === 0) {
                      meaning = $(meaningVl)
                        .contents()
                        .map((_, el) => $(el).text())
                        .get()
                        .join('')
                        .trim();
                    }
                  });
              }
            });
          if (meaning) {
            results.push({ partOfSpeech, meaning, phonetic });
          }
        }
      });

    return results.length > 0 ? results : null;
  } catch (error) {
    console.error('Error fetching translation:', error.message);
    return null;
  }
};

const getWords = async (req, res) => {
  const pool = await poolPromise;
  const { userId, search } = req.query;
  try {
    let query = 'SELECT * FROM vocabulary WHERE userId = ?';
    let params = [userId];
    if (search) {
      query += ' AND word LIKE ?';
      params.push(`%${search}%`);
    }
    const [words] = await pool.query(query, params);

    const enrichedWords = await Promise.all(
      words.map(async (wordObj) => {
        const translation = await fetchTranslation(wordObj.word);
        const targetTranslation = translation?.find(
          (trans) => trans.meaning === 'của ai'
        ) || translation?.[0];
        return {
          word: wordObj.word,
          phonetic: targetTranslation?.phonetic,
          meaning: targetTranslation?.meaning,
          partOfSpeech: targetTranslation?.partOfSpeech,
          type: wordObj.type,
        };
      })
    );

    res.status(200).json(enrichedWords);
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const getReviewWords = async (req, res) => {
  const pool = await poolPromise;
  const { userId } = req.query;
  try {
    const [result] = await pool.query(
      "SELECT COUNT(*) as total FROM vocabulary WHERE userId = ? AND type = 'review'",
      [userId]
    );
    res.status(200).json({ total: result[0].total });
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const getSleepWords = async (req, res) => {
  const pool = await poolPromise;
  const { userId } = req.query;
  try {
    const [words] = await pool.query(
      "SELECT * FROM vocabulary WHERE userId = ? AND type = 'sleep'",
      [userId]
    );
    res.status(200).json(words);
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const getWordsByLevel = async (req, res) => {
  const pool = await poolPromise;
  const { userId, level } = req.query;

  let lengthCondition = '';
  switch (parseInt(level)) {
    case 1:
      lengthCondition = 'LENGTH(word) <= 3';
      break;
    case 2:
      lengthCondition = 'LENGTH(word) BETWEEN 4 AND 5';
      break;
    case 3:
      lengthCondition = 'LENGTH(word) BETWEEN 6 AND 7';
      break;
    case 4:
      lengthCondition = 'LENGTH(word) BETWEEN 8 AND 9';
      break;
    case 5:
      lengthCondition = 'LENGTH(word) >= 10';
      break;
    default:
      return res.status(400).json({
        status: 'failed',
        message: 'Cấp độ không hợp lệ',
      });
  }

  try {
    const query = `SELECT * FROM vocabulary WHERE userId = ? AND ${lengthCondition}`;
    const [words] = await pool.query(query, [userId]);

    const enrichedWords = await Promise.all(
      words.map(async (wordObj) => {
        const translation = await fetchTranslation(wordObj.word);
        const targetTranslation = translation?.find(
          (trans) => trans.meaning === 'của ai'
        ) || translation?.[0];
        return {
          word: wordObj.word,
          phonetic: targetTranslation?.phonetic,
          meaning: targetTranslation?.meaning,
          partOfSpeech: targetTranslation?.partOfSpeech,
          type: wordObj.type,
        };
      })
    );

    res.status(200).json(enrichedWords);
  } catch (err) {
    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

const updateWordTypes = async (req, res) => {
  const pool = await poolPromise;
  const { userId, reviewWords, sleepWords } = req.body;

  try {
    await pool.query('BEGIN');

    if (reviewWords && reviewWords.length > 0) {
      const placeholders = reviewWords.map(() => '?').join(',');
      await pool.query(
        `UPDATE vocabulary SET type = 'review' WHERE userId = ? AND word IN (${placeholders})`,
        [userId, ...reviewWords]
      );
    }

    if (sleepWords && sleepWords.length > 0) {
      const placeholders = sleepWords.map(() => '?').join(',');
      await pool.query(
        `UPDATE vocabulary SET type = 'sleep' WHERE userId = ? AND word IN (${placeholders})`,
        [userId, ...sleepWords]
      );
    }

    await pool.query('COMMIT');
    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái từ thành công',
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({
      status: 'failed',
      message: err.message,
    });
  }
};

module.exports = {
  addWord,
  getWords,
  getReviewWords,
  getSleepWords,
  getWordsByLevel,
  updateWordTypes,
};
