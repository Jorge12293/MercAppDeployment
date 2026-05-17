const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede superar 100 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede superar 500 caracteres']
  },
  imagen: {
    type: String,
    default: ''
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    default: null
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo'],
    validate: { validator: Number.isInteger, message: 'El stock debe ser un entero' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);
