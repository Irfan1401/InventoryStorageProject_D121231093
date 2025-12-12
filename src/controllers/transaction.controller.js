// File: src/controllers/transaction.controller.js
const prisma = require('../config/database');

// Helper Response
const response = (res, statusCode, success, message, data) => {
  return res.status(statusCode).json({ success, message, data });
};

// 1. CREATE TRANSACTION (Complex Logic)
exports.createTransaction = async (req, res) => {
  try {
    // Input: type ("IN"/"OUT"), details ([{ itemId: 1, quantity: 5, pricePerUnit: 10000 }])
    const { type, details, notes } = req.body;
    const userId = req.user.id; // Didapat dari token login

    if (!type || !details || details.length === 0) {
      return response(res, 400, false, 'Type and details are required');
    }

    // PENTING: Gunakan prisma.$transaction untuk menjaga konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Buat Header Transaksi
      const newTransaction = await tx.transaction.create({
        data: {
          type,
          notes,
          userId
        }
      });

      // B. Loop setiap barang di details
      for (const itemDetail of details) {
        const { itemId, quantity, pricePerUnit } = itemDetail;

        // Cek apakah barang ada?
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) throw new Error(`Item with ID ${itemId} not found`);

        // Cek Stok Cukup (Khusus Barang Keluar/OUT)
        if (type === 'OUT' && item.quantity < quantity) {
          throw new Error(`Insufficient stock for item: ${item.name} (Available: ${item.quantity})`);
        }

        // C. Buat Detail Transaksi (Masuk ke tabel junction)
        await tx.transactionDetail.create({
          data: {
            transactionId: newTransaction.id,
            itemId,
            quantity: parseInt(quantity),
            pricePerUnit: parseFloat(pricePerUnit)
          }
        });

        // D. UPDATE STOK BARANG OTOMATIS
        const newStock = type === 'IN' 
          ? item.quantity + parseInt(quantity)  // Kalau Masuk, stok nambah
          : item.quantity - parseInt(quantity); // Kalau Keluar, stok kurang

        await tx.item.update({
          where: { id: itemId },
          data: { quantity: newStock }
        });
      }

      return newTransaction;
    });

    return response(res, 201, true, 'Transaction created successfully', result);

  } catch (error) {
    // Jika ada error (misal stok kurang), semua proses di atas dibatalkan otomatis
    return response(res, 400, false, error.message);
  }
};

// 2. GET ALL TRANSACTIONS (Dengan Relasi User & Detail Barang)
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { name: true, email: true } }, // Siapa yang input?
        details: { 
          include: { item: { select: { name: true, sku: true } } } // Barang apa aja?
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return response(res, 200, true, 'List of transactions', transactions);
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};

// 3. GET TRANSACTION BY ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { name: true } },
        details: { include: { item: true } }
      }
    });

    if (!transaction) return response(res, 404, false, 'Transaction not found');

    return response(res, 200, true, 'Transaction detail', transaction);
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};