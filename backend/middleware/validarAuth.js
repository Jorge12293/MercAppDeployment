const { body } = require('express-validator');

exports.validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
  body('confirmar')
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Las contraseñas no coinciden');
      return true;
    })
];

exports.validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Ingresa un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
];
