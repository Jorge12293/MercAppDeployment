<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/index.js'
import { useApi } from '@/composables/useApi.js'
import { useProducts } from '@/composables/useProducts.js'
import { useCart } from '@/composables/useCart.js'
import ProductCard from '@/components/ProductCard.vue'

// Catálogo reactivo con búsqueda y filtro
const { products, loading, error, filters, toggleCategory } = useProducts()

// Categorías: carga única al montar
const { data: categories, execute: loadCategories } = useApi(
  (signal) => api.categories.list(signal)
)
onMounted(loadCategories)

// Carrito local (localStorage)
const { addItem } = useCart()
const cartMessage = ref('')
let cartMessageTimer = null

function onAddedToCart(product) {
  addItem(product, 1)
  clearTimeout(cartMessageTimer)
  cartMessage.value = `"${product.name}" añadido al carrito`
  cartMessageTimer = setTimeout(() => { cartMessage.value = '' }, 2500)
}
</script>

<template>
  <div class="home">
    <header class="home__header">
      <div>
        <h1 class="home__title">Catálogo de Productos</h1>
        <p class="home__subtitle">
          {{ products?.length ?? 0 }} producto{{ products?.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <RouterLink to="/product/new" class="btn-new">+ Nuevo producto</RouterLink>
    </header>

    <div class="home__controls">
      <input
        v-model="filters.q"
        type="search"
        placeholder="Buscar por nombre o descripción..."
        class="search-input"
      />

      <div class="categories">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-btn"
          :class="{ 'category-btn--active': filters.categoryId === cat.id }"
          @click="toggleCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <p v-if="error" class="feedback feedback--error">{{ error }}</p>

    <template v-else>
      <div v-if="loading" class="feedback">Cargando productos...</div>

      <p v-else-if="!products?.length" class="feedback">
        No hay productos que coincidan con la búsqueda.
      </p>

      <template v-else>
        <p v-if="cartMessage" class="cart-toast">{{ cartMessage }}</p>

        <div class="products-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @added-to-cart="onAddedToCart"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.home__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.btn-new {
  flex-shrink: 0;
  padding: 8px 16px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-new:hover {
  background: var(--color-primary-dark);
}

.home__title {
  font-size: 1.75rem;
  font-weight: 700;
}

.home__subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.home__controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-btn {
  padding: 6px 16px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.category-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.category-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.feedback {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-muted);
}

.feedback--error {
  color: var(--color-danger);
}

.cart-toast {
  background: #16a34a;
  color: #fff;
  padding: 10px 16px;
  border-radius: var(--radius);
  font-size: 0.9rem;
  margin-bottom: 16px;
}
</style>
