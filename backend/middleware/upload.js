const multer = require('multer');
const path = require('path');

const TIPOS_PERMITIDOS = /jpeg|jpg|png|webp/;
const TAMAÑO_MAX = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + ext);
  }
});

function fileFilter(req, file, cb) {
  const extValida = TIPOS_PERMITIDOS.test(path.extname(file.originalname).toLowerCase());
  const mimeValido = TIPOS_PERMITIDOS.test(file.mimetype);

  if (extValida && mimeValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes: JPG, PNG o WEBP'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMAÑO_MAX }
});

// Wrapper que captura errores de Multer y los pasa como flash/redirect
function subirImagen(req, res, next) {
  upload.single('imagen')(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      req.uploadError = 'La imagen no puede superar 2 MB';
    } else {
      req.uploadError = err.message;
    }
    next();
  });
}

module.exports = subirImagen;
