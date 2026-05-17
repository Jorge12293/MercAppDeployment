const mongoose = require('mongoose');

// True si el string es un ObjectId de MongoDB con formato válido (24 hex chars)
exports.isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
