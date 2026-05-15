const { Router } = require('express')
const { readDB } = require('../lib/db')

const router = Router()

// In-memory cart: { productId -> { product, quantity } }
const cart = {}

router.get('/', (req, res) => {
  const items = Object.values(cart)
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  res.json({ items, total: Number(total.toFixed(2)) })
})

router.post('/items', (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'productId debe ser un entero positivo' })
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'quantity debe ser un entero mayor a 0' })
    }

    const { products } = readDB()
    const product = products.find(p => p.id === productId)
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })

    if (cart[productId]) {
      cart[productId].quantity += quantity
    } else {
      cart[productId] = { product, quantity }
    }

    res.status(201).json(cart[productId])
  } catch (err) {
    next(err)
  }
})

router.put('/items/:productId', (req, res) => {
  const id = Number(req.params.productId)
  const { quantity } = req.body

  if (!cart[id]) return res.status(404).json({ error: 'Producto no está en el carrito' })

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'quantity debe ser un entero mayor a 0' })
  }

  cart[id].quantity = quantity
  res.json(cart[id])
})

router.delete('/items/:productId', (req, res) => {
  const id = Number(req.params.productId)
  if (!cart[id]) return res.status(404).json({ error: 'Producto no está en el carrito' })

  delete cart[id]
  res.status(204).send()
})

router.delete('/', (req, res) => {
  Object.keys(cart).forEach(k => delete cart[k])
  res.status(204).send()
})

module.exports = router
