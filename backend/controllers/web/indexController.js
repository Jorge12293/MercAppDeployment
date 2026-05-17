const productService = require('../../services/productService');
const authService    = require('../../services/authService');

// Carga en paralelo el conteo, valor de inventario y últimos productos para el dashboard
exports.index = async (req, res) => {
  const { totalProductos, valorInventario, productos } = await productService.getDashboardStats();
  res.render('index', { title: 'Dashboard', totalProductos, valorInventario, productos });
};

// Renderiza el perfil del usuario autenticado actualmente en sesión
exports.perfil = async (req, res) => {
  const usuario = await authService.findById(req.session.usuarioId);
  res.render('perfil', { title: 'Mi perfil', usuario: usuario.toObject() });
};

// Verifica la contraseña actual antes de permitir el cambio; no hace hash aquí (lo hace el modelo)
exports.actualizarPassword = async (req, res) => {
  const { actual, nueva, confirmar } = req.body;
  const usuario = await authService.findById(req.session.usuarioId);

  const renderError = (msg) =>
    res.render('perfil', { title: 'Mi perfil', usuario: usuario.toObject(), passError: msg });

  const valido = await usuario.compararPassword(actual);
  if (!valido) return renderError('La contraseña actual es incorrecta.');
  if (nueva.length < 6) return renderError('La nueva contraseña debe tener mínimo 6 caracteres.');
  if (nueva !== confirmar) return renderError('Las contraseñas nuevas no coinciden.');

  usuario.password = nueva;
  await usuario.save();
  res.render('perfil', { title: 'Mi perfil', usuario: usuario.toObject(), passOk: true });
};
