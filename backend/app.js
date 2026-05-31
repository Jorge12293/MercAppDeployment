require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { engine } = require('express-handlebars');
const { createServer } = require('http');
const { Server } = require('socket.io');
const session    = require('express-session');
const path       = require('path');
const connectDB  = require('./config/database');
const initChat   = require('./socket/chat');

connectDB();

const app        = express();
const httpServer = createServer(app);
const io         = new Server(httpServer);

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

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sesión compartida con Socket.io
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
});
app.use(sessionMiddleware);
// Inyectar el mismo middleware de sesión en Socket.io para acceder a req.session en los handlers
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

// Variables globales para vistas
app.use((req, res, next) => {
  res.locals.usuario      = req.session.usuarioNombre || null;
  res.locals.usuarioEmail = req.session.usuarioEmail  || null;
  res.locals.currentPath  = req.path;
  next();
});

// Rutas web
app.use('/', require('./routes/web/index'));
app.use('/', require('./routes/web/auth'));
app.use('/productos', require('./middleware/autenticado'), require('./routes/web/products'));

// API REST
app.use('/api/categories', require('./routes/api/categories'));
app.use('/api/products',   require('./routes/api/products'));
app.use('/api/cart',       require('./routes/api/cart'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 y error handler para la API
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

initChat(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
