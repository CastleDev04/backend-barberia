const prisma = require("../config/prisma");
const { serializeBigInt } = require("../utils/serializer");

exports.getAll = async (req, res) => {
  const clientes = await prisma.clientes.findMany();

  res.json(serializeBigInt(clientes));
};

exports.getById = async (req, res) => {
  const cliente = await prisma.clientes.findUnique({
    where: {
      id: Number(req.params.id)
    }
  });

  res.json(serializeBigInt(cliente));
};

exports.create = async (req, res) => {
  const cliente = await prisma.clientes.create({
    data: req.body
  });

  res.status(201).json(serializeBigInt(cliente));
};

exports.update = async (req, res) => {
  const cliente = await prisma.clientes.update({
    where: {
      id: Number(req.params.id)
    },
    data: req.body
  });

  res.json(serializeBigInt(cliente));
};

exports.remove = async (req, res) => {
  await prisma.clientes.delete({
    where: {
      id: Number(req.params.id)
    }
  });

  res.json({
    mensaje: "cliente eliminado"
  });
};