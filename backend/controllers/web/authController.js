const { validationResult } = require('express-validator');
const authService = require('../../services/authService');

const LAYOUT_AUTH = { layout: 'auth' };

// Renderiza el formulario de registro vacío
exports.formRegistro = (req, res) => {
  res.render('auth/registro', { title: 'Registro', ...LAYOUT_AUTH });
};

// Valida el body, verifica unicidad de email y crea el usuario
exports.registro = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.render('auth/registro', { title: 'Registro', ...LAYOUT_AUTH, errores: errores.array(), body: req.body });
  }
  const { nombre, email, password } = req.body;
  try {
    const existe = await authService.findByEmail(email);
    if (existe) {
      return res.render('auth/registro', {
        title: 'Registro', ...LAYOUT_AUTH,
        errores: [{ msg: 'El email ya está registrado' }],
        body: req.body
      });
    }
    await authService.create({ nombre, email, password });
    res.redirect('/login');
  } catch {
    res.render('auth/registro', {
      title: 'Registro', ...LAYOUT_AUTH,
      errores: [{ msg: 'Servicio no disponible, intenta más tarde' }],
      body: req.body
    });
  }
};

// Renderiza el formulario de login vacío
exports.formLogin = (req, res) => {
  res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH });
};

// Autentica al usuario, guarda datos mínimos en sesión y redirige al dashboard
exports.login = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH, errores: errores.array(), body: req.body });
  }
  const { email, password } = req.body;
  try {
    const usuario = await authService.findByEmail(email);
    if (!usuario) {
      return res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH, errores: [{ msg: 'Credenciales incorrectas' }], body: req.body });
    }
    const valido = await usuario.compararPassword(password);
    if (!valido) {
      return res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH, errores: [{ msg: 'Credenciales incorrectas' }], body: req.body });
    }
    req.session.usuarioId     = usuario._id;
    req.session.usuarioNombre = usuario.nombre;
    req.session.usuarioEmail  = usuario.email;
    res.redirect('/productos');
  } catch {
    res.render('auth/login', {
      title: 'Iniciar sesión', ...LAYOUT_AUTH,
      errores: [{ msg: 'Servicio no disponible, intenta más tarde' }],
      body: req.body
    });
  }
};

// Destruye la sesión del servidor y redirige al login
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
