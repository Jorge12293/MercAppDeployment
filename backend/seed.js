require('dotenv').config();
const mongoose = require('mongoose');
const Categoria = require('./models/Categoria');
const Producto  = require('./models/Producto');
const Usuario   = require('./models/Usuario');

const categorias = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Deportes',
  'Libros'
];

const productos = [
  { nombre: 'Auriculares Bluetooth',        descripcion: 'Auriculares inalámbricos con cancelación de ruido y 30h de batería.',                          precio: 59.99,  imagen: 'https://placehold.co/400x300?text=Auriculares', categoria: 'Electrónica', stock: 25 },
  { nombre: 'Smartwatch Deportivo',          descripcion: 'Reloj inteligente con GPS, monitor de frecuencia cardíaca y resistencia al agua.',              precio: 129.99, imagen: 'https://placehold.co/400x300?text=Smartwatch',  categoria: 'Electrónica', stock: 10 },
  { nombre: 'Teclado Mecánico RGB',          descripcion: 'Teclado mecánico con switches Cherry MX, retroiluminación RGB y reposamuñecas.',               precio: 89.99,  imagen: 'https://placehold.co/400x300?text=Teclado',     categoria: 'Electrónica', stock: 18 },
  { nombre: 'Camiseta Running',              descripcion: 'Camiseta técnica de secado rápido para actividad física intensa.',                              precio: 19.99,  imagen: 'https://placehold.co/400x300?text=Camiseta',    categoria: 'Ropa',        stock: 50 },
  { nombre: 'Chaqueta Impermeable',          descripcion: 'Chaqueta ligera resistente al viento y la lluvia, ideal para trekking.',                        precio: 89.99,  imagen: 'https://placehold.co/400x300?text=Chaqueta',    categoria: 'Ropa',        stock: 15 },
  { nombre: 'Zapatillas Trail',              descripcion: 'Calzado de montaña con suela grip y plantilla acolchada.',                                      precio: 74.99,  imagen: 'https://placehold.co/400x300?text=Zapatillas',  categoria: 'Ropa',        stock: 22 },
  { nombre: 'Lámpara de Escritorio LED',     descripcion: 'Lámpara con intensidad y temperatura de color ajustables, puerto USB integrado.',               precio: 34.99,  imagen: 'https://placehold.co/400x300?text=Lampara',     categoria: 'Hogar',       stock: 30 },
  { nombre: 'Set de Sartenes Antiadherentes',descripcion: 'Juego de 3 sartenes de acero forjado con recubrimiento antiadherente de última generación.',   precio: 49.99,  imagen: 'https://placehold.co/400x300?text=Sartenes',    categoria: 'Hogar',       stock: 12 },
  { nombre: 'Pelota de Fútbol',              descripcion: 'Pelota oficial tamaño 5, apta para césped natural y artificial.',                               precio: 24.99,  imagen: 'https://placehold.co/400x300?text=Pelota',      categoria: 'Deportes',    stock: 40 },
  { nombre: 'Mancuernas Ajustables 20 kg',   descripcion: 'Par de mancuernas con discos intercambiables, de 2 kg a 20 kg por unidad.',                    precio: 119.99, imagen: 'https://placehold.co/400x300?text=Mancuernas',  categoria: 'Deportes',    stock:  8 },
  { nombre: 'Clean Code',                    descripcion: 'Libro de Robert C. Martin sobre principios y prácticas de código limpio.',                      precio: 32.99,  imagen: 'https://placehold.co/400x300?text=CleanCode',   categoria: 'Libros',      stock: 35 },
  { nombre: 'El Proyecto Fénix',             descripcion: 'Novela sobre gestión de TI, DevOps y cultura de mejora continua.',                             precio: 27.99,  imagen: 'https://placehold.co/400x300?text=Fenix',       categoria: 'Libros',      stock: 20 }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB conectado');

  // Limpiar antes de insertar hace al script idempotente (seguro de ejecutar varias veces)
  await Categoria.deleteMany({});
  await Producto.deleteMany({});
  console.log('Colecciones limpiadas');

  const categoriaDocs = await Categoria.insertMany(categorias.map(nombre => ({ nombre })));
  // Mapa nombre→_id para resolver referencias sin realizar consultas adicionales
  const catMap = Object.fromEntries(categoriaDocs.map(c => [c.nombre, c._id]));
  console.log(`${categoriaDocs.length} categorías insertadas`);

  const productosConId = productos.map(p => ({
    nombre:      p.nombre,
    descripcion: p.descripcion,
    precio:      p.precio,
    imagen:      p.imagen,
    stock:       p.stock,
    categoria:   catMap[p.categoria]
  }));

  const productoDocs = await Producto.insertMany(productosConId);
  console.log(`${productoDocs.length} productos insertados`);

  // Elimina el usuario admin si ya existe y lo recrea para garantizar contraseña fresca
  await Usuario.deleteOne({ email: 'admin@gmail.com' });
  await Usuario.create({ nombre: 'Admin', email: 'admin@gmail.com', password: '123456' });
  console.log('Usuario admin creado → admin@gmail.com / 123456');

  await mongoose.disconnect();
  console.log('Listo.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
