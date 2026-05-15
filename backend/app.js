const express = require('express')
const categoriesRouter = require('./routes/categories')
const productsRouter = require('./routes/products')
const cartRouter = require('./routes/cart')

const app = express()

app.use(express.json())

app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` })
})

// Express requires 4 params to recognize this as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la solicitud' })
  }
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

module.exports = app
