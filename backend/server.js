const express = require('express');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const passport = require('passport');
const fetchNews = require('./controllers/getNews');
const cors = require('cors');
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
app.get('/api/news', fetchNews);
app.get('/api/me',(req,res)=>{
    console.log('Session ID:', req.sessionID);
    console.log('Session at /api/me:', req.session);
    if(req.session.user){
        return res.json({loggedIn: true, user: req.session.user})
    }else{
        return res.json({loggedIn: false})
    }
})
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

const PORT = process.env.PORT || 5000;

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