const express = require('express');
const authRoutes = require('./routes/authRoutes');
const vocabularyRoute = require('./routes/vocabularyRoutes')
const session = require('express-session');
const passport = require('passport');
const newsRoutes = require('./routes/newsRoutes');
const cors = require('cors');
const translateRoutes = require('./routes/translateRoutes');
const { getAccountName } = require('./controllers/Getaccount');
const accountRoutes = require('./routes/accountRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Test route at root
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.json({ status: 'success', message: 'Server is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);


app.use('/api/account', accountRoutes);
//vocabularyRoute
app.use('/api', translateRoutes);
app.use('/api/vocabulary',vocabularyRoute);
app.use("/api/get", newsRoutes);
app.use('/api/account', accountRoutes);
app.use('/api', conversationRoutes);

// Route trả về thông tin user hiện tại
app.get('/api/me', async (req, res) => {
  if (req.session && req.session.userId) {
    // Lấy thêm thông tin user từ DB nếu muốn trả về name
    try {
      const { poolPromise } = require('./config/db');
      const pool = await poolPromise;
      const [rows] = await pool.query('SELECT Name FROM Users WHERE userId = ?', [req.session.userId]);
      const name = rows.length > 0 ? rows[0].Name : null;
      res.json({
        loggedIn: true,
        userId: req.session.userId,
        name: name
      });
    } catch (err) {
      res.json({ loggedIn: true, userId: req.session.userId });
    }
  } else {
    res.json({ loggedIn: false });
  }
});

// Handle 404
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ 
        status: 'error',
        message: 'Route not found',
        path: req.url
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        status: 'error',
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 4000;

// Start server
const server = app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} đang được sử dụng bởi một process khác`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
    }
});