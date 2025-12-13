// File: src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const verifyToken = require('../middleware/auth.middleware');


router.use(verifyToken);

router.post('/', transactionController.createTransaction); 
router.get('/', transactionController.getAllTransactions); 
router.get('/:id', transactionController.getTransactionById); 

module.exports = router;
