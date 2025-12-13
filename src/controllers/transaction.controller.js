const prisma = require('../config/database');


const response = (res, statusCode, success, message, data) => {
  return res.status(statusCode).json({ success, message, data });
};
exports.createTransaction = async (req, res) => {
  try {

    const { type, details, notes } = req.body;
    const userId = req.user.id; 

    if (!type || !details || details.length === 0) {
      return response(res, 400, false, 'Type and details are required');
    }

  
    const result = await prisma.$transaction(async (tx) => {
      
     
      const newTransaction = await tx.transaction.create({
        data: {
          type,
          notes,
          userId
        }
      });

      for (const itemDetail of details) {
        const { itemId, quantity, pricePerUnit } = itemDetail;

        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) throw new Error(`Item with ID ${itemId} not found`);

       
        if (type === 'OUT' && item.quantity < quantity) {
          throw new Error(`Insufficient stock for item: ${item.name} (Available: ${item.quantity})`);
        }

    
        await tx.transactionDetail.create({
          data: {
            transactionId: newTransaction.id,
            itemId,
            quantity: parseInt(quantity),
            pricePerUnit: parseFloat(pricePerUnit)
          }
        });

        
        const newStock = type === 'IN' 
          ? item.quantity + parseInt(quantity)  
          : item.quantity - parseInt(quantity); 
        await tx.item.update({
          where: { id: itemId },
          data: { quantity: newStock }
        });
      }

      return newTransaction;
    });

    return response(res, 201, true, 'Transaction created successfully', result);

  } catch (error) {
  
    return response(res, 400, false, error.message);
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { name: true, email: true } },
        details: { 
          include: { item: { select: { name: true, sku: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return response(res, 200, true, 'List of transactions', transactions);
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};

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