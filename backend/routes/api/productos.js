const { Router } = require('express');
const mongoose = require('mongoose');
const Producto = require('../../models/Producto');
const Categoria = require('../../models/Categoria');

const router = Router();

function toApi(p) {
  const imagen = p.imagen ?? '';
  const imageUrl = imagen && !imagen.startsWith('http') ? `/uploads/${imagen}` : imagen;
  return {
    id:          p._id,
    name:        p.nombre,
    description: p.descripcion ?? '',
    price:       p.precio,
    imageUrl,
    categoryId:  p.categoria ?? null,
    stock:       p.stock ?? 0
  };
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validateBody(body, { partial = false } = {}) {
  const { name, price, categoryId, stock, description, imageUrl } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return 'name es obligatorio y debe ser una cadena no vacía';
    }
  }
  if (!partial || price !== undefined) {
    if (price === undefined || price === null) return 'price es obligatorio';
    if (typeof price !== 'number' || !isFinite(price) || price <= 0) {
      return 'price debe ser un número mayor a 0';
    }
  }
  if (categoryId !== undefined && categoryId !== null) {
    if (!isValidId(categoryId)) return 'categoryId inválido';
  }
  if (stock !== undefined) {
    if (!Number.isInteger(stock) || stock < 0) {
      return 'stock debe ser un entero no negativo';
    }
  }
  if (description !== undefined && typeof description !== 'string') {
    return 'description debe ser una cadena';
  }
  if (imageUrl !== undefined && typeof imageUrl !== 'string') {
    return 'imageUrl debe ser una cadena';
  }
  return null;
}

// GET /api/products?categoryId=&q=
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    const { categoryId, q } = req.query;

    if (categoryId !== undefined) {
      if (!isValidId(categoryId)) return res.status(400).json({ error: 'categoryId inválido' });
      filter.categoria = categoryId;
    }

    let productos = await Producto.find(filter).lean().sort({ createdAt: -1 });

    if (q && q.trim().length > 0) {
      const term = q.trim().toLowerCase();
      productos = productos.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term))
      );
    }

    res.json(productos.map(toApi));
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Producto no encontrado' });
    const producto = await Producto.findById(req.params.id).lean();
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(toApi(producto));
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post('/', async (req, res, next) => {
  try {
    const error = validateBody(req.body);
    if (error) return res.status(400).json({ error });

    const { name, description, price, imageUrl, stock, categoryId } = req.body;

    if (categoryId) {
      const existe = await Categoria.exists({ _id: categoryId });
      if (!existe) return res.status(400).json({ error: 'La categoría seleccionada no es válida' });
    }

    const producto = await Producto.create({
      nombre:      name.trim(),
      descripcion: description ? String(description).trim() : '',
      precio:      price,
      imagen:      imageUrl ? String(imageUrl).trim() : '',
      categoria:   categoryId || null,
      stock:       stock ?? 0
    });

    res.status(201).json(toApi(producto));
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Producto no encontrado' });

    const error = validateBody(req.body);
    if (error) return res.status(400).json({ error });

    const { name, description, price, imageUrl, stock, categoryId } = req.body;

    if (categoryId) {
      const existe = await Categoria.exists({ _id: categoryId });
      if (!existe) return res.status(400).json({ error: 'La categoría seleccionada no es válida' });
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        nombre:      name.trim(),
        descripcion: description ? String(description).trim() : '',
        precio:      price,
        imagen:      imageUrl ? String(imageUrl).trim() : '',
        categoria:   categoryId || null,
        stock:       stock ?? 0
      },
      { new: true, runValidators: true }
    ).lean();

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(toApi(producto));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id
router.patch('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Producto no encontrado' });

    const error = validateBody(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    const FIELD_MAP = { name: 'nombre', description: 'descripcion', price: 'precio', imageUrl: 'imagen', stock: 'stock' };
    const updates = {};

    for (const [apiKey, dbKey] of Object.entries(FIELD_MAP)) {
      if (req.body[apiKey] !== undefined) {
        updates[dbKey] = typeof req.body[apiKey] === 'string' ? req.body[apiKey].trim() : req.body[apiKey];
      }
    }

    if (req.body.categoryId !== undefined) {
      if (req.body.categoryId) {
        const existe = await Categoria.exists({ _id: req.body.categoryId });
        if (!existe) return res.status(400).json({ error: 'La categoría seleccionada no es válida' });
        updates.categoria = req.body.categoryId;
      } else {
        updates.categoria = null;
      }
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(toApi(producto));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: 'Producto no encontrado' });
    const deleted = await Producto.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
