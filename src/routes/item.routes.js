// File: src/routes/item.routes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const verifyToken = require('../middleware/auth.middleware'); // Panggil Satpam

// Endpoint Public (Siapapun bisa lihat barang)
router.get('/', itemController.getAllItems);

// Endpoint Protected (Harus Login untuk tambah barang)
// Perhatikan: ada 'verifyToken' sebelum controller
router.post('/', verifyToken, itemController.createItem);

module.exports = router;