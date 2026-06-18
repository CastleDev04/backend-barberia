const prisma = require("../config/prisma");
const { serializeBigInt } = require("../utils/serializer");

const getAll = async (req, res) => {
  const servicios = await prisma.servicios.findMany();

  res.json(serializeBigInt(servicios));
};

const getById = async (req, res) => {
  const servicio = await prisma.servicios.findUnique({
    where: {
      id_servicio: Number(req.params.id)
    }
  });

  res.json(serializeBigInt(servicio));
};

const create = async (req, res) => {
  const servicio = await prisma.servicios.create({
    data: req.body
  });

  res.status(201).json(serializeBigInt(servicio));
};

const update = async (req, res) => {
  const servicio = await prisma.servicios.update({
    where: {
      id_servicio: Number(req.params.id)
    },
    data: req.body
  });

  res.json(serializeBigInt(servicio));
};

const remove = async (req, res) => {
  await prisma.servicios.delete({
    where: {
      id_servicio: Number(req.params.id)
    }
  });

  res.json({
    mensaje: "Servicio eliminado"
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};