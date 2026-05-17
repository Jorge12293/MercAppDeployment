const categoryService = require('../../services/categoryService');

// Lista todas las categorías ordenadas por nombre
exports.getAll = async (req, res, next) => {
  try {
    const categorias = await categoryService.findAll();
    res.json(categorias.map(categoryService.serialize));
  } catch (err) { next(err); }
};

// Crea una categoría; rechaza duplicados con 400 en lugar de dejar explotar el índice único
exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '')
      return res.status(400).json({ error: 'name es obligatorio' });
    const categoria = await categoryService.create(name);
    res.status(201).json(categoryService.serialize(categoria));
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    next(err);
  }
};

// Elimina la categoría por id; retorna 404 si no existía
exports.remove = async (req, res, next) => {
  try {
    const deleted = await categoryService.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
};
