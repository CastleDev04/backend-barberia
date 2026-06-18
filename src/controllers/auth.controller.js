const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { secret, expiresIn } = require('../config/jwt');

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    
    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña requeridos' });
    }
    
    // Usar findFirst en lugar de findUnique si correo no es único
    const encargado = await prisma.encargados.findFirst({
      where: { correo: correo }
    });
    
    if (!encargado) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    const passwordValido = await bcrypt.compare(password, encargado.password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    if (encargado.estado !== 'ACTIVO') {
      return res.status(401).json({ mensaje: 'Usuario inactivo' });
    }
    
    const token = jwt.sign(
      { id: encargado.id, correo: encargado.correo },
      secret,
      { expiresIn }
    );
    
    res.json({
      token,
      encargado: {
        id: encargado.id,
        nombre: encargado.nombre,
        apellido: encargado.apellido,
        correo: encargado.correo
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = { login };