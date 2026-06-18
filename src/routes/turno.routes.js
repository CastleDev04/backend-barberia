const router =
  require("express").Router();

const controller =
  require("../controllers/turno.controller");

router.get(
  "/",
  controller.obtenerTurnos
);

router.get(
  "/disponibilidad",
  controller.disponibilidad
);

router.get(
  "/:id",
  controller.obtenerTurnoPorId
);

router.post(
  "/",
  controller.crearTurno
);

router.delete(
  "/:id",
  controller.remove
)

router.patch(
  "/cancelar/:id",
  controller.cancelarTurno
);

router.patch("/:id/estado", controller.actualizarEstado);

module.exports = router;