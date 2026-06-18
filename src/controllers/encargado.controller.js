const bcrypt = require('bcryptjs');
const prisma = require("../config/prisma");
const { serializeBigInt } = require("../utils/serializer");

exports.getAll = async (req, res) => {
  try {
    const encargados = await prisma.encargados.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        salario: true,
        estado: true,
        created_at: true
        // No seleccionar password
      }
    });
    res.json(serializeBigInt(encargados));
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const encargado = await prisma.encargados.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        salario: true,
        estado: true,
        created_at: true
        // No seleccionar password
      }
    });
    res.json(serializeBigInt(encargado));
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo, password, salario, estado } = req.body;
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const encargado = await prisma.encargados.create({
      data: {
        nombre,
        apellido,
        telefono,
        correo,
        password: hashedPassword,
        salario: salario ? parseFloat(salario) : null,
        estado: estado || "ACTIVO"
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        salario: true,
        estado: true,
        created_at: true
      }
    });
    
    res.status(201).json(serializeBigInt(encargado));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, correo, password, salario, estado } = req.body;
    
    const data = {
      nombre,
      apellido,
      telefono,
      correo,
      salario: salario ? parseFloat(salario) : null,
      estado
    };
    
    // Si se envía una nueva contraseña, hashearla
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    
    const encargado = await prisma.encargados.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        salario: true,
        estado: true,
        created_at: true
      }
    });
    
    res.json(serializeBigInt(encargado));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.encargados.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ mensaje: "Encargado eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};