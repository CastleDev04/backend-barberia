// backend/services/turno.service.js
const prisma = require("../config/prisma");

const crearTurno = async ({
  id_cliente,
  id_barbero,
  fecha,
  hora_inicio,
  hora_fin,
  estado,
  servicios
}) => {
  // Validaciones
  if (!id_cliente) throw new Error("ID de cliente requerido");
  if (!id_barbero) throw new Error("ID de barbero requerido");
  if (!fecha) throw new Error("Fecha requerida");
  if (!hora_inicio) throw new Error("Hora de inicio requerida");
  if (!servicios || servicios.length === 0) throw new Error("Servicios requeridos");
  
  // Convertir fecha string a Date (solo la fecha, no la hora)
  const fechaDate = new Date(fecha);
  const fechaUTC = new Date(Date.UTC(fechaDate.getFullYear(), fechaDate.getMonth(), fechaDate.getDate()));
  
  console.log('Creando turno:', {
    id_cliente,
    id_barbero,
    fecha: fechaUTC,
    hora_inicio,
    hora_fin,
    estado,
    servicios
  });
  
  // 1. Crear el turno (hora_inicio y hora_fin son strings directamente)
  const turno = await prisma.turnos.create({
    data: {
      id_cliente: Number(id_cliente),
      id_barbero: Number(id_barbero),
      fecha: fechaUTC,
      hora_inicio: hora_inicio,  // String directo "09:00"
      hora_fin: hora_fin,        // String directo "10:00"
      estado: estado || "PENDIENTE"
    }
  });
  
  // 2. Obtener servicios de la BD
  const serviciosDB = await prisma.servicios.findMany({
    where: {
      id_servicio: { in: servicios }
    }
  });
  
  // 3. Crear detalles del turno
  for (const servicio of serviciosDB) {
    await prisma.detalle_turno.create({
      data: {
        id_turno: turno.id_turno,
        id_servicio: servicio.id_servicio,
        precio_servicio: servicio.precio,
        duracion: servicio.duracion
      }
    });
  }
  
  return turno;
};

const obtenerTurnos = async () => {
  return await prisma.turnos.findMany({
    include: {
      clientes: true,
      barberos: true,
      detalle_turno: {
        include: {
          servicios: true
        }
      },
      pagos: true
    },
    orderBy: {
      fecha: 'desc'
    }
  });
};

const obtenerTurnoPorId = async (id_turno) => {
  return await prisma.turnos.findUnique({
    where: { id_turno: Number(id_turno) },
    include: {
      clientes: true,
      barberos: true,
      detalle_turno: {
        include: {
          servicios: true
        }
      },
      pagos: true
    }
  });
};

const cancelarTurno = async (id_turno) => {
  return await prisma.turnos.update({
    where: { id_turno: Number(id_turno) },
    data: { estado: "CANCELADO" }
  });
};

module.exports = {
  crearTurno,
  obtenerTurnos,
  obtenerTurnoPorId,
  cancelarTurno
};