const prisma = require("../config/prisma");
const { serializeBigInt } = require("../utils/serializer");

const getAll = async (req, res) => {
  try {
    const pagos = await prisma.pagos.findMany({
      include: {
        turnos: {
          include: {
            clientes: true,
            barberos: true,
            detalle_turno: {
              include: {
                servicios: true
              }
            }
          }
        }
      }
    });
    res.json(serializeBigInt(pagos));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const pago = await prisma.pagos.findUnique({
      where: {
        id_pago: Number(req.params.id)
      },
      include: {
        turnos: {
          include: {
            clientes: true,
            barberos: true,
            detalle_turno: {
              include: {
                servicios: true
              }
            }
          }
        }
      }
    });
    res.json(serializeBigInt(pago));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { id_turno, monto, metodo_pago, fecha, estado } = req.body;

    // Validaciones
    if (!id_turno) {
      return res.status(400).json({ mensaje: 'ID de turno requerido' });
    }
    if (!monto || monto <= 0) {
      return res.status(400).json({ mensaje: 'El monto debe ser mayor a 0' });
    }
    if (!metodo_pago) {
      return res.status(400).json({ mensaje: 'Método de pago requerido' });
    }
    if (!fecha) {
      return res.status(400).json({ mensaje: 'Fecha requerida' });
    }

    const pago = await prisma.pagos.create({
      data: {
        id_turno: Number(id_turno),
        monto: parseFloat(monto),
        metodo_pago: metodo_pago,
        fecha: new Date(fecha),
        estado: estado || 'PAGADO'
      }
    });

    res.status(201).json(serializeBigInt(pago));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_turno, monto, metodo_pago, fecha, estado } = req.body;

    const data = {};
    if (id_turno !== undefined) data.id_turno = Number(id_turno);
    if (monto !== undefined) data.monto = parseFloat(monto);
    if (metodo_pago !== undefined) data.metodo_pago = metodo_pago;
    if (fecha !== undefined) data.fecha = new Date(fecha);
    if (estado !== undefined) data.estado = estado;

    const pago = await prisma.pagos.update({
      where: {
        id_pago: Number(id)
      },
      data: data
    });

    res.json(serializeBigInt(pago));
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.pagos.delete({
      where: {
        id_pago: Number(req.params.id)
      }
    });
    res.json({ mensaje: "Pago eliminado" });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
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