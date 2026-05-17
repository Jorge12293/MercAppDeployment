const mongo = require('./mongo');

// Tabla de traducción entre nombres camelCase de la API y campos del schema de Mongoose
const FIELD_MAP = {
  name:        'nombre',
  description: 'descripcion',
  price:       'precio',
  imageUrl:    'imagen',
  stock:       'stock'
};

// Valida body de producto: partial=false exige todos los campos (POST/PUT), true solo los presentes (PATCH)
exports.validateProductBody = (body, { partial = false } = {}) => {
  const { name, price, categoryId, stock, description, imageUrl } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '')
      return 'name es obligatorio y debe ser una cadena no vacía';
  }
  if (!partial || price !== undefined) {
    if (price === undefined || price === null) return 'price es obligatorio';
    if (typeof price !== 'number' || !isFinite(price) || price <= 0)
      return 'price debe ser un número mayor a 0';
  }
  if (categoryId !== undefined && categoryId !== null && !mongo.isValidId(categoryId))
    return 'categoryId inválido';
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0))
    return 'stock debe ser un entero no negativo';
  if (description !== undefined && typeof description !== 'string')
    return 'description debe ser una cadena';
  if (imageUrl !== undefined && typeof imageUrl !== 'string')
    return 'imageUrl debe ser una cadena';
  return null;
};

// Traduce los campos presentes en el body al nombre de campo MongoDB; trim en strings
exports.buildPatchFields = (body) => {
  const updates = {};
  for (const [apiKey, dbKey] of Object.entries(FIELD_MAP)) {
    if (body[apiKey] !== undefined)
      updates[dbKey] = typeof body[apiKey] === 'string' ? body[apiKey].trim() : body[apiKey];
  }
  return updates;
};
