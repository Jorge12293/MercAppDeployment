const productService = require('../../services/productService');

// Lista productos; acepta ?categoryId= y ?q= como filtros opcionales
exports.getAll = async (req, res, next) => {
  try {
    const { categoryId, q } = req.query;
    if (categoryId !== undefined && !productService.isValidId(categoryId))
      return res.status(400).json({ error: 'categoryId inválido' });
    const productos = await productService.findAll({ categoryId, q });
    res.json(productos.map(productService.serialize));
  } catch (err) { next(err); }
};

// Retorna un producto por id o 404 si no existe
exports.getOne = async (req, res, next) => {
  try {
    if (!productService.isValidId(req.params.id))
      return res.status(404).json({ error: 'Producto no encontrado' });
    const producto = await productService.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(productService.serialize(producto));
  } catch (err) { next(err); }
};

// Crea un producto tras validar el body; retorna 201 con el recurso creado
exports.create = async (req, res, next) => {
  try {
    const error = productService.validateInput(req.body);
    if (error) return res.status(400).json({ error });
    const { name, description, price, imageUrl, stock, categoryId } = req.body;
    if (categoryId && !await productService.categoryExists(categoryId))
      return res.status(400).json({ error: 'La categoría seleccionada no es válida' });
    const producto = await productService.create({
      nombre:      name.trim(),
      descripcion: description ? String(description).trim() : '',
      precio:      price,
      imagen:      imageUrl ? String(imageUrl).trim() : '',
      categoria:   categoryId || null,
      stock:       stock ?? 0
    });
    res.status(201).json(productService.serialize(producto));
  } catch (err) { next(err); }
};

// Reemplaza todos los campos del producto; requiere body completo
exports.update = async (req, res, next) => {
  try {
    if (!productService.isValidId(req.params.id))
      return res.status(404).json({ error: 'Producto no encontrado' });
    const error = productService.validateInput(req.body);
    if (error) return res.status(400).json({ error });
    const { name, description, price, imageUrl, stock, categoryId } = req.body;
    if (categoryId && !await productService.categoryExists(categoryId))
      return res.status(400).json({ error: 'La categoría seleccionada no es válida' });
    const producto = await productService.update(req.params.id, {
      nombre:      name.trim(),
      descripcion: description ? String(description).trim() : '',
      precio:      price,
      imagen:      imageUrl ? String(imageUrl).trim() : '',
      categoria:   categoryId || null,
      stock:       stock ?? 0
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(productService.serialize(producto));
  } catch (err) { next(err); }
};

// Actualiza solo los campos enviados sin tocar los omitidos
exports.patch = async (req, res, next) => {
  try {
    if (!productService.isValidId(req.params.id))
      return res.status(404).json({ error: 'Producto no encontrado' });
    const error = productService.validateInput(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    const updates = productService.buildPatchFields(req.body);
    if (req.body.categoryId !== undefined) {
      if (req.body.categoryId) {
        if (!await productService.categoryExists(req.body.categoryId))
          return res.status(400).json({ error: 'La categoría seleccionada no es válida' });
        updates.categoria = req.body.categoryId;
      } else {
        updates.categoria = null;
      }
    }
    const producto = await productService.patch(req.params.id, updates);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(productService.serialize(producto));
  } catch (err) { next(err); }
};

// Elimina el producto y retorna 204 sin cuerpo
exports.remove = async (req, res, next) => {
  try {
    if (!productService.isValidId(req.params.id))
      return res.status(404).json({ error: 'Producto no encontrado' });
    const deleted = await productService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
};
