const { Router } = require('express');
const Categoria = require('../../models/Categoria');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const categorias = await Categoria.find().lean().sort({ nombre: 1 });
    res.json(categorias.map(c => ({ id: c._id, name: c.nombre })));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'name es obligatorio' });
    }
    const categoria = await Categoria.create({ nombre: name.trim() });
    res.status(201).json({ id: categoria._id, name: categoria.nombre });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Categoria.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
