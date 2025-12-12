// File: src/controllers/item.controller.js
const prisma = require('../config/database');

// Helper Response
const response = (res, statusCode, success, message, data, pagination) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    pagination // Field pagination hanya muncul jika ada datanya
  });
};

// 1. CREATE ITEM (Sudah dibuat kemarin, kita rapikan sedikit)
exports.createItem = async (req, res) => {
  try {
    const { name, sku, quantity, price, supplierId } = req.body;

    // Validasi sederhana
    if (!name || !sku) return response(res, 400, false, 'Name and SKU are required');

    // Cek SKU duplikat
    const existingItem = await prisma.item.findUnique({ where: { sku } });
    if (existingItem) return response(res, 409, false, 'SKU already exists');

    const newItem = await prisma.item.create({
      data: {
        name,
        sku,
        quantity: parseInt(quantity) || 0,
        supplierId: supplierId ? parseInt(supplierId) : null
      }
    });

    return response(res, 201, true, 'Item created successfully', newItem);
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};

// 2. GET ALL ITEMS (Pagination + Search + Sorting) - SYARAT WAJIB
exports.getAllItems = async (req, res) => {
  try {
    // Ambil parameter dari Query URL (default: page 1, limit 10)
    const { page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Logika Pagination Prisma
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Logika Search (Case Insensitive Partial Match)
    let whereCondition = {};
    if (search) {
      whereCondition = {
        OR: [
          { name: { contains: search } }, // Cari di nama
          { sku: { contains: search } }   // Cari di SKU
        ]
      };
    }

    // Query Database (Get Data)
    const items = await prisma.item.findMany({
      where: whereCondition,
      skip: skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: order }, // Dynamic Sorting
      include: { supplier: true }   // Join table Supplier
    });

    // Query Database (Hitung Total Data untuk Pagination)
    const totalData = await prisma.item.count({ where: whereCondition });

    return response(res, 200, true, 'List of items fetched', items, {
      currentPage: parseInt(page),
      limit: parseInt(limit),
      totalData: totalData,
      totalPages: Math.ceil(totalData / parseInt(limit))
    });

  } catch (error) {
    console.log(error)
    return response(res, 500, false, error.message);
  }
};

// 3. GET ITEM BY ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) },
      include: { supplier: true }
    });

    if (!item) return response(res, 404, false, 'Item not found');

    return response(res, 200, true, 'Item detail fetched', item);
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};

// 4. UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity } = req.body;

    // Cek dulu apakah barangnya ada
    const existingItem = await prisma.item.findUnique({ where: { id: parseInt(id) } });
    if (!existingItem) return response(res, 404, false, 'Item not found');

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
      data: { name, sku, quantity: parseInt(quantity) }
    });

    return response(res, 200, true, 'Item updated successfully', updatedItem);
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};

// 5. DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek dulu apakah barangnya ada
    const existingItem = await prisma.item.findUnique({ where: { id: parseInt(id) } });
    if (!existingItem) return response(res, 404, false, 'Item not found');

    await prisma.item.delete({ where: { id: parseInt(id) } });

    return response(res, 200, true, 'Item deleted successfully');
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};