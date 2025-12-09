// File: src/app.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Logger middleware 
const prisma = require('./config/database');
const authRoutes = require('./routes/auth.routes'); // Import Route Auth

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// 1. MIDDLEWARES
// ==========================
app.use(cors()); // Izinkan akses dari frontend/public
app.use(express.json()); // Parsing JSON body
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded

// Logger Middleware 
app.use(morgan('dev')); 

// ==========================
// 2. ROUTES
// ==========================

// A. Health Check Endpoint (Wajib ada di requirements)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Inventory API',
    version: '1.0.0',
    server_time: new Date().toISOString(),
  });
});

// B. Auth Routes (REGISTER & LOGIN) - UPDATE DAY 3 DISINI
// URL akan menjadi: http://localhost:3000/api/auth/register
app.use('/api/auth', authRoutes);

// C. Test Database Connection
app.get('/api/test-db', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: users
    });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// D. 404 Handler (Wajib ditaruh paling bawah dari routes lain)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ==========================
// 3. START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`
  🚀 Server running on http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV}
  `);
});

module.exports = app;