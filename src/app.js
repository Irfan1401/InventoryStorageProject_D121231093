// File: src/app.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Logger middleware 
const prisma = require('./config/database');
const authRoutes = require('./routes/auth.routes'); // Import Route Auth
const itemRoutes = require('./routes/item.routes'); // Import Route Item
const transactionRoutes = require('./routes/transaction.routes'); // Import Route Transaction
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

// A. Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Inventory API',
    version: '1.0.0',
    server_time: new Date().toISOString(),
  });
});

// B. Auth Routes (REGISTER & LOGIN)
// URL: http://localhost:3000/api/auth/register
app.use('/api/auth', authRoutes);

app.use('/api/items', itemRoutes);

// C. Item Routes (PROTECTED & PUBLIC) - UPDATE DAY 4 DISINI
// URL: http://localhost:3000/api/items
app.use('/api/items', itemRoutes); // <--- 2. DAFTARKAN ROUTE ITEM
app.use('/api/transactions', transactionRoutes);

// D. Test Database Connection
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

// E. 404 Handler (Wajib ditaruh paling bawah)
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