const bookingService = require("../services/booking.service");
const { serializeBigInt } = require("../utils/serializer");

const crearReserva = async (req, res) => {
  try {
    console.log('📥 Recibida solicitud de reserva:', req.body);
    const reserva = await bookingService.crearReserva(req.body);
    console.log('✅ Reserva creada:', reserva);
    res.status(201).json(serializeBigInt(reserva));
  } catch (error) {
    console.error('❌ Error al crear reserva:', error.message);
    res.status(400).json({ mensaje: error.message });
  }
};

const buscarCliente = async (req, res) => {
  try {
    const { email, telefono } = req.query;
    console.log('Buscando cliente:', { email, telefono });
    
    const cliente = await bookingService.buscarCliente(email, telefono);
    res.json(serializeBigInt(cliente || null));
  } catch (error) {
    console.error('Error en buscarCliente:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

const verificarDisponibilidad = async (req, res) => {
  try {
    const { id_barbero, fecha, hora_inicio, servicios } = req.body;
    
    const serviciosDB = await prisma.servicios.findMany({
      where: { id_servicio: { in: servicios } }
    });
    const duracionTotal = serviciosDB.reduce((sum, s) => sum + s.duracion, 0);
    
    const disponibilidad = await bookingService.verificarDisponibilidad(
      id_barbero,
      fecha,
      hora_inicio,
      duracionTotal
    );
    
    res.json({ disponible: true, ...disponibilidad });
  } catch (error) {
    res.status(400).json({ disponible: false, mensaje: error.message });
  }
};

module.exports = {
  crearReserva,
  buscarCliente,
  verificarDisponibilidad
};