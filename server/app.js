require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pentestRoutes = require('../routes/pentestRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware with CSP configuration for frontend
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', pentestRoutes);

// Serve frontend UI at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /',
      'POST /api/pentest',
      'GET /api/health'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   PENETRATION TESTER AGENT - SERVER STARTED');
  console.log('═══════════════════════════════════════════════════');
  console.log(`\nServer running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Groq API Key: ${process.env.GROQ_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`\n🎨 Web UI: http://localhost:${PORT}`);
  console.log('\nAPI Endpoints:');
  console.log(`  POST http://localhost:${PORT}/api/pentest`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log('\n═══════════════════════════════════════════════════\n');

  // Warn if API key is missing
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  WARNING: GROQ_API_KEY not set in environment variables');
    console.warn('   Please set it in your .env file to enable AI analysis\n');
  }
});

module.exports = app;
