const app = require('./app')

const PORT = 3000

app.listen(PORT, () => {
  console.log(`MercApp API corriendo en http://localhost:${PORT}`)
})
