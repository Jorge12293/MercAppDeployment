# MercApp — Backend API

API REST construida con **Node.js + Express** que sirve el catálogo de productos de MercApp. Los datos se persisten en un archivo JSON local (`data/db.json`). El carrito de compras se mantiene en memoria (se reinicia al reiniciar el servidor).

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18.x           |
| pnpm        | 9.x            |

---

## Instalación

```bash
# Desde la raíz del proyecto
cd backend
pnpm install

# Poblar la base de datos con datos de prueba
pnpm seed
```

---

## Levantar el servidor

### Modo desarrollo (con recarga automática)

```bash
pnpm dev
```

> Requiere `nodemon`. Si no está instalado: `pnpm add -D nodemon`

### Modo producción

```bash
pnpm start
```

El servidor queda disponible en: **http://localhost:3000**

---

## Estructura de carpetas

```
backend/
├── server.js          # Entry point — solo inicia el servidor
├── app.js             # Express: middleware, rutas y manejo de errores
├── routes/
│   ├── categories.js  # GET /api/categories
│   ├── products.js    # CRUD /api/products
│   └── cart.js        # Carrito en memoria /api/cart
├── lib/
│   └── db.js          # Helpers: readDB, writeDB, nextId
└── data/
    └── db.json        # Base de datos JSON
```

---

## Endpoints

### Categorías

| Método | Ruta              | Descripción             |
|--------|-------------------|-------------------------|
| GET    | `/api/categories` | Lista todas las categorías |

---

### Productos

| Método | Ruta                 | Descripción                        |
|--------|----------------------|------------------------------------|
| GET    | `/api/products`      | Lista productos (con filtros)      |
| GET    | `/api/products/:id`  | Detalle de un producto             |
| POST   | `/api/products`      | Crea un producto                   |
| PUT    | `/api/products/:id`  | Reemplaza un producto completo     |
| PATCH  | `/api/products/:id`  | Actualización parcial              |
| DELETE | `/api/products/:id`  | Elimina un producto                |

#### Filtros disponibles en `GET /api/products`

| Query param  | Tipo   | Descripción                                      |
|--------------|--------|--------------------------------------------------|
| `categoryId` | number | Filtra por categoría (`?categoryId=1`)           |
| `q`          | string | Busca en nombre y descripción (`?q=bluetooth`)   |

Los filtros se pueden combinar: `?categoryId=1&q=auricular`

#### Campos del producto

| Campo         | Tipo   | Obligatorio | Descripción                         |
|---------------|--------|-------------|-------------------------------------|
| `name`        | string | Sí          | Nombre del producto (no vacío)      |
| `price`       | number | Sí          | Precio mayor a 0                    |
| `categoryId`  | number | Sí          | ID de categoría existente           |
| `description` | string | No          | Descripción del producto            |
| `imageUrl`    | string | No          | URL de la imagen                    |
| `stock`       | number | No          | Entero no negativo (default: 0)     |

---

### Carrito (en memoria)

El carrito se reinicia cuando el servidor se detiene.

| Método | Ruta                        | Descripción                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/cart`                 | Contenido del carrito y total        |
| POST   | `/api/cart/items`           | Agrega un producto al carrito        |
| PUT    | `/api/cart/items/:productId`| Actualiza la cantidad de un ítem     |
| DELETE | `/api/cart/items/:productId`| Elimina un ítem del carrito          |
| DELETE | `/api/cart`                 | Vacía el carrito completo            |

#### Body para `POST /api/cart/items`

```json
{
  "productId": 1,
  "quantity": 2
}
```

#### Respuesta de `GET /api/cart`

```json
{
  "items": [
    {
      "product": { "id": 1, "name": "Auriculares Bluetooth", "price": 59.99, "..." },
      "quantity": 2
    }
  ],
  "total": 119.98
}
```

---

## Códigos de respuesta

| Código | Situación                                      |
|--------|------------------------------------------------|
| 200    | Operación exitosa                              |
| 201    | Recurso creado (POST)                          |
| 204    | Eliminación exitosa (sin cuerpo)               |
| 400    | Datos inválidos o campos obligatorios faltantes|
| 404    | Recurso o ruta no encontrada                   |
| 500    | Error interno del servidor                     |

---

## Ejemplos rápidos con curl

```bash
# Listar categorías
curl http://localhost:3000/api/categories

# Buscar productos por texto
curl "http://localhost:3000/api/products?q=bluetooth"

# Filtrar por categoría + búsqueda
curl "http://localhost:3000/api/products?categoryId=1&q=smart"

# Detalle de un producto
curl http://localhost:3000/api/products/1

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Teclado Mecánico","price":89.99,"categoryId":1,"stock":20}'

# Agregar al carrito
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'

# Ver carrito
curl http://localhost:3000/api/cart

# Vaciar carrito
curl -X DELETE http://localhost:3000/api/cart
```
