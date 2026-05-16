import { reactive, computed, watch } from 'vue'

const STORAGE_KEY = 'mercapp_cart'

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

// Estado en scope de módulo → singleton compartido por todos los componentes
const items = reactive(loadFromStorage())

// Persiste en localStorage ante cualquier cambio (items o cantidades)
watch(items, () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]))
}, { deep: true })

export function useCart() {
  const itemCount = computed(() =>
    items.reduce((sum, item) => sum + item.quantity, 0)
  )

  const total = computed(() =>
    Number(
      items
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        .toFixed(2)
    )
  )

  function addItem(product, quantity = 1) {
    const existing = items.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.push({ product, quantity })
    }
  }

  function removeItem(productId) {
    const index = items.findIndex(i => i.product.id === productId)
    if (index !== -1) items.splice(index, 1)
  }

  // Si quantity llega a 0 o menos, elimina el item directamente
  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    const item = items.find(i => i.product.id === productId)
    if (item) item.quantity = quantity
  }

  function clearCart() {
    items.splice(0)
  }

  return { items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }
}
