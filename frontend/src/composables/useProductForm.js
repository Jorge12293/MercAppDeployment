import { reactive, computed } from 'vue'

function isValidUrl(str) {
  if (!str.trim()) return true // campo opcional
  try {
    new URL(str.trim())
    return true
  } catch {
    return false
  }
}

export function useProductForm() {
  const form = reactive({
    name: '',
    description: '',
    price: null,
    categoryId: null,
    stock: 0,
    imageUrl: ''
  })

  // Registra qué campos tocó el usuario para mostrar errores solo en ellos
  const touched = reactive({
    name: false,
    description: false,
    price: false,
    categoryId: false,
    stock: false,
    imageUrl: false
  })

  const errors = computed(() => {
    const e = {}

    if (!form.name?.trim()) {
      e.name = 'El nombre es obligatorio'
    }

    const price = Number(form.price)
    if (form.price === null || form.price === '' || isNaN(price) || price <= 0) {
      e.price = 'Debe ser un número mayor a 0'
    }

    if (!form.categoryId) {
      e.categoryId = 'La categoría es obligatoria'
    }

    const stock = Number(form.stock)
    if (form.stock === null || form.stock === '' || !Number.isInteger(stock) || stock < 0) {
      e.stock = 'Debe ser un entero no negativo'
    }

    if (!isValidUrl(form.imageUrl)) {
      e.imageUrl = 'La URL de imagen no es válida'
    }

    return e
  })

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  // Muestra el error de un campo solo si fue tocado
  function fieldError(field) {
    return touched[field] ? errors.value[field] : undefined
  }

  function touch(field) {
    touched[field] = true
  }

  // Marca todos los campos como tocados (al intentar enviar el formulario)
  function touchAll() {
    Object.keys(touched).forEach(k => { touched[k] = true })
  }

  // Carga datos de un producto existente (modo edición)
  function populate(product) {
    Object.assign(form, {
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? null,
      categoryId: product.categoryId ?? null,
      stock: product.stock ?? 0,
      imageUrl: product.imageUrl ?? ''
    })
  }

  // Devuelve el payload limpio para enviar al API
  function toPayload() {
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      categoryId: Number(form.categoryId),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim()
    }
  }

  return { form, errors, isValid, touch, touchAll, fieldError, populate, toPayload }
}
