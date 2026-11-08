const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token autentikasi tidak ditemukan.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa.',
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Kamu tidak memiliki izin untuk mengakses fitur ini.',
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };