const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');


const response = (res, statusCode, success, message, data = null, errors = null) => {
  return res.status(statusCode).json({ success, message, data, errors });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

   
    if (!name || !email || !password) {
      return response(res, 400, false, 'Validation Error', null, ['All fields are required']);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return response(res, 409, false, 'Conflict', null, ['Email already registered']);
    }

  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER' 
      }
    });

    const { password: _, ...userData } = newUser;

    return response(res, 201, true, 'User registered successfully', userData);
  } catch (error) {
    console.error(error);
    return response(res, 500, false, 'Internal Server Error', null, [error.message]);
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return response(res, 401, false, 'Login Failed', null, ['Invalid email or password']);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response(res, 401, false, 'Login Failed', null, ['Invalid email or password']);
    }

 
    const payload = { id: user.id, role: user.role };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

    return response(res, 200, true, 'Login successful', {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: { accessToken, refreshToken }
    });
  } catch (error) {
    console.error(error);
    return response(res, 500, false, 'Internal Server Error', null, [error.message]);
  }
};