const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');

const LAYOUT_AUTH = { layout: 'auth' };

exports.formRegistro = (req, res) => {
  res.render('auth/registro', { title: 'Registro', ...LAYOUT_AUTH });
};

exports.registro = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.render('auth/registro', { title: 'Registro', ...LAYOUT_AUTH, errores: errores.array(), body: req.body });
  }

  const { nombre, email, password } = req.body;
  try {
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.render('auth/registro', {
        title: 'Registro', ...LAYOUT_AUTH,
        errores: [{ msg: 'El email ya está registrado' }],
        body: req.body
      });
    }

    await Usuario.create({ nombre, email, password });
    res.redirect('/login');
  } catch {
    res.render('auth/registro', {
      title: 'Registro', ...LAYOUT_AUTH,
      errores: [{ msg: 'Servicio no disponible, intenta más tarde' }],
      body: req.body
    });
  }
};

exports.formLogin = (req, res) => {
  res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH });
};

exports.login = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH, errores: errores.array(), body: req.body });
  }

  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH, errores: [{ msg: 'Credenciales incorrectas' }], body: req.body });
    }

    const valido = await usuario.compararPassword(password);
    if (!valido) {
      return res.render('auth/login', { title: 'Iniciar sesión', ...LAYOUT_AUTH, errores: [{ msg: 'Credenciales incorrectas' }], body: req.body });
    }

    req.session.usuarioId = usuario._id;
    req.session.usuarioNombre = usuario.nombre;
    req.session.usuarioEmail = usuario.email;
    res.redirect('/productos');
  } catch {
    res.render('auth/login', {
      title: 'Iniciar sesión', ...LAYOUT_AUTH,
      errores: [{ msg: 'Servicio no disponible, intenta más tarde' }],
      body: req.body
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
