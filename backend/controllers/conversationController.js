const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Đường dẫn file lưu trữ
const userResultPath = path.join(__dirname, '../sessions/conversationResults.json');
const cachePath = path.join(__dirname, '../sessions/conversationsCache.json');

// Danh sách nghĩa sai mẫu
const wrongMeanings = [
  'Quy định', 'Bàn ghế', 'Cửa sổ', 'Bánh mì', 'Xe đạp', 'Cây xanh', 'Đồng hồ', 'Sách vở', 'Bức tranh', 'Điện thoại',
  'Tủ lạnh', 'Bàn phím', 'Chai nước', 'Mặt trời', 'Con mèo', 'Con chó', 'Bóng đèn', 'Tivi', 'Máy tính', 'Cái kéo'
];

// Danh sách từ vựng cho từng chủ đề
const topicWords = {
  advertising: [
    'brand', 'campaign', 'influence', 'strategy', 'budget', 'media', 'reach', 'trend', 'creative', 'viral',
    'promotion', 'audience', 'conversion', 'engagement', 'placement', 'slogan', 'logo', 'awareness', 'sponsor', 'insight',
    'content', 'platform', 'analytics', 'segment', 'target', 'boost', 'launch', 'pitch', 'endorsement', 'retention'
  ],
  travel: [
    'destination', 'journey', 'adventure', 'explore', 'passport', 'itinerary', 'guide', 'tourist', 'landmark', 'culture',
    'flight', 'hotel', 'booking', 'luggage', 'souvenir', 'scenery', 'beach', 'mountain', 'island', 'cruise',
    'visa', 'customs', 'excursion', 'backpack', 'hostel', 'resort', 'sightseeing', 'local', 'trip', 'route'
  ],
  technology: [
    'innovation', 'device', 'software', 'hardware', 'network', 'digital', 'robot', 'automation', 'cloud', 'data',
    'AI', 'algorithm', 'platform', 'update', 'security', 'gadget', 'application', 'system', 'virtual', 'interface',
    'code', 'database', 'server', 'user', 'bug', 'feature', 'release', 'connect', 'wireless', 'smartphone'
  ],
  food: [
    'cuisine', 'dish', 'ingredient', 'recipe', 'flavor', 'taste', 'spicy', 'sweet', 'sour', 'bitter',
    'meal', 'snack', 'breakfast', 'lunch', 'dinner', 'dessert', 'beverage', 'fruit', 'vegetable', 'meat',
    'seafood', 'grill', 'boil', 'fry', 'bake', 'roast', 'serve', 'portion', 'menu', 'chef'
  ],
  education: [
    'student', 'teacher', 'lesson', 'subject', 'classroom', 'exam', 'score', 'grade', 'homework', 'assignment',
    'lecture', 'university', 'school', 'degree', 'diploma', 'scholarship', 'tuition', 'curriculum', 'knowledge', 'skill',
    'study', 'research', 'presentation', 'project', 'test', 'attendance', 'notebook', 'textbook', 'library', 'schedule'
  ],
  sports: [
    'athlete', 'coach', 'team', 'match', 'tournament', 'score', 'goal', 'win', 'lose', 'draw',
    'referee', 'stadium', 'league', 'training', 'competition', 'medal', 'record', 'champion', 'fan', 'supporter',
    'practice', 'exercise', 'fitness', 'injury', 'strategy', 'defense', 'offense', 'season', 'event', 'result'
  ],
  environment: [
    'nature', 'climate', 'pollution', 'recycle', 'waste', 'conservation', 'forest', 'wildlife', 'species', 'ecosystem',
    'sustainable', 'renewable', 'energy', 'carbon', 'footprint', 'emission', 'resource', 'biodiversity', 'habitat', 'ocean',
    'river', 'tree', 'plant', 'soil', 'air', 'water', 'weather', 'temperature', 'global', 'warming'
  ]
};

// Dữ liệu mẫu fallback
const mockDialogues = [
  [
    {
      speaker: 'Mochi',
      text: 'What do you know about branding?',
      translation: 'Bạn biết gì về thương hiệu?',
      highlight: null,
      quiz: null
    },
    {
      speaker: 'Michi',
      text: 'Branding is essential for every company.',
      translation: "Thương hiệu rất quan trọng đối với mọi <b class='text-blue-700 font-bold'>công ty</b>.",
      highlight: 'company',
      quiz: {
        word: 'company',
        options: ['Công ty', 'Thương'],
        correctIndex: 0,
        meaning: 'Công ty'
      }
    },
    {
      speaker: 'Mochi',
      text: 'Do you follow any campaigns online?',
      highlight: null,
      quiz: null,
      translation: 'Bạn có theo dõi chiến dịch nào trên mạng không?'
    },
    {
      speaker: 'Michi',
      text: 'Yes, I like creative campaigns with a strong message.',
      highlight: null,
      quiz: null,
      translation: 'Có, tôi thích những chiến dịch sáng tạo với thông điệp mạnh mẽ.'
    },
    {
      speaker: 'Mochi',
      text: 'Effective advertising reinforces value and builds a loyal customer base.',
      highlight: null,
      quiz: null,
      translation: 'Quảng cáo hiệu quả giúp củng cố giá trị và xây dựng cơ sở khách hàng trung thành.'
    }
  ]
];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Helper: Promise timeout
function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms))
  ]);
}

// Hàm dịch câu hoặc từ với Gemini
async function geminiTranslateText(text) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemma-3-1b-it' });
    const prompt = `Translate this English text to Vietnamese: "${text}". Only return the translation, no explanation.`;
    const result = await withTimeout(model.generateContent(prompt), 6000, null);
    if (!result) throw new Error('Timeout Gemini translate');
    let translation = await result.response.text();
    translation = translation.replace(/\n|\r/g, '').trim();
    return translation;
  } catch (error) {
    console.error('Gemini Translate error:', error.message);
    const translations = {
      'brand': 'thương hiệu',
      'campaign': 'chiến dịch',
      'advertising': 'quảng cáo',
      'creative': 'sáng tạo',
      'message': 'thông điệp',
      'influence': 'tầm ảnh hưởng',
      'strategy': 'chiến lược',
      'budget': 'ngân sách',
      'media': 'truyền thông',
      'reach': 'phạm vi tiếp cận',
      'company': 'công ty'
    };
    return translations[text.toLowerCase()] || text;
  }
}

// Hàm tạo câu hỏi trắc nghiệm từ từ khóa
async function generateQuiz(word) {
  const translation = await geminiTranslateText(word);
  const options = [translation];
  while (options.length < 2) {
    const wrongOption = wrongMeanings[getRandomInt(wrongMeanings.length)];
    if (!options.includes(wrongOption)) options.push(wrongOption);
  }
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    word,
    options,
    correctIndex: options.indexOf(translation),
    meaning: translation
  };
}

// Hàm tạo hội thoại ngẫu nhiên với từ vựng ép buộc
async function generateConversationWithWord(topic, vocabWord) {
  const cacheKey = `${topic}_${vocabWord}`;
  let cache = {};
  if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
  if (cache[cacheKey]) {
    console.log(`Using cached dialogue for ${cacheKey}`);
    return cache[cacheKey];
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemma-3-1b-it' });
    const prompt = `
      Generate a short conversation (5 exchanges) in English between two characters, Mochi and Michi, discussing the topic of "${topic}". 
      Ensure at least 3 exchanges are spoken by Michi, and in one of Michi's lines, highlight (with the field 'highlight') the word "${vocabWord}" (do not highlight any other word, and do not highlight in Mochi's lines). 
      Each exchange should be 1-2 complete sentences. 
      Return the response as a clean JSON array of objects with fields: speaker, text, highlight (the vocabulary word or null), quiz (null).
      Do not include Markdown code fences (e.g., \`\`\`json) or any other formatting, just the raw JSON.
      Example:
      [
        {"speaker": "Mochi", "text": "Some text", "highlight": null, "quiz": null},
        {"speaker": "Michi", "text": "Some text with keyword", "highlight": "${vocabWord}", "quiz": null}
      ]
    `;
    const result = await withTimeout(model.generateContent(prompt), 6000, null);
    if (!result) throw new Error('Timeout Gemini conversation');
    let responseText = await result.response.text();
    responseText = responseText.replace(/```json\n|```|\n/g, '').trim();
    let dialogue;
    try {
      dialogue = JSON.parse(responseText);
      dialogue = dialogue.filter(item => 
        item.speaker && item.text && item.text.trim() && item.text.endsWith('.')
      );
      if (dialogue.length < 5) throw new Error('Incomplete dialogue');
    } catch (error) {
      console.error('Dialogue parsing error:', error.message);
      dialogue = [];
    }
    let quizCount = 0;
    let newDialogue = [];
    for (const item of dialogue) {
      const translation = await geminiTranslateText(item.text);
      if (item.speaker === 'Michi' && item.highlight === vocabWord && quizCount === 0) {
        quizCount++;
        const quiz = await generateQuiz(item.highlight);
        let highlightedTranslation = translation.replace(
          new RegExp(`\\b${quiz.meaning}\\b`, 'i'),
          `<b class='text-blue-700 font-bold'>${quiz.meaning}</b>`
        );
        if (highlightedTranslation === translation) {
          highlightedTranslation += ` (<b class='text-blue-700 font-bold'>${quiz.meaning}</b>)`;
        }
        newDialogue.push({
          ...item,
          translation: highlightedTranslation,
          quiz
        });
      } else {
        newDialogue.push({
          ...item,
          translation,
          highlight: null,
          quiz: null
        });
      }
    }
    dialogue = newDialogue;
    if (dialogue.some(item => item.quiz && item.speaker === 'Michi' && item.highlight === vocabWord)) {
      cache[cacheKey] = dialogue;
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
      return dialogue;
    }
    return mockDialogues[0];
  } catch (error) {
    console.error('Generate conversation error:', error.message);
    return mockDialogues[0];
  }
}

module.exports.generateConversationWithWord = generateConversationWithWord;

exports.getConversation = async (req, res) => {
  const { topic } = req.params;
  const idx = parseInt(req.query.idx || '0', 10);
  if (!topicWords[topic]) return res.status(404).json({ message: 'No conversation found for this topic.' });

  // Lưu cache hội thoại cho user theo topic (có thể dùng session hoặc userId nếu muốn)
  let dialogue;
  if (req.query.cacheKey) {
    // Nếu client truyền cacheKey, lấy lại hội thoại cũ từ cache
    let cache = {};
    if (fs.existsSync(cachePath)) {
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
    dialogue = cache[req.query.cacheKey];
    if (!dialogue) return res.status(404).json({ message: 'No cached conversation found.' });
  } else {
    // Sinh hội thoại mới
    const words = topicWords[topic];
    const shuffled = words.sort(() => 0.5 - Math.random());
    const selectedWord = shuffled[0];
    dialogue = await generateConversationWithWord(topic, selectedWord);
    // Lưu cache lại, trả về cacheKey cho client
    let cache = {};
    if (fs.existsSync(cachePath)) {
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
    // Tạo cacheKey duy nhất
    const cacheKey = `${topic}_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    cache[cacheKey] = dialogue;
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    return res.json({
      dialogue: [dialogue[0]],
      cacheKey,
      total: dialogue.length,
      idx: 0
    });
  }

  // Trả về lượt hội thoại theo index
  if (!dialogue || !Array.isArray(dialogue) || idx >= dialogue.length) {
    return res.json({ done: true });
  }
  return res.json({
    dialogue: [dialogue[idx]],
    cacheKey: req.query.cacheKey,
    total: dialogue.length,
    idx
  });
};

exports.saveUserResult = (req, res) => {
  const { userId, topic, vocab, isCorrect } = req.body;
  if (!userId || !topic || !vocab) return res.status(400).json({ message: 'Missing data.' });
  let results = {};
  if (fs.existsSync(userResultPath)) {
    results = JSON.parse(fs.readFileSync(userResultPath, 'utf8'));
  }
  if (!results[userId]) results[userId] = {};
  if (!results[userId][topic]) results[userId][topic] = [];
  results[userId][topic].push({ vocab, isCorrect, time: Date.now() });
  fs.writeFileSync(userResultPath, JSON.stringify(results, null, 2));
  res.json({ message: 'Result saved.' });
};

exports.translateWord = async (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ message: 'No word provided.' });
  const translation = await geminiTranslateText(word);
  res.json({ results: [{ meaning: translation }] });
};