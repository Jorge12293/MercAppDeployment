const { validationResult } = require('express-validator');
const productService = require('../../services/productService');

// Muestra la lista de todos los productos ordenada por fecha de creación descendente
exports.listar = async (req, res) => {
  const productos = await productService.findAll({});
  res.render('productos/lista', { title: 'Productos', productos });
};

// Renderiza el formulario de creación vacío
exports.formNuevo = (req, res) => {
  res.render('productos/nuevo', { title: 'Nuevo Producto' });
};

// Valida la imagen subida y los campos del form antes de persistir el producto
exports.crear = async (req, res) => {
  if (req.uploadError) {
    return res.render('productos/nuevo', {
      title: 'Nuevo Producto',
      errores: [{ msg: req.uploadError }],
      body: req.body
    });
  }
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.render('productos/nuevo', {
      title: 'Nuevo Producto',
      errores: errores.array(),
      body: req.body
    });
  }
  const { nombre, descripcion, precio } = req.body;
  const imagen = req.file ? req.file.filename : '';
  await productService.create({ nombre, descripcion, precio, imagen });
  res.redirect('/productos');
};

// Carga el producto existente para pre-rellenar el formulario de edición
exports.formEditar = async (req, res) => {
  const producto = await productService.findById(req.params.id);
  if (!producto) return res.redirect('/productos');
  res.render('productos/editar', { title: 'Editar Producto', producto });
};

// Persiste los cambios; conserva la imagen anterior si no se sube una nueva
exports.actualizar = async (req, res) => {
  if (req.uploadError) {
    const producto = await productService.findById(req.params.id);
    return res.render('productos/editar', {
      title: 'Editar Producto',
      producto,
      errores: [{ msg: req.uploadError }]
    });
  }
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const producto = await productService.findById(req.params.id);
    return res.render('productos/editar', {
      title: 'Editar Producto',
      producto,
      errores: errores.array()
    });
  }
  const { nombre, descripcion, precio } = req.body;
  const data = { nombre, descripcion, precio };
  if (req.file) data.imagen = req.file.filename;
  await productService.update(req.params.id, data);
  res.redirect('/productos');
};

// Elimina el producto sin confirmación adicional; la vista maneja el confirm del lado cliente
exports.eliminar = async (req, res) => {
  await productService.remove(req.params.id);
  res.redirect('/productos');
};
