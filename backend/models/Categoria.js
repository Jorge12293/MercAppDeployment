const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    unique: true,
    maxlength: [100, 'El nombre no puede superar 100 caracteres']
  }
}, { timestamps: true });

module.exports = mongoose.model('Categoria', categoriaSchema);
