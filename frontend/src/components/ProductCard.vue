<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['added-to-cart'])
</script>

<template>
  <article class="card">
    <RouterLink :to="`/product/${product.id}`" class="card__link">
      <img
        :src="product.imageUrl || 'https://placehold.co/400x300?text=Sin+imagen'"
        :alt="product.name"
        class="card__img"
      />
      <div class="card__body">
        <h3 class="card__name">{{ product.name }}</h3>
        <p class="card__description">{{ product.description }}</p>
      </div>
    </RouterLink>

    <div class="card__footer">
      <span class="card__price">${{ product.price.toFixed(2) }}</span>
      <button
        class="card__btn"
        :disabled="product.stock === 0"
        @click="emit('added-to-cart', product)"
      >
        {{ product.stock > 0 ? 'Añadir' : 'Sin stock' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card__link {
  display: flex;
  flex-direction: column;
  flex: 1;
  color: inherit;
}

.card__img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 14px 10px;
  flex: 1;
}

.card__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.card__description {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 14px;
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.card__price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.card__btn {
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
}

.card__btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.card__btn:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}
</style>
