<script setup>
import { useCart } from '@/composables/useCart.js'

const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart()
</script>

<template>
  <div class="cart-page">
    <header class="cart-page__header">
      <h1 class="cart-page__title">
        Carrito
        <span v-if="itemCount" class="cart-page__count">({{ itemCount }} ítem{{ itemCount !== 1 ? 's' : '' }})</span>
      </h1>
      <RouterLink to="/" class="back-link">← Seguir comprando</RouterLink>
    </header>

    <!-- Estado vacío -->
    <div v-if="!items.length" class="empty">
      <p class="empty__text">Tu carrito está vacío.</p>
      <RouterLink to="/" class="btn btn--primary">Ver catálogo</RouterLink>
    </div>

    <!-- Lista de ítems -->
    <template v-else>
      <ul class="cart-list">
        <li v-for="item in items" :key="item.product.id" class="cart-item">
          <img
            :src="item.product.imageUrl || 'https://placehold.co/80x80?text=?'"
            :alt="item.product.name"
            class="cart-item__img"
          />

          <div class="cart-item__info">
            <RouterLink :to="`/product/${item.product.id}`" class="cart-item__name">
              {{ item.product.name }}
            </RouterLink>
            <span class="cart-item__unit-price">${{ item.product.price.toFixed(2) }} c/u</span>
          </div>

          <!-- Controles de cantidad -->
          <div class="cart-item__qty">
            <button
              class="qty-btn"
              :disabled="item.quantity <= 1"
              @click="updateQuantity(item.product.id, item.quantity - 1)"
            >−</button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button
              class="qty-btn"
              @click="updateQuantity(item.product.id, item.quantity + 1)"
            >+</button>
          </div>

          <!-- Subtotal del ítem -->
          <span class="cart-item__subtotal">
            ${{ (item.product.price * item.quantity).toFixed(2) }}
          </span>

          <button
            class="cart-item__remove"
            title="Eliminar"
            @click="removeItem(item.product.id)"
          >×</button>
        </li>
      </ul>

      <!-- Footer: total y acciones -->
      <div class="cart-footer">
        <button class="btn btn--ghost" @click="clearCart">Vaciar carrito</button>
        <div class="cart-total">
          <span class="cart-total__label">Total</span>
          <strong class="cart-total__value">${{ total }}</strong>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.cart-page__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 28px;
}

.cart-page__title {
  font-size: 1.75rem;
  font-weight: 700;
}

.cart-page__count {
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

.back-link {
  font-size: 0.875rem;
  color: var(--color-primary);
}

.back-link:hover {
  text-decoration: underline;
}

/* Estado vacío */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 64px 0;
}

.empty__text {
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

/* Lista */
.cart-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.cart-item {
  display: grid;
  grid-template-columns: 64px 1fr auto auto auto;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: var(--color-surface);
}

.cart-item + .cart-item {
  border-top: 1px solid var(--color-border);
}

.cart-item__img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-item__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cart-item__name {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__name:hover {
  color: var(--color-primary);
}

.cart-item__unit-price {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Controles de cantidad */
.cart-item__qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s;
}

.qty-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.cart-item__subtotal {
  font-weight: 700;
  color: var(--color-primary);
  min-width: 70px;
  text-align: right;
}

.cart-item__remove {
  background: none;
  border: none;
  font-size: 1.4rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s;
}

.cart-item__remove:hover {
  color: var(--color-danger);
}

/* Footer */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid var(--color-border);
}

.cart-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.cart-total__label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cart-total__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* Botones */
.btn {
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--ghost {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.btn--ghost:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
