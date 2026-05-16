<script setup>
import { useCart } from '@/composables/useCart.js'

const { itemCount } = useCart()
</script>

<template>
  <nav class="app-nav">
    <RouterLink to="/" class="app-nav__brand">MercApp</RouterLink>
    <div class="app-nav__links">
      <RouterLink to="/" class="app-nav__link">Catálogo</RouterLink>
      <RouterLink to="/about" class="app-nav__link">Acerca de</RouterLink>
      <RouterLink to="/cart" class="app-nav__cart">
        <svg class="app-nav__cart-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span v-if="itemCount" class="app-nav__badge">{{ itemCount }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-nav__brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.app-nav__links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.app-nav__link {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  transition: color 0.15s;
}

.app-nav__link:hover,
.app-nav__link.router-link-active {
  color: var(--color-primary);
}

.app-nav__cart {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  transition: color 0.15s;
}

.app-nav__cart:hover,
.app-nav__cart.router-link-active {
  color: var(--color-primary);
}

.app-nav__cart-icon {
  display: block;
}

.app-nav__badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--color-danger);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>
