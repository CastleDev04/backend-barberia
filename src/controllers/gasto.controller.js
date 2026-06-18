const prisma = require("../config/prisma");
const { serializeBigInt } = require("../utils/serializer");

const getAll = async (req, res) => {
  try {
    const gastos = await prisma.gastos.findMany({
      orderBy: {
        fecha: 'desc'
      }
    });
    res.json(serializeBigInt(gastos));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const gasto = await prisma.gastos.findUnique({
      where: {
        id_gasto: Number(req.params.id)
      }
    });
    res.json(serializeBigInt(gasto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { concepto, monto, fecha, observacion } = req.body;

    // Validaciones
    if (!concepto) {
      return res.status(400).json({ mensaje: 'El concepto es requerido' });
    }
    if (!monto || monto <= 0) {
      return res.status(400).json({ mensaje: 'El monto debe ser mayor a 0' });
    }
    if (!fecha) {
      return res.status(400).json({ mensaje: 'La fecha es requerida' });
    }

    const gasto = await prisma.gastos.create({
      data: {
        concepto: concepto,
        monto: parseFloat(monto),
        fecha: new Date(fecha),  // 🔑 IMPORTANTE: convertir a Date
        observacion: observacion || null
      }
    });

    res.status(201).json(serializeBigInt(gasto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { concepto, monto, fecha, observacion } = req.body;

    const data = {};
    if (concepto !== undefined) data.concepto = concepto;
    if (monto !== undefined) data.monto = parseFloat(monto);
    if (fecha !== undefined) data.fecha = new Date(fecha);  // 🔑 convertir a Date
    if (observacion !== undefined) data.observacion = observacion || null;

    const gasto = await prisma.gastos.update({
      where: {
        id_gasto: Number(req.params.id)
      },
      data: data
    });

    res.json(serializeBigInt(gasto));
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.gastos.delete({
      where: {
        id_gasto: Number(req.params.id)
      }
    });
    res.json({ mensaje: "Gasto eliminado" });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};