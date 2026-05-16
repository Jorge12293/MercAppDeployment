import { reactive, watch } from 'vue'
import { useApi } from './useApi.js'
import { api } from '@/api/index.js'

/**
 * Composable específico para el catálogo de productos.
 * Gestiona búsqueda y filtro por categoría de forma reactiva.
 */
export function useProducts() {
  const filters = reactive({ q: '', categoryId: null })

  const { data, loading, error, execute } = useApi((signal) => {
    const params = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.categoryId !== null) params.categoryId = filters.categoryId
    return api.products.list(params, signal)
  })

  // Cualquier cambio en filters lanza una nueva petición (cancela la anterior)
  watch(filters, () => execute(), { immediate: true, deep: true })

  function toggleCategory(id) {
    filters.categoryId = filters.categoryId === id ? null : id
  }

  return {
    products: data,
    loading,
    error,
    filters,          // reactive — v-model directo desde el template
    toggleCategory,
    reload: () => execute()
  }
}
