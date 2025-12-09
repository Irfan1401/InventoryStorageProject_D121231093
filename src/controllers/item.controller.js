// File: src/controllers/item.controller.js
const prisma = require('../config/database');

// Helper response (biar cepat)
const response = (res, code, success, msg, data) => res.status(code).json({ success, message: msg, data });

// GET ALL ITEMS (Bisa diakses Publik/User)
exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    response(res, 200, true, 'List of items', items);
  } catch (err) {
    response(res, 500, false, err.message);
  }
};

// CREATE ITEM (Hanya User Login)
exports.createItem = async (req, res) => {
  try {
    const { name, sku, quantity, supplierId } = req.body;
    
    // Validasi input manual (nanti pakai Joi)
    if (!name || !sku) return response(res, 400, false, 'Name and SKU are required');

    const newItem = await prisma.item.create({
      data: { 
        name, 
        sku, 
        quantity: parseInt(quantity) || 0,
        supplierId: supplierId ? parseInt(supplierId) : null 
      }
    });
    
    response(res, 201, true, 'Item created successfully', newItem);
  } catch (err) {
    response(res, 500, false, err.message);
  }
};