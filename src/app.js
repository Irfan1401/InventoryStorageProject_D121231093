require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 
const prisma = require('./config/database');
const authRoutes = require('./routes/auth.routes'); 
const itemRoutes = require('./routes/item.routes'); 
const transactionRoutes = require('./routes/transaction.routes'); 
const app = express()
const PORT = process.env.PORT || 3000;


app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use(morgan('dev')); 


app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Inventory API',
    version: '1.0.0',
    server_time: new Date().toISOString(),
  });
});


app.use('/api/auth', authRoutes);

app.use('/api/items', itemRoutes);


app.use('/api/items', itemRoutes); 

app.use('/api/transactions', transactionRoutes);


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


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});


app.listen(PORT, () => {
  console.log(`
  🚀 Server running on http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV}
  `);
});

module.exports = app;