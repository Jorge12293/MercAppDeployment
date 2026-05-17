const router = require('express').Router();
const ctrl = require('../controllers/indexController');
const autenticado = require('../middleware/autenticado');

router.get('/',                autenticado, ctrl.index);
router.get('/perfil',          autenticado, ctrl.perfil);
router.post('/perfil/password',autenticado, ctrl.actualizarPassword);

module.exports = router;
