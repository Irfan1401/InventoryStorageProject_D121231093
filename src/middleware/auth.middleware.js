// File: src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari Header (Format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No token provided'
    });
  }

  // Pisahkan "Bearer" dan token aslinya
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Malformed token'
    });
  }

  try {
    // 2. Verifikasi Token dengan Secret Key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Simpan data user ke dalam request agar bisa dipakai di Controller
    req.user = decoded; 
    
    next(); // Lanjut ke controller berikutnya
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or Expired Token'
    });
  }
};

module.exports = verifyToken;