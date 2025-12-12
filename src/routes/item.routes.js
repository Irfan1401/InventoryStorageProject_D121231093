// File: src/routes/item.routes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const verifyToken = require('../middleware/auth.middleware');

// 1. GET ALL ITEMS (Public: User login atau tidak bisa lihat barang)
router.get('/', itemController.getAllItems);

// 2. GET DETAIL (Public)
router.get('/:id', itemController.getItemById);

// 3. CREATE ITEM (Protected: Harus Login)
router.post('/', verifyToken, itemController.createItem);

// 4. UPDATE ITEM (Protected: Harus Login)
router.put('/:id', verifyToken, itemController.updateItem);

// 5. DELETE ITEM (Protected: Harus Login)
router.delete('/:id', verifyToken, itemController.deleteItem);

module.exports = router;