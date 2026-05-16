import { createRouter, createWebHistory } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import HomeView from '@/views/HomeView.vue'

// defineAsyncComponent: carga explícitamente diferida con control fino del ciclo de vida
const CartView = defineAsyncComponent(() => import('@/views/CartView.vue'))
const AboutView = defineAsyncComponent(() => import('@/views/AboutView.vue'))

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // eager: es la ruta inicial, no tiene sentido diferirla
  },
  // /product/new DEBE ir antes de /product/:id para no ser capturado como id
  {
    path: '/product/new',
    name: 'product-new',
    component: () => import('@/views/ProductFormView.vue')
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue')
  },
  {
    path: '/product/:id/edit',
    name: 'product-edit',
    component: () => import('@/views/ProductFormView.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView // defineAsyncComponent
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView // defineAsyncComponent
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
