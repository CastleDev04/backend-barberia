const express = require("express");
const cors = require("cors");

const barberoRoutes = require("./routes/barbero.routes");
const encargadoRoutes = require("./routes/encargado.routes");
const clienteRoutes = require("./routes/cliente.routes");
const servicioRoutes = require("./routes/servicio.routes");
const turnoRoutes = require("./routes/turno.routes");
const horarioRoutes = require("./routes/horariosBarbero.routes");
const pagoRoutes = require("./routes/pago.routes");
const gastoRoutes = require("./routes/gasto.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensaje: "Backend Barbería activo"
  });
});
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/barberos", barberoRoutes);
app.use("/api/encargados", encargadoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/turnos", turnoRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/gastos", gastoRoutes);

module.exports = app;