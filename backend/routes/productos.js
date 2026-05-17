const router = require('express').Router();
const ctrl = require('../controllers/productoController');
const subirImagen = require('../middleware/upload');
const { validarProducto } = require('../middleware/validarProducto');

router.get('/',                ctrl.listar);
router.get('/nuevo',           ctrl.formNuevo);
router.post('/',               subirImagen, validarProducto, ctrl.crear);
router.get('/editar/:id',      ctrl.formEditar);
router.post('/actualizar/:id', subirImagen, validarProducto, ctrl.actualizar);
router.post('/eliminar/:id',   ctrl.eliminar);

module.exports = router;
