<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { useProducts } from '@/composables/useProducts.js'
import { useCategories } from '@/composables/useCategories.js'
import { useCart } from '@/composables/useCart.js'
import { useCartAlert } from '@/composables/useCartAlert.js'
import { useRecentlyViewed } from '@/composables/useRecentlyViewed.js'
import ProductCard from '@/components/ProductCard.vue'

const swiperModules = [Autoplay, Pagination, Navigation]

const slides = [
  {
    tag: 'Promoción especial',
    title: 'Ofertas de la semana',
    subtitle: 'Hasta 40% de descuento en tecnología y más',
    cta: 'Ver productos',
    ctaQuery: {},
    bg: 'linear-gradient(135deg, #1a0606 0%, #3d0e0e 60%, #5a1010 100%)',
    countdown: true,
  },
  {
    tag: 'Electrónica',
    title: 'Los mejores gadgets',
    subtitle: 'Auriculares, smartwatches y teclados al mejor precio',
    cta: 'Ver electrónica',
    ctaQuery: { categoryId: 1 },
    bg: 'linear-gradient(135deg, #0a1628 0%, #0f2a50 60%, #1a3d6e 100%)',
    countdown: false,
  },
  {
    tag: 'Ropa y calzado',
    title: 'Estilo para cada momento',
    subtitle: 'Camisetas, chaquetas y zapatillas con envío incluido',
    cta: 'Ver ropa',
    ctaQuery: { categoryId: 2 },
    bg: 'linear-gradient(135deg, #0d1f0d 0%, #1a3d1a 60%, #245c24 100%)',
    countdown: false,
  },
  {
    tag: 'Hogar',
    title: 'Equipa tu hogar',
    subtitle: 'Lámparas, sartenes y todo lo que necesitas para tu casa',
    cta: 'Ver hogar',
    ctaQuery: { categoryId: 3 },
    bg: 'linear-gradient(135deg, #1a130a 0%, #3d2e0e 60%, #5a4410 100%)',
    countdown: false,
  },
]

const route = useRoute()
const router = useRouter()

// Products & filters
const { products, loading, error, filters } = useProducts()
const { categories, load: loadCategories } = useCategories()

// Sync URL query params → filters
watch(() => route.query.categoryId, (val) => {
  filters.categoryId = val ?? null
}, { immediate: true })

watch(() => route.query.q, (val) => {
  filters.q = val ?? ''
}, { immediate: true })

// Client-side price filter
const priceMin = ref('')
const priceMax = ref('')

const displayedProducts = computed(() => {
  if (!products.value) return []
  return products.value.filter(p => {
    const minOk = priceMin.value === '' || p.price >= Number(priceMin.value)
    const maxOk = priceMax.value === '' || p.price <= Number(priceMax.value)
    return minOk && maxOk
  })
})

function getCategoryName(product) {
  return categories.value?.find(c => c.id === product.categoryId)?.name ?? ''
}

// Category selection via sidebar
function selectCategory(id) {
  const current = route.query.categoryId ?? null
  const query = { ...route.query }
  if (current === id) {
    delete query.categoryId
  } else {
    query.categoryId = id
  }
  router.push({ path: '/', query })
  sidebarOpen.value = false
}

function clearFilters() {
  priceMin.value = ''
  priceMax.value = ''
  router.push({ path: '/' })
}

const hasActiveFilters = computed(() =>
  route.query.categoryId || priceMin.value !== '' || priceMax.value !== ''
)

// Cart
const { addItem } = useCart()
const { showAddedToCart } = useCartAlert()
function onAddedToCart(product) {
  addItem(product, 1)
  showAddedToCart(product.name)
}

// Sidebar toggle (mobile)
const sidebarOpen = ref(false)

// Countdown timer (offer expires in ~3 days from first visit)
const timerH = ref('00')
const timerM = ref('00')
const timerS = ref('00')
let timerInterval = null

function updateTimer() {
  let target = Number(sessionStorage.getItem('mercapp_offer_end') || 0)
  if (!target) {
    target = Date.now() + 3 * 24 * 60 * 60 * 1000
    sessionStorage.setItem('mercapp_offer_end', String(target))
  }
  const diff = target - Date.now()
  if (diff <= 0) {
    timerH.value = timerM.value = timerS.value = '00'
    return
  }
  timerH.value = String(Math.floor(diff / 3600000)).padStart(2, '0')
  timerM.value = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
  timerS.value = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
}

// Recently viewed
const { recentlyViewed } = useRecentlyViewed()

onMounted(() => {
  loadCategories()
  updateTimer()
  timerInterval = setInterval(updateTimer, 1000)
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<template>
  <div class="home">

    <!-- Carrusel hero -->
    <Swiper
      class="hero-swiper"
      :modules="swiperModules"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      :navigation="true"
      :loop="true"
    >
      <SwiperSlide v-for="(slide, i) in slides" :key="i">
        <div class="hero" :style="{ background: slide.bg }">
          <div class="hero__inner">
            <span class="hero__tag">{{ slide.tag }}</span>
            <h2 class="hero__title">{{ slide.title }}</h2>
            <p class="hero__subtitle">{{ slide.subtitle }}</p>

            <div v-if="slide.countdown" class="hero__countdown">
              <span class="hero__countdown-label">Oferta termina en:</span>
              <div class="hero__timer">
                <span class="hero__timer-block">{{ timerH }}<small>h</small></span>
                <span class="hero__timer-sep">:</span>
                <span class="hero__timer-block">{{ timerM }}<small>m</small></span>
                <span class="hero__timer-sep">:</span>
                <span class="hero__timer-block">{{ timerS }}<small>s</small></span>
              </div>
            </div>

            <RouterLink :to="{ path: '/', query: slide.ctaQuery }" class="hero__cta">
              {{ slide.cta }}
            </RouterLink>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- Layout: filtro lateral + grid -->
    <div class="home__wrapper">

      <!-- Toggle filtros (mobile) -->
      <div class="home__toolbar">
        <button class="filter-toggle-btn" @click="sidebarOpen = !sidebarOpen">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filtros
          <span v-if="hasActiveFilters" class="filter-toggle-btn__dot"></span>
        </button>
        <span class="home__count">{{ displayedProducts.length }} producto{{ displayedProducts.length !== 1 ? 's' : '' }}</span>
        <RouterLink to="/product/new" class="btn-new">+ Nuevo</RouterLink>
      </div>

      <div class="home__layout">

        <!-- Sidebar de filtros -->
        <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
          <div class="sidebar__head">
            <h3 class="sidebar__title">Filtros</h3>
            <button v-if="hasActiveFilters" class="sidebar__clear" @click="clearFilters">Limpiar</button>
          </div>

          <!-- Categoría -->
          <div class="filter-group">
            <h4 class="filter-group__title">Categoría</h4>
            <ul class="filter-group__list">
              <li v-for="cat in categories" :key="cat.id">
                <button
                  class="filter-cat-btn"
                  :class="{ 'filter-cat-btn--active': route.query.categoryId === cat.id }"
                  @click="selectCategory(cat.id)"
                >
                  {{ cat.name }}
                </button>
              </li>
            </ul>
          </div>

          <!-- Rango de precio -->
          <div class="filter-group">
            <h4 class="filter-group__title">Precio</h4>
            <div class="price-range">
              <input
                v-model.number="priceMin"
                type="number"
                min="0"
                placeholder="Mín"
                class="price-range__input"
              />
              <span class="price-range__sep">—</span>
              <input
                v-model.number="priceMax"
                type="number"
                min="0"
                placeholder="Máx"
                class="price-range__input"
              />
            </div>
          </div>
        </aside>

        <!-- Contenido principal -->
        <main class="home__main">
          <p v-if="error" class="feedback feedback--error">{{ error }}</p>

          <template v-else>
            <div v-if="loading" class="feedback">Cargando productos...</div>

            <p v-else-if="!displayedProducts.length" class="feedback">
              No hay productos que coincidan con los filtros.
            </p>

            <div v-else class="products-grid">
              <ProductCard
                v-for="product in displayedProducts"
                :key="product.id"
                :product="product"
                :categoryName="getCategoryName(product)"
                @added-to-cart="onAddedToCart"
              />
            </div>
          </template>
        </main>

      </div>
    </div>

    <!-- Vistos recientemente -->
    <section v-if="recentlyViewed.length" class="recent">
      <div class="recent__inner">
        <h3 class="recent__title">Vistos recientemente</h3>
        <Swiper
          :modules="swiperModules"
          :slides-per-view="2"
          :space-between="12"
          :breakpoints="{ 640: { slidesPerView: 3, spaceBetween: 16 }, 1024: { slidesPerView: 5, spaceBetween: 16 } }"
          :pagination="{ clickable: true }"
          class="recent__swiper"
        >
          <SwiperSlide v-for="p in recentlyViewed" :key="p.id">
            <RouterLink :to="`/product/${p.id}`" class="recent__item">
              <img
                :src="p.imageUrl || 'https://placehold.co/80x80?text=?'"
                :alt="p.name"
                class="recent__img"
              />
              <span class="recent__name">{{ p.name }}</span>
              <span class="recent__price">${{ p.price.toFixed(2) }}</span>
            </RouterLink>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>

  </div>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 120px);
}

/* ── Swiper hero ──────────────────────────────────── */
.hero-swiper {
  width: 100%;
}

/* flechas de navegacion */
.hero-swiper :deep(.swiper-button-next),
.hero-swiper :deep(.swiper-button-prev) {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}

.hero-swiper :deep(.swiper-button-next:hover),
.hero-swiper :deep(.swiper-button-prev:hover) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.08);
}

.hero-swiper :deep(.swiper-button-next::after),
.hero-swiper :deep(.swiper-button-prev::after) {
  font-size: 0.85rem;
  font-weight: 900;
}

/* ocultar flechas en móvil */
@media (max-width: 639px) {
  .hero-swiper :deep(.swiper-button-next),
  .hero-swiper :deep(.swiper-button-prev) {
    display: none;
  }
}

/* puntos de paginacion */
.hero-swiper :deep(.swiper-pagination) {
  bottom: 14px;
}

.hero-swiper :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: rgba(255,255,255,0.45);
  opacity: 1;
  transition: background 0.2s, transform 0.2s, width 0.2s;
  border-radius: 999px;
}

.hero-swiper :deep(.swiper-pagination-bullet-active) {
  background: #fff;
  width: 24px;
  transform: none;
}

/* ── Hero slide ───────────────────────────────────── */
.hero {
  color: #fff;
  padding: 72px 24px 80px;
  text-align: center;
}

.hero__inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.hero__tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-primary);
  background: rgba(232, 40, 46, 0.15);
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid rgba(232, 40, 46, 0.3);
}

.hero__title {
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hero__subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.7);
}

.hero__countdown {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.hero__countdown-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
}

.hero__timer {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hero__timer-block {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  min-width: 52px;
  text-align: center;
}

.hero__timer-block small {
  font-size: 0.6rem;
  font-weight: 500;
  opacity: 0.7;
  margin-left: 2px;
}

.hero__timer-sep {
  font-size: 1.4rem;
  font-weight: 300;
  opacity: 0.5;
}

.hero__cta {
  display: inline-block;
  margin-top: 8px;
  padding: 13px 36px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: background 0.15s, transform 0.1s;
}

.hero__cta:hover {
  background: var(--color-primary-dark);
  transform: scale(1.03);
}

/* ── Wrapper ──────────────────────────────────────── */
.home__wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 12px 48px;
}

@media (min-width: 640px) {
  .home__wrapper {
    padding: 24px 24px 48px;
  }
}

/* Toolbar (mobile) */
.home__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s;
}

.filter-toggle-btn:hover {
  border-color: var(--color-primary);
}

.filter-toggle-btn__dot {
  width: 7px;
  height: 7px;
  background: var(--color-primary);
  border-radius: 50%;
  position: absolute;
  top: 4px;
  right: 4px;
}

.home__count {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-left: auto;
}

.btn-new {
  flex-shrink: 0;
  padding: 8px 18px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 999px;
  font-size: 0.825rem;
  font-weight: 700;
  transition: background 0.15s;
}

.btn-new:hover {
  background: var(--color-primary-dark);
}

/* ── Layout sidebar + main ────────────────────────── */
.home__layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* ── Sidebar ──────────────────────────────────────── */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: none; /* hidden on mobile by default */
}

@media (min-width: 768px) {
  .sidebar {
    display: block;
  }
  .filter-toggle-btn {
    display: none;
  }
}

.sidebar--open {
  display: block !important;
  width: 100%;
  margin-bottom: 16px;
}

@media (max-width: 767px) {
  .home__layout {
    flex-direction: column;
  }
  .sidebar--open {
    width: 100%;
  }
}

.sidebar__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sidebar__title {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text);
}

.sidebar__clear {
  font-size: 0.75rem;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.sidebar__clear:hover {
  text-decoration: underline;
}

/* Filter groups */
.filter-group {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.filter-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-group__title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.filter-group__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-cat-btn {
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  border: none;
  border-radius: var(--radius);
  background: none;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.filter-cat-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.filter-cat-btn--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 700;
}

/* Price range */
.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-range__input {
  flex: 1;
  padding: 7px 10px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.85rem;
  background: var(--color-bg);
  color: var(--color-text);
  outline: none;
  min-width: 0;
  transition: border-color 0.15s;
}

.price-range__input:focus {
  border-color: var(--color-primary);
}

.price-range__sep {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  flex-shrink: 0;
}

/* ── Main grid ────────────────────────────────────── */
.home__main {
  flex: 1;
  min-width: 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}

.feedback {
  text-align: center;
  padding: 64px 0;
  color: var(--color-text-muted);
  font-size: 1rem;
}

.feedback--error {
  color: var(--color-danger);
}

/* ── Vistos recientemente ─────────────────────────── */
.recent {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 32px 0;
}

.recent__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.recent__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.recent__swiper {
  padding-bottom: 28px !important;
}

.recent__swiper :deep(.swiper-pagination-bullet) {
  background: var(--color-border);
  opacity: 1;
}

.recent__swiper :deep(.swiper-pagination-bullet-active) {
  background: var(--color-primary);
}

.recent__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: border-color 0.15s, transform 0.15s;
}

.recent__item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.recent__img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: var(--radius);
}

.recent__name {
  font-size: 0.75rem;
  color: var(--color-text);
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.recent__price {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
