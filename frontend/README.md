# MercApp — Frontend

SPA construida con **Vue 3 + Vite** que consume la API REST del backend. Incluye catálogo de productos con búsqueda y filtro por categoría, vista de detalle y carrito de compras.

> El frontend requiere que el backend esté corriendo en `http://localhost:3000`. Ver [`backend/README.md`](../backend/README.md).

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18.x           |
| pnpm        | 9.x            |

> Si no tenés `pnpm` instalado:
> ```bash
> npm install -g pnpm
> ```

---

## Instalación

```bash
cd frontend
pnpm install
```

---

## Levantar el servidor de desarrollo

```bash
pnpm dev
```

La app queda disponible en: **http://localhost:5173**

> Vite proxea automáticamente las llamadas a `/api` hacia `http://localhost:3000`, por lo que no hace falta configurar CORS ni hardcodear la URL del backend.

### Otros comandos

| Comando        | Descripción                              |
|----------------|------------------------------------------|
| `pnpm dev`     | Servidor de desarrollo con HMR           |
| `pnpm build`   | Genera el bundle de producción en `dist/`|
| `pnpm preview` | Sirve el bundle de producción localmente |

---

## Estructura de carpetas

```
frontend/
├── index.html              # Entry point HTML
├── vite.config.js          # Plugin Vue, alias @/, proxy /api
├── package.json
└── src/
    ├── main.js             # Crea la app, registra router, monta en #app
    ├── App.vue             # Shell raíz con <RouterView />
    ├── router/
    │   └── index.js        # Definición de rutas
    ├── views/
    │   ├── HomeView.vue          # Catálogo con búsqueda y filtro
    │   ├── ProductDetailView.vue # Detalle de producto
    │   ├── CartView.vue          # Carrito de compras
    │   ├── AboutView.vue         # Acerca de
    │   └── NotFoundView.vue      # 404
    ├── components/
    │   └── ProductCard.vue       # Tarjeta reutilizable de producto
    ├── assets/
    │   └── css/
    │       └── main.css          # Reset y variables CSS globales
    └── api/
        └── index.js              # Cliente fetch para el backend
```

---

## Rutas

| Ruta             | Vista                  | Descripción                        |
|------------------|------------------------|------------------------------------|
| `/`              | `HomeView`             | Catálogo con buscador y filtros    |
| `/product/:id`   | `ProductDetailView`    | Detalle completo de un producto    |
| `/cart`          | `CartView`             | Carrito de compras                 |
| `/about`         | `AboutView`            | Información de la aplicación       |
| `/*`             | `NotFoundView`         | Página 404 catch-all               |

Las rutas de detalle, carrito, about y 404 se cargan en **chunks separados** (lazy loading) para reducir el bundle inicial.

---

## Alias de rutas

El alias `@/` apunta a `src/`. Se puede usar en cualquier import:

```js
import ProductCard from '@/components/ProductCard.vue'
import { api } from '@/api/index.js'
```

---

## Cliente API (`src/api/index.js`)

Centraliza todas las llamadas al backend. Las peticiones van a `/api` (proxeado a `:3000`).

```js
import { api } from '@/api/index.js'

// Productos
await api.products.list()                  // GET /api/products
await api.products.list({ categoryId: 1 }) // GET /api/products?categoryId=1
await api.products.list({ q: 'auricular'}) // GET /api/products?q=auricular
await api.products.get(1)                  // GET /api/products/1

// Categorías
await api.categories.list()                // GET /api/categories

// Carrito
await api.cart.get()                       // GET /api/cart
await api.cart.addItem(1, 2)               // POST /api/cart/items
await api.cart.updateItem(1, 3)            // PUT /api/cart/items/1
await api.cart.removeItem(1)               // DELETE /api/cart/items/1
await api.cart.clear()                     // DELETE /api/cart
```

---

## Variables CSS globales

Definidas en `src/assets/css/main.css` y disponibles en todos los componentes:

| Variable              | Uso                          |
|-----------------------|------------------------------|
| `--color-primary`     | Azul principal (`#3b82f6`)   |
| `--color-primary-dark`| Azul hover (`#2563eb`)       |
| `--color-danger`      | Rojo para errores/sin stock  |
| `--color-text`        | Texto principal              |
| `--color-text-muted`  | Texto secundario             |
| `--color-bg`          | Fondo de la página           |
| `--color-surface`     | Fondo de tarjetas/inputs     |
| `--color-border`      | Bordes                       |
| `--radius`            | Border radius estándar       |
| `--shadow`            | Sombra estándar              |
