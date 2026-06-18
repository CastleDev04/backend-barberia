const router = require("express").Router();

const controller = require("../controllers/servicio.controller");

const { verifyToken } = require('../middlewares/auth');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;