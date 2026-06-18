const turnoService = require("../services/turno.service");
const { serializeBigInt } = require("../utils/serializer");
const prisma = require("../config/prisma");  

const crearTurno = async (req, res) => {
  try {
    const turno = await turnoService.crearTurno(req.body);
    res.status(201).json(serializeBigInt(turno));
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};


const disponibilidad= async (req, res) => {
  try {
    const { barberoId, fecha } = req.query;
    
    if (!barberoId || !fecha) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'Faltan parámetros: barberoId y fecha' 
      });
    }
    
    // Obtener turnos existentes para ese barbero y fecha
    const turnos = await prisma.turnos.findMany({
      where: {
        id_barbero: parseInt(barberoId),
        fecha: new Date(fecha),
        estado: {
          not: 'CANCELADO'
        }
      },
      select: {
        hora_inicio: true
      }
    });
    
    // Extraer solo las horas de inicio
    const horariosOcupados = turnos.map(turno => turno.hora_inicio);
    
    return res.status(200).json({
      success: true,
      data: horariosOcupados
    });
    
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error al obtener disponibilidad de horarios'
    });
  }
}

const obtenerTurnos = async (req, res) => {
  try {
    const turnos = await turnoService.obtenerTurnos();
    res.json(serializeBigInt(turnos));
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

const obtenerTurnoPorId = async (req, res) => {
  try {
    const turno = await turnoService.obtenerTurnoPorId(Number(req.params.id));
    res.json(serializeBigInt(turno));
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

const cancelarTurno = async (req, res) => {
  try {
    const turno = await turnoService.cancelarTurno(Number(req.params.id));
    res.json(serializeBigInt(turno));
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    const estadosValidos = ['PENDIENTE', 'CONFIRMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    const turno = await prisma.turnos.update({
      where: { id_turno: Number(id) },
      data: { estado: estado }
    });

    res.json(serializeBigInt(turno));
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Primero eliminar los detalles del turno
    await prisma.detalle_turno.deleteMany({
      where: { id_turno: parseInt(id) }
    });
    
    // 2. También eliminar los pagos relacionados (si existen)
    await prisma.pagos.deleteMany({
      where: { id_turno: parseInt(id) }
    });
    
    // 3. Finalmente eliminar el turno
    const turno = await prisma.turnos.delete({
      where: { id_turno: parseInt(id) }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Turno eliminado correctamente',
      data: turno
    });
    
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el turno',
      error: error.message
    });
  }
};

module.exports = {
  crearTurno,
  obtenerTurnos,
  obtenerTurnoPorId,
  cancelarTurno,
  actualizarEstado,
  disponibilidad,
  remove
};