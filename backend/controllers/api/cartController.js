const cartService    = require('../../services/cartService');
const productService = require('../../services/productService');

// Retorna el carrito actual con items y total calculado
exports.getCart = (req, res) => {
  const cart = cartService.getSessionCart(req.session);
  res.json(cartService.buildResponse(cart));
};

// Agrega un producto al carrito o incrementa su cantidad si ya estaba
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId || !cartService.isValidId(productId))
      return res.status(400).json({ error: 'productId debe ser un ObjectId válido' });
    if (!Number.isInteger(quantity) || quantity <= 0)
      return res.status(400).json({ error: 'quantity debe ser un entero mayor a 0' });
    const producto = await productService.findById(productId);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    const cart = cartService.getSessionCart(req.session);
    const item = cartService.addItem(cart, String(productId), cartService.serializeProduct(producto), quantity);
    res.status(201).json(item);
  } catch (err) { next(err); }
};

// Reemplaza la cantidad de un ítem; la existencia del producto en carrito ya garantiza que existe en DB
exports.updateItem = (req, res) => {
  const { productId } = req.params;
  const { quantity }  = req.body;
  const cart = cartService.getSessionCart(req.session);
  if (!cart[productId]) return res.status(404).json({ error: 'Producto no está en el carrito' });
  if (!Number.isInteger(quantity) || quantity <= 0)
    return res.status(400).json({ error: 'quantity debe ser un entero mayor a 0' });
  res.json(cartService.updateItem(cart, productId, quantity));
};

// Elimina un ítem del carrito por productId
exports.removeItem = (req, res) => {
  const cart = cartService.getSessionCart(req.session);
  const key  = req.params.productId;
  if (!cart[key]) return res.status(404).json({ error: 'Producto no está en el carrito' });
  cartService.removeItem(cart, key);
  res.status(204).send();
};

// Vacía el carrito completo de la sesión
exports.clearCart = (req, res) => {
  cartService.clear(req.session);
  res.status(204).send();
};
