const { Router } = require('express')
const { readDB } = require('../lib/db')

const router = Router()

router.get('/', (req, res, next) => {
  try {
    const { categories } = readDB()
    res.json(categories)
  } catch (err) {
    next(err)
  }
})

module.exports = router
