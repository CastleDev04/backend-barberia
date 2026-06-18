const router = require("express").Router();

const controller =
require("../controllers/horarioBarbero.controller");

const { verifyToken } = require('../middlewares/auth');

router.get(
  "/barbero/:id",
  verifyToken,
  controller.getByBarbero
);

router.get("/disponibles/:id_barbero/:fecha", controller.getHorariosDisponibles);


router.get('/', verifyToken, controller.getAll);
router.get('/:id', verifyToken, controller.getByBarbero);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;