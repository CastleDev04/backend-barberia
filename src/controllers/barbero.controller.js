const prisma = require("../config/prisma");
const { serializeBigInt } = require("../utils/serializer");

exports.getAll = async (req, res) => {
  const barberos = await prisma.barberos.findMany();

  res.json(serializeBigInt(barberos));
};

exports.getById = async (req, res) => {
  const barbero = await prisma.barberos.findUnique({
    where: {
      id_barbero: Number(req.params.id)
    }
  });

  res.json(serializeBigInt(barbero));
};

exports.create = async (req, res) => {
  const barbero = await prisma.barberos.create({
    data: req.body
  });

  res.status(201).json(serializeBigInt(barbero));
};

exports.update = async (req, res) => {
  const barbero = await prisma.barberos.update({
    where: {
      id_barbero: Number(req.params.id)
    },
    data: req.body
  });

  res.json(serializeBigInt(barbero));
};

exports.remove = async (req, res) => {
  await prisma.barberos.delete({
    where: {
      id_barbero: Number(req.params.id)
    }
  });

  res.json({
    mensaje: "Barbero eliminado"
  });
};