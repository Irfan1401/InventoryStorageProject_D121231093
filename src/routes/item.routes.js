
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const verifyToken = require('../middleware/auth.middleware');


router.get('/', itemController.getAllItems);


router.get('/:id', itemController.getItemById);

router.post('/', verifyToken, itemController.createItem);


router.put('/:id', verifyToken, itemController.updateItem);


router.delete('/:id', verifyToken, itemController.deleteItem);

module.exports = router;