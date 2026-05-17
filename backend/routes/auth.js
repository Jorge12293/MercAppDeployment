const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { validarRegistro, validarLogin } = require('../middleware/validarAuth');

router.get('/registro', ctrl.formRegistro);
router.post('/registro', validarRegistro, ctrl.registro);
router.get('/login',    ctrl.formLogin);
router.post('/login',   validarLogin, ctrl.login);
router.get('/logout',   ctrl.logout);

module.exports = router;
