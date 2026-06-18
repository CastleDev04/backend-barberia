const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const prisma = require('../config/prisma');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, secret);
    
    const encargado = await prisma.encargados.findUnique({
      where: { id: decoded.id }
    });
    
    if (!encargado || encargado.estado !== 'ACTIVO') {
      return res.status(401).json({ mensaje: 'No autorizado' });
    }
    
    req.encargado = encargado;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = { verifyToken };