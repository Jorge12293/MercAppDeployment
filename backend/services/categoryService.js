const serializers = require('../utils/serializers');
const Categoria   = require('../models/Categoria');

// Serializa un doc Categoria al shape público { id, name }
exports.serialize = (c) => serializers.serializeCategory(c);

// Retorna todas las categorías ordenadas alfabéticamente
exports.findAll = async () => Categoria.find().lean().sort({ nombre: 1 });

// Crea una categoría con el nombre sanitizado y retorna el doc creado
exports.create = async (name) => Categoria.create({ nombre: name.trim() });

// Elimina la categoría por id; retorna el doc eliminado o null si no existía
exports.remove = async (id) => Categoria.findByIdAndDelete(id);
