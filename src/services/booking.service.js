const prisma = require("../config/prisma");

// Buscar cliente por email o teléfono
const buscarCliente = async (email, telefono) => {
  if (!email && !telefono) return null;
  
  const cliente = await prisma.clientes.findFirst({
    where: {
      OR: [
        ...(email ? [{ correo: email }] : []),
        ...(telefono ? [{ telefono: telefono }] : [])
      ]
    }
  });
  return cliente;
};

// Crear nuevo cliente
const crearCliente = async (clienteData) => {
  const cliente = await prisma.clientes.create({
    data: {
      nombre: clienteData.firstName,
      apellido: clienteData.lastName,
      telefono: clienteData.phone,
      correo: clienteData.email,
      password: null
    }
  });
  return cliente;
};

// Obtener o crear cliente
const getOrCreateCliente = async (clienteData) => {
  let cliente = await buscarCliente(clienteData.email, clienteData.phone);
  if (!cliente) {
    cliente = await crearCliente(clienteData);
  }
  return cliente;
};

// Crear reserva completa
const crearReserva = async (reservaData) => {
  const { services, barber, date, time, client } = reservaData;
  
  console.log('Datos recibidos:', { services, barber, date, time, client });
  
  // Validaciones
  if (!services || services.length === 0) {
    throw new Error("Debe seleccionar al menos un servicio");
  }
  if (!barber || !barber.id) {
    throw new Error("Debe seleccionar un barbero");
  }
  if (!date) {
    throw new Error("Debe seleccionar una fecha");
  }
  if (!time) {
    throw new Error("Debe seleccionar una hora");
  }
  if (!client || !client.email) {
    throw new Error("Datos del cliente requeridos");
  }
  
  // 1. Obtener o crear cliente
  const cliente = await getOrCreateCliente(client);
  console.log('Cliente:', cliente);
  
  // 2. Obtener servicios de la BD
  const serviciosIds = services.map(s => s.id);
  const serviciosDB = await prisma.servicios.findMany({
    where: {
      id_servicio: { in: serviciosIds }
    }
  });
  
  if (serviciosDB.length === 0) {
    throw new Error("Servicios inválidos");
  }
  
  // 3. Calcular duración total
  const duracionTotal = serviciosDB.reduce((sum, s) => sum + s.duracion, 0);
  
  // 4. Calcular hora de fin
  const [hora, minuto] = time.split(':').map(Number);
  let horaFin = hora;
  let minutoFin = minuto + duracionTotal;
  while (minutoFin >= 60) {
    horaFin++;
    minutoFin -= 60;
  }
  const horaFinStr = `${String(horaFin).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}`;
  
  console.log(`Hora inicio: ${time}, Hora fin: ${horaFinStr}`);
  
  // 5. Verificar disponibilidad (opcional, pero recomendado)
  const turnoExistente = await prisma.turnos.findFirst({
    where: {
      id_barbero: barber.id,
      fecha: date,
      hora_inicio: time
    }
  });
  
  if (turnoExistente) {
    throw new Error("Ya existe un turno en ese horario");
  }
  
  // 6. Crear turno
  const turno = await prisma.turnos.create({
    data: {
      id_cliente: cliente.id,
      id_barbero: barber.id,
      fecha: new Date(date),
      hora_inicio: time,
      hora_fin: horaFinStr,
      estado: "PENDIENTE"
    }
  });
  
  console.log('Turno creado:', turno);
  
  // 7. Crear detalles del turno
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
  
  return {
    turno: {
      id: turno.id_turno,
      fecha: turno.fecha,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
      estado: turno.estado
    },
    cliente: {
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      telefono: cliente.telefono
    }
  };
};

module.exports = {
  buscarCliente,
  crearCliente,
  getOrCreateCliente,
  crearReserva
};