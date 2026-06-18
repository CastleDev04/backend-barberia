const router = require("express").Router();
const controller = require("../controllers/booking.controller");

router.post("/reservas", controller.crearReserva);
router.get("/clientes/buscar", controller.buscarCliente);
router.post("/disponibilidad", controller.verificarDisponibilidad);

module.exports = router;