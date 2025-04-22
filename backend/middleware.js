const cors = require('cors');

// CORS middleware
const corsMiddleware = cors({
    origin: ['http://localhost:3000', 'https://accounts.google.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Logging middleware
const loggingMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};

module.exports = {
    corsMiddleware,
    loggingMiddleware
};
