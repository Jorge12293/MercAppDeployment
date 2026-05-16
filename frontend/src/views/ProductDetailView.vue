<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/index.js'
import { useCart } from '@/composables/useCart.js'

const route = useRoute()
const router = useRouter()

const product = ref(null)
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const added = ref(false)
const { addItem } = useCart()

const categoryName = computed(() => {
  if (!product.value || !categories.value.length) return ''
  return categories.value.find(c => c.id === product.value.categoryId)?.name ?? ''
})

onMounted(async () => {
  loading.value = true
  try {
    const [prod, cats] = await Promise.all([
      api.products.get(route.params.id),
      api.categories.list()
    ])
    product.value = prod
    categories.value = cats
  } catch (err) {
    if (err.message.includes('no encontrado')) {
      router.replace({ name: 'not-found' })
    } else {
      error.value = err.message
    }
  } finally {
    loading.value = false
  }
})

function addToCart() {
  addItem(product.value, 1)
  added.value = true
  setTimeout(() => { added.value = false }, 2500)
}
</script>

<template>
  <div class="detail-page">
    <RouterLink to="/" class="back-link">← Volver al catálogo</RouterLink>

    <div v-if="loading" class="feedback">Cargando producto...</div>

    <p v-else-if="error" class="feedback feedback--error">{{ error }}</p>

    <article v-else-if="product" class="detail">
      <RouterLink
        :to="`/product/${product.id}/edit`"
        class="edit-link"
        style="grid-column: 1 / -1; justify-self: end"
      >
        Editar producto
      </RouterLink>
      <img
        :src="product.imageUrl || 'https://placehold.co/600x400?text=Sin+imagen'"
        :alt="product.name"
        class="detail__img"
      />

      <div class="detail__info">
        <p v-if="categoryName" class="detail__category">{{ categoryName }}</p>
        <h1 class="detail__name">{{ product.name }}</h1>
        <p class="detail__description">{{ product.description }}</p>

        <div class="detail__meta">
          <span class="detail__price">${{ product.price.toFixed(2) }}</span>
          <span
            class="detail__stock"
            :class="{ 'detail__stock--out': product.stock === 0 }"
          >
            {{ product.stock > 0 ? `${product.stock} en stock` : 'Sin stock' }}
          </span>
        </div>

        <button
          class="btn-add"
          :disabled="product.stock === 0"
          @click="addToCart"
        >
          Añadir al carrito
        </button>

        <p v-if="added" class="feedback--success">¡Producto añadido al carrito!</p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

.back-link {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--color-primary);
  margin-bottom: 24px;
}

.back-link:hover {
  text-decoration: underline;
}

.edit-link {
  display: inline-block;
  padding: 6px 14px;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
}

.edit-link:hover {
  background: var(--color-primary);
  color: #fff;
}

.detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

@media (max-width: 600px) {
  .detail {
    grid-template-columns: 1fr;
  }
}

.detail__img {
  width: 100%;
  border-radius: var(--radius);
  object-fit: cover;
}

.detail__info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail__category {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
}

.detail__name {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.detail__description {
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.detail__meta {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-top: 4px;
}

.detail__price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.detail__stock {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.detail__stock--out {
  color: var(--color-danger);
}

.btn-add {
  margin-top: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
}

.btn-add:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-add:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.feedback {
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-muted);
}

.feedback--error {
  color: var(--color-danger);
}

.feedback--success {
  font-size: 0.9rem;
  color: #16a34a;
  font-weight: 500;
}
</style>
