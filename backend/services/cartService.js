const mongo       = require('../utils/mongo');
const serializers = require('../utils/serializers');

// True si el id tiene formato de ObjectId válido
exports.isValidId = (id) => mongo.isValidId(id);

// Serializa un doc Producto al shape embebido en los ítems del carrito
exports.serializeProduct = (p) => serializers.serializeCartProduct(p);

// Inicialización perezosa: no ocupa espacio en sesión hasta que el usuario agrega el primer ítem
exports.getSessionCart = (session) => {
  if (!session.cart) session.cart = {};
  return session.cart;
};

// Calcula el total del carrito redondeado al centavo y devuelve items + total
exports.buildResponse = (cart) => {
  const items = Object.values(cart);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { items, total: Number(total.toFixed(2)) };
};

// Agrega un ítem al carrito o incrementa su cantidad si ya existe
exports.addItem = (cart, key, apiProduct, quantity) => {
  if (cart[key]) {
    cart[key].quantity += quantity;
  } else {
    cart[key] = { product: apiProduct, quantity };
  }
  return cart[key];
};

// Reemplaza la cantidad de un ítem existente en el carrito
exports.updateItem = (cart, productId, quantity) => {
  cart[productId].quantity = quantity;
  return cart[productId];
};

// Elimina un ítem del carrito por su productId
exports.removeItem = (cart, key) => {
  delete cart[key];
};

// Vacía el carrito completo de la sesión
exports.clear = (session) => {
  session.cart = {};
};
