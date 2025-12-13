const prisma = require('../config/database');


const response = (res, statusCode, success, message, data, pagination) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    pagination 
  });
};


exports.createItem = async (req, res) => {
  try {
    const { name, sku, quantity, price, supplierId } = req.body;


    if (!name || !sku) return response(res, 400, false, 'Name and SKU are required');

   
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

exports.getAllItems = async (req, res) => {
  try {
    
    const { page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
   
    const skip = (parseInt(page) - 1) * parseInt(limit);

   
    let whereCondition = {};
    if (search) {
      whereCondition = {
        OR: [
          { name: { contains: search } }, 
          { sku: { contains: search } }   
        ]
      };
    }

  
    const items = await prisma.item.findMany({
      where: whereCondition,
      skip: skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: order }, 
      include: { supplier: true }   
    });


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

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity } = req.body;

 
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

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;


    const existingItem = await prisma.item.findUnique({ where: { id: parseInt(id) } });
    if (!existingItem) return response(res, 404, false, 'Item not found');

    await prisma.item.delete({ where: { id: parseInt(id) } });

    return response(res, 200, true, 'Item deleted successfully');
  } catch (error) {
    return response(res, 500, false, error.message);
  }
};