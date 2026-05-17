const { body } = require('express-validator');

exports.validarProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
  body('descripcion')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar 500 caracteres')
];
