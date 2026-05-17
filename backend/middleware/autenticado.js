module.exports = (req, res, next) => {
  if (req.session.usuarioId) return next();
  res.redirect('/login');
};
