require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// MongoDB
mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err));

// Handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    eq:         (a, b)     => a === b,
    startsWith: (str, pre) => typeof str === 'string' && str.startsWith(pre),
    formatDate: (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-EC', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sesiones compartidas con Socket.io
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
});
app.use(sessionMiddleware);
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

// Variables globales para vistas
app.use((req, res, next) => {
  res.locals.usuario      = req.session.usuarioNombre || null;
  res.locals.usuarioEmail = req.session.usuarioEmail  || null;
  res.locals.currentPath  = req.path;
  next();
});

// Rutas web
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));
app.use('/productos', require('./middleware/autenticado'), require('./routes/productos'));

// API REST
app.use('/api/categories', require('./routes/api/categorias'));
app.use('/api/products',   require('./routes/api/productos'));
app.use('/api/cart',       require('./routes/api/cart'));

// 404 y manejo de errores para la API
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la solicitud' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Chat privado con Socket.io ────────────────────────
const socketToNombre  = new Map(); // socketId  → nombre
const nombreToSockets = new Map(); // nombre    → Set<socketId>
const historialPrivado = new Map(); // "A|B"    → [mensajes]

function convKey(a, b)   { return [a, b].sort().join('|'); }
function uniqueUsuarios() { return Array.from(nombreToSockets.keys()); }

function emitToUser(nombre, event, data) {
  const sockets = nombreToSockets.get(nombre);
  if (sockets) sockets.forEach(sid => io.to(sid).emit(event, data));
}

io.on('connection', (socket) => {
  const nombre = socket.request.session?.usuarioNombre;
  if (!nombre) return socket.disconnect();

  // Registrar socket
  socketToNombre.set(socket.id, nombre);
  if (!nombreToSockets.has(nombre)) nombreToSockets.set(nombre, new Set());
  nombreToSockets.get(nombre).add(socket.id);

  // Avisar a todos que hay un nuevo usuario
  io.emit('chat:usuarios', uniqueUsuarios());

  // Cargar historial de una conversación
  socket.on('chat:cargar', (otroUsuario) => {
    const key  = convKey(nombre, otroUsuario);
    const hist = historialPrivado.get(key) || [];
    socket.emit('chat:historial', { con: otroUsuario, mensajes: hist });
  });

  // Mensaje privado
  socket.on('chat:privado', ({ para, texto }) => {
    if (!texto || typeof texto !== 'string' || !para) return;

    const key  = convKey(nombre, para);
    if (!historialPrivado.has(key)) historialPrivado.set(key, []);
    const hist = historialPrivado.get(key);

    const msg = {
      de:   nombre,
      para,
      texto: texto.trim().substring(0, 500),
      hora:  new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    };

    hist.push(msg);
    if (hist.length > 100) hist.shift();

    // Enviar al emisor y al receptor
    socket.emit('chat:mensaje:privado', msg);
    emitToUser(para, 'chat:mensaje:privado', msg);
  });

  socket.on('disconnect', () => {
    socketToNombre.delete(socket.id);
    const sockets = nombreToSockets.get(nombre);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) nombreToSockets.delete(nombre);
    }
    io.emit('chat:usuarios', uniqueUsuarios());
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
