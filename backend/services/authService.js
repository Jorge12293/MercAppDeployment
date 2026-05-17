const Usuario = require('../models/Usuario');

// Busca un usuario por email; retorna doc Mongoose o null
exports.findByEmail = async (email) => Usuario.findOne({ email });

// Crea un nuevo usuario; el hash de la contraseña lo aplica el hook pre-save del modelo
exports.create = async (data) => Usuario.create(data);

// Retorna doc Mongoose completo (no lean) para poder llamar compararPassword() y save()
exports.findById = async (id) => Usuario.findById(id);
