# Mi Inventario Express

Sistema de inventario desarrollado con Node.js, Express y MongoDB siguiendo el patrón MVC.

---

## Datos del Estudiante

| Campo | Detalle |
|---|---|
| Nombre | Jorge Rivera |
| Correo | jriveray@est.ups.edu.ec |
| Materia | Aplicaciones Web |
| Ciclo | Cuarto Ciclo |
| Institución | Universidad Politécnica Salesiana (UPS) |


## Funcionalidades Implementadas

### Autenticación de Usuarios
- Registro de nuevos usuarios con validación de campos
- Inicio de sesión con verificación de contraseña (bcrypt)
- Cierre de sesión
- Protección de rutas mediante middleware de autenticación

### Gestión de Productos (CRUD)
- Listar todos los productos del inventario
- Crear nuevo producto con nombre, descripción, precio, cantidad e imagen
- Editar y actualizar datos de un producto existente
- Eliminar producto

### Subida de Imágenes
- Carga de imágenes por producto con Multer
- Validación de tipo de archivo (`.jpg`, `.jpeg`, `.png`, `.webp`) y tamaño máximo de 2 MB
- Almacenamiento en la carpeta `uploads/`

### Perfil de Usuario
- Ver datos del perfil
- Actualizar contraseña

### Chat en Tiempo Real
- Chat privado entre usuarios registrados mediante Socket.io
- Historial de conversaciones por usuario
- Lista de usuarios conectados en tiempo real

### Validación de Formularios
- Validación del lado del servidor con express-validator
- Mensajes de error sin perder los datos ingresados

---

## Instrucciones de Uso

### Requisitos previos

- Node.js v18 o superior
- MongoDB corriendo localmente o URI de MongoDB Atlas

### 1. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mi_inventario
SESSION_SECRET=tu_clave_secreta
```

### 4. Ejecutar la aplicación

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

### 5. Uso básico

1. Accede a `http://localhost:3000/auth/registro` y crea una cuenta.
2. Inicia sesión en `http://localhost:3000/auth/login`.
3. Desde el dashboard puedes agregar, editar y eliminar productos.
4. Usa el chat para comunicarte con otros usuarios registrados.

---

## Estructura del Proyecto

```
mi_inventario_express/
├── app.js               ← servidor Express + Socket.io
├── models/              ← M (Model) → esquemas de Mongoose
├── routes/              ← rutas HTTP
│   ├── index.js
│   ├── auth.js
│   └── productos.js
├── controllers/         ← lógica del CRUD y login
│   ├── indexController.js
│   ├── authController.js
│   └── productoController.js
├── middleware/          ← autenticación, validaciones, upload
├── views/               ← V (View) → plantillas Handlebars (.hbs)
│   ├── layouts/
│   │   └── main.hbs
│   └── partials/
├── public/              ← archivos estáticos (CSS, JS del cliente)
│   ├── css/
│   └── js/
└── uploads/             ← imágenes subidas por el usuario
```

## Tecnologías

- **Node.js** + **Express** — servidor HTTP
- **MongoDB** + **Mongoose** — base de datos
- **Handlebars** — motor de vistas
- **Socket.io** — comunicación en tiempo real
- **bcrypt** — hash de contraseñas
- **express-session** — manejo de sesiones
- **multer** — subida de archivos
- **express-validator** — validación de formularios
- **dotenv** — variables de entorno
