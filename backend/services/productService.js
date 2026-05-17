const mongo       = require('../utils/mongo');
const serializers = require('../utils/serializers');
const validators  = require('../utils/validators');
const Producto    = require('../models/Producto');
const Categoria   = require('../models/Categoria');

// True si el id tiene formato de ObjectId válido
exports.isValidId = (id) => mongo.isValidId(id);

// Serializa un doc Producto al shape público de la API
exports.serialize = (p) => serializers.serializeProduct(p);

// Valida body de producto; retorna string de error o null si es válido
exports.validateInput = (body, opts) => validators.validateProductBody(body, opts);

// Traduce campos camelCase del body PATCH al nombre de campo en MongoDB
exports.buildPatchFields = (body) => validators.buildPatchFields(body);

// Devuelve todos los productos, con filtro opcional por categoría y búsqueda por texto
exports.findAll = async ({ categoryId, q } = {}) => {
  const filter = {};
  if (categoryId) filter.categoria = categoryId;

  let productos = await Producto.find(filter).lean().sort({ createdAt: -1 });

  if (q && q.trim().length > 0) {
    const term = q.trim().toLowerCase();
    productos = productos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(term))
    );
  }
  return productos;
};

// Retorna un producto por id o null si no existe
exports.findById = async (id) => Producto.findById(id).lean();

// Crea un nuevo producto y retorna el documento creado
exports.create = async (data) => Producto.create(data);

// Reemplaza todos los campos del producto y retorna el documento actualizado
exports.update = async (id, data) =>
  Producto.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

// Aplica solo los campos enviados sin sobreescribir los omitidos
exports.patch = async (id, updates) =>
  Producto.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();

// Elimina el producto; retorna el doc eliminado o null si no existía
exports.remove = async (id) => Producto.findByIdAndDelete(id);

// True si la categoría con ese id existe en la colección
exports.categoryExists = async (id) => Categoria.exists({ _id: id });

// Retorna estadísticas del dashboard: conteo, valor de inventario y últimos 5 productos
exports.getDashboardStats = async () => {
  const [totalProductos, productos] = await Promise.all([
    Producto.countDocuments(),
    Producto.find().lean().sort({ createdAt: -1 }).limit(5)
  ]);
  const result = await Producto.aggregate([
    { $group: { _id: null, total: { $sum: '$precio' } } }
  ]);
  return {
    totalProductos,
    valorInventario: result[0]?.total || 0,
    productos
  };
};
