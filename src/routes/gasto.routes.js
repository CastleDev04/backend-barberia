const router = require("express").Router();

const controller =
require("../controllers/gasto.controller");

const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, controller.getAll);
router.get('/:id', verifyToken, controller.getById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;