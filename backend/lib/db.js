const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json')

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

function nextId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1
}

module.exports = { readDB, writeDB, nextId }
