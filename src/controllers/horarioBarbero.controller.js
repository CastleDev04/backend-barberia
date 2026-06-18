const prisma = require("../config/prisma");
const { serializeBigInt } = require("../utils/serializer");

const getAll = async (req, res) => {
  try {
    const horarios = await prisma.horarios_barbero.findMany({
      include: {
        barberos: true
      }
    });
    res.json(serializeBigInt(horarios));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const getByBarbero = async (req, res) => {
  try {
    const horarios = await prisma.horarios_barbero.findMany({
      where: {
        id_barbero: Number(req.params.id)
      },
      include: {
        barberos: true
      }
    });
    res.json(serializeBigInt(horarios));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const create = async (req, res) => {
  try {
    let { id_barbero, dia_semana, hora_inicio, hora_fin } = req.body;

    // Validaciones
    if (!id_barbero) {
      return res.status(400).json({ mensaje: 'ID de barbero requerido' });
    }
    if (!dia_semana) {
      return res.status(400).json({ mensaje: 'Día de semana requerido' });
    }
    if (!hora_inicio) {
      return res.status(400).json({ mensaje: 'Hora de inicio requerida' });
    }
    if (!hora_fin) {
      return res.status(400).json({ mensaje: 'Hora de fin requerida' });
    }

    // Convertir a tipos correctos
    id_barbero = parseInt(id_barbero);
    dia_semana = parseInt(dia_semana);
    hora_inicio = String(hora_inicio);
    hora_fin = String(hora_fin);

    // Validar formato de hora (HH:MM)
    const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora_inicio)) {
      return res.status(400).json({ mensaje: 'Formato de hora inicio inválido. Use HH:MM' });
    }
    if (!horaRegex.test(hora_fin)) {
      return res.status(400).json({ mensaje: 'Formato de hora fin inválido. Use HH:MM' });
    }

    const horario = await prisma.horarios_barbero.create({
      data: {
        id_barbero: id_barbero,
        dia_semana: dia_semana,
        hora_inicio: hora_inicio,
        hora_fin: hora_fin
      }
    });

    res.status(201).json(serializeBigInt(horario));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id_barbero, dia_semana, hora_inicio, hora_fin } = req.body;
    const id_horario = Number(req.params.id);

    const data = {};
    
    if (id_barbero !== undefined) data.id_barbero = parseInt(id_barbero);
    if (dia_semana !== undefined) data.dia_semana = parseInt(dia_semana);
    if (hora_inicio !== undefined) data.hora_inicio = String(hora_inicio);
    if (hora_fin !== undefined) data.hora_fin = String(hora_fin);

    const horario = await prisma.horarios_barbero.update({
      where: {
        id_horario: id_horario
      },
      data: data
    });

    res.json(serializeBigInt(horario));
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Horario no encontrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const id_horario = Number(req.params.id);

    await prisma.horarios_barbero.delete({
      where: {
        id_horario: id_horario
      }
    });

    res.json({ mensaje: "Horario eliminado" });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') {
      return res.status(404).json({ mensaje: 'Horario no encontrado' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

const getHorariosDisponibles = async (req, res) => {
  try {
    const { id_barbero, fecha } = req.params;
    
    console.log('=== DEBUG getHorariosDisponibles ===');
    console.log('id_barbero:', id_barbero);
    console.log('fecha:', fecha);
    
    // Calcular día de la semana
    const fechaObj = new Date(fecha);
    let diaSemanaJS = fechaObj.getDay();
    
    // Convertir: 0=Domingo→7, 1=Lunes→1, etc.
    let diaSemanaBD;
    if (diaSemanaJS === 0) {
      diaSemanaBD = 7;  // Domingo
    } else {
      diaSemanaBD = diaSemanaJS;  // Lunes a Sábado
    }
    
    console.log('Día JS:', diaSemanaJS);
    console.log('Día BD buscado:', diaSemanaBD);
    
    // Verificar si el barbero existe
    const barbero = await prisma.barberos.findUnique({
      where: { id_barbero: Number(id_barbero) }
    });
    
    if (!barbero) {
      console.log('Barbero no encontrado');
      return res.json({ disponibles: [] });
    }
    
    console.log('Barbero encontrado:', barbero.nombres);
    
    // Obtener TODOS los horarios del barbero para debug
    const todosHorarios = await prisma.horarios_barbero.findMany({
      where: { id_barbero: Number(id_barbero) }
    });
    
    console.log('Todos los horarios del barbero:', todosHorarios);
    
    // Buscar horario específico
    const horario = await prisma.horarios_barbero.findFirst({
      where: {
        id_barbero: Number(id_barbero),
        dia_semana: diaSemanaBD
      }
    });
    
    if (!horario) {
      console.log(`No hay horario para día ${diaSemanaBD}`);
      return res.json({ disponibles: [] });
    }
    
    console.log('Horario encontrado:', horario);
    
    // Generar slots disponibles
    const disponibles = [];
    const [inicioH, inicioM] = horario.hora_inicio.split(':').map(Number);
    const [finH, finM] = horario.hora_fin.split(':').map(Number);
    
    console.log('Generando slots desde', inicioH, inicioM, 'hasta', finH, finM);
    
    let hora = inicioH;
    let minuto = inicioM;
    
    while (hora < finH || (hora === finH && minuto < finM)) {
      const slot = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
      disponibles.push(slot);
      minuto += 30;
      if (minuto >= 60) {
        hora++;
        minuto = 0;
      }
    }
    
    console.log('Slots generados:', disponibles);
    res.json({ disponibles });
    
  } catch (error) {
    console.error('Error en getHorariosDisponibles:', error);
    res.status(500).json({ mensaje: error.message, disponibles: [] });
  }
};

module.exports = {
  getAll,
  getByBarbero,
  create,
  update,
  remove,
  getHorariosDisponibles
};