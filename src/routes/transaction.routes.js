// File: src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const verifyToken = require('../middleware/auth.middleware');

// Semua Endpoint Transaksi HARUS Login (Protected)
router.use(verifyToken);

router.post('/', transactionController.createTransaction); // Buat Transaksi (In/Out)
router.get('/', transactionController.getAllTransactions); // Lihat Riwayat
router.get('/:id', transactionController.getTransactionById); // Lihat Detail

module.exports = router;
