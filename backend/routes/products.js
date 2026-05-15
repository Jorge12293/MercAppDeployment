const { Router } = require('express')
const { readDB, writeDB, nextId } = require('../lib/db')

const router = Router()

// Returns an error string if the body fails validation, null otherwise.
// In partial mode (PATCH) only validates fields that are present.
function validateProduct(body, { partial = false } = {}) {
  const { name, price, categoryId, stock, description, imageUrl } = body

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return 'name es obligatorio y debe ser una cadena no vacía'
    }
  }
  if (!partial || price !== undefined) {
    if (price === undefined || price === null) return 'price es obligatorio'
    if (typeof price !== 'number' || !isFinite(price) || price <= 0) {
      return 'price debe ser un número mayor a 0'
    }
  }
  if (!partial || categoryId !== undefined) {
    if (categoryId === undefined || categoryId === null) return 'categoryId es obligatorio'
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return 'categoryId debe ser un entero positivo'
    }
  }
  if (stock !== undefined) {
    if (!Number.isInteger(stock) || stock < 0) {
      return 'stock debe ser un entero no negativo'
    }
  }
  if (description !== undefined && typeof description !== 'string') {
    return 'description debe ser una cadena'
  }
  if (imageUrl !== undefined && typeof imageUrl !== 'string') {
    return 'imageUrl debe ser una cadena'
  }
  return null
}

// Supports optional ?categoryId=N and ?q=term filters (combinable)
router.get('/', (req, res, next) => {
  try {
    let { products } = readDB()
    const { categoryId, q } = req.query

    if (categoryId !== undefined) {
      const id = Number(categoryId)
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'categoryId debe ser un entero positivo' })
      }
      products = products.filter(p => p.categoryId === id)
    }

    if (q !== undefined) {
      const term = q.trim().toLowerCase()
      if (term.length > 0) {
        products = products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        )
      }
    }

    res.json(products)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', (req, res, next) => {
  try {
    const { products } = readDB()
    const product = products.find(p => p.id === Number(req.params.id))
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json(product)
  } catch (err) {
    next(err)
  }
})

router.post('/', (req, res, next) => {
  try {
    const validationError = validateProduct(req.body)
    if (validationError) return res.status(400).json({ error: validationError })

    const { name, description, price, imageUrl, categoryId, stock } = req.body
    const db = readDB()

    if (!db.categories.some(c => c.id === categoryId)) {
      return res.status(400).json({ error: `La categoría con id ${categoryId} no existe` })
    }

    const newProduct = {
      id: nextId(db.products),
      name: name.trim(),
      description: description != null ? String(description).trim() : '',
      price,
      imageUrl: imageUrl != null ? String(imageUrl).trim() : '',
      categoryId,
      stock: stock ?? 0
    }

    db.products.push(newProduct)
    writeDB(db)
    res.status(201).json(newProduct)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', (req, res, next) => {
  try {
    const validationError = validateProduct(req.body)
    if (validationError) return res.status(400).json({ error: validationError })

    const { name, description, price, imageUrl, categoryId, stock } = req.body
    const db = readDB()
    const index = db.products.findIndex(p => p.id === Number(req.params.id))
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' })

    if (!db.categories.some(c => c.id === categoryId)) {
      return res.status(400).json({ error: `La categoría con id ${categoryId} no existe` })
    }

    db.products[index] = {
      id: db.products[index].id,
      name: name.trim(),
      description: description != null ? String(description).trim() : '',
      price,
      imageUrl: imageUrl != null ? String(imageUrl).trim() : '',
      categoryId,
      stock: stock ?? 0
    }

    writeDB(db)
    res.json(db.products[index])
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', (req, res, next) => {
  try {
    const validationError = validateProduct(req.body, { partial: true })
    if (validationError) return res.status(400).json({ error: validationError })

    const db = readDB()
    const index = db.products.findIndex(p => p.id === Number(req.params.id))
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' })

    const { categoryId } = req.body
    if (categoryId !== undefined && !db.categories.some(c => c.id === categoryId)) {
      return res.status(400).json({ error: `La categoría con id ${categoryId} no existe` })
    }

    // Only allow known fields to avoid arbitrary property injection
    const ALLOWED = ['name', 'description', 'price', 'imageUrl', 'categoryId', 'stock']
    const updates = {}
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        updates[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key]
      }
    }

    db.products[index] = { ...db.products[index], ...updates }
    writeDB(db)
    res.json(db.products[index])
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', (req, res, next) => {
  try {
    const db = readDB()
    const index = db.products.findIndex(p => p.id === Number(req.params.id))
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' })

    db.products.splice(index, 1)
    writeDB(db)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

module.exports = router
