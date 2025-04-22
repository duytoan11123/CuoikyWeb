const express = require('express');
const { corsMiddleware, loggingMiddleware } = require('./middleware');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(loggingMiddleware);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
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