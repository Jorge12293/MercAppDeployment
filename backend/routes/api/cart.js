const { Router } = require('express');
const mongoose = require('mongoose');
const Producto = require('../../models/Producto');

const router = Router();

function getCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

function cartResponse(cart) {
  const items = Object.values(cart);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { items, total: Number(total.toFixed(2)) };
}

// GET /api/cart
router.get('/', (req, res) => {
  res.json(cartResponse(getCart(req)));
});

// POST /api/cart/items  { productId, quantity }
router.post('/items', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'productId debe ser un ObjectId válido' });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'quantity debe ser un entero mayor a 0' });
    }

    const producto = await Producto.findById(productId).lean();
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const cart = getCart(req);
    const key = String(productId);

    const apiProduct = {
      id:          producto._id,
      name:        producto.nombre,
      description: producto.descripcion ?? '',
      price:       producto.precio,
      imageUrl:    producto.imagen ?? '',
      categoryId:  producto.categoria ?? null,
      stock:       producto.stock ?? 0
    };

    if (cart[key]) {
      cart[key].quantity += quantity;
    } else {
      cart[key] = { product: apiProduct, quantity };
    }

    res.status(201).json(cart[key]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart/items/:productId  { quantity }
router.put('/items/:productId', (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const cart = getCart(req);

  if (!cart[productId]) return res.status(404).json({ error: 'Producto no está en el carrito' });
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'quantity debe ser un entero mayor a 0' });
  }

  cart[productId].quantity = quantity;
  res.json(cart[productId]);
});

// DELETE /api/cart/items/:productId
router.delete('/items/:productId', (req, res) => {
  const cart = getCart(req);
  const key = req.params.productId;
  if (!cart[key]) return res.status(404).json({ error: 'Producto no está en el carrito' });
  delete cart[key];
  res.status(204).send();
});

// DELETE /api/cart
router.delete('/', (req, res) => {
  req.session.cart = {};
  res.status(204).send();
});

module.exports = router;
