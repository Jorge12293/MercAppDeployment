<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/index.js'
import { useProductForm } from '@/composables/useProductForm.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'product-edit')
const pageTitle = computed(() => isEdit.value ? 'Editar Producto' : 'Nuevo Producto')

const categories = ref([])
const loading = ref(false)
const submitting = ref(false)
const submitError = ref(null)

const { form, isValid, touch, touchAll, fieldError, populate, toPayload } = useProductForm()

onMounted(async () => {
  loading.value = true
  try {
    const fetches = [api.categories.list()]
    if (isEdit.value) fetches.push(api.products.get(route.params.id))

    const [cats, product] = await Promise.all(fetches)
    categories.value = cats
    if (product) populate(product)
  } catch (err) {
    submitError.value = err.message
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  touchAll()
  if (!isValid.value) return

  submitting.value = true
  submitError.value = null
  try {
    const payload = toPayload()
    if (isEdit.value) {
      await api.products.update(route.params.id, payload)
      router.push({ name: 'product-detail', params: { id: route.params.id } })
    } else {
      const created = await api.products.create(payload)
      router.push({ name: 'product-detail', params: { id: created.id } })
    }
  } catch (err) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="form-page">
    <RouterLink to="/" class="back-link">← Volver al catálogo</RouterLink>

    <h1 class="form-page__title">{{ pageTitle }}</h1>

    <div v-if="loading" class="feedback">Cargando...</div>

    <form v-else class="product-form" novalidate @submit.prevent="handleSubmit">

      <!-- Nombre -->
      <div class="field" :class="{ 'field--error': fieldError('name') }">
        <label class="field__label" for="name">Nombre *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="field__input"
          placeholder="Nombre del producto"
          @blur="touch('name')"
        />
        <span v-if="fieldError('name')" class="field__error">{{ fieldError('name') }}</span>
      </div>

      <!-- Descripción -->
      <div class="field">
        <label class="field__label" for="description">Descripción</label>
        <textarea
          id="description"
          v-model="form.description"
          class="field__input field__textarea"
          placeholder="Descripción del producto"
          rows="3"
          @blur="touch('description')"
        />
      </div>

      <!-- Precio y Stock en fila -->
      <div class="field-row">
        <div class="field" :class="{ 'field--error': fieldError('price') }">
          <label class="field__label" for="price">Precio * ($)</label>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            class="field__input"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            @blur="touch('price')"
          />
          <span v-if="fieldError('price')" class="field__error">{{ fieldError('price') }}</span>
        </div>

        <div class="field" :class="{ 'field--error': fieldError('stock') }">
          <label class="field__label" for="stock">Stock *</label>
          <input
            id="stock"
            v-model.number="form.stock"
            type="number"
            class="field__input"
            placeholder="0"
            min="0"
            step="1"
            @blur="touch('stock')"
          />
          <span v-if="fieldError('stock')" class="field__error">{{ fieldError('stock') }}</span>
        </div>
      </div>

      <!-- Categoría -->
      <div class="field" :class="{ 'field--error': fieldError('categoryId') }">
        <label class="field__label" for="category">Categoría *</label>
        <select
          id="category"
          v-model.number="form.categoryId"
          class="field__input field__select"
          @blur="touch('categoryId')"
          @change="touch('categoryId')"
        >
          <option :value="null" disabled>Seleccionar categoría...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <span v-if="fieldError('categoryId')" class="field__error">{{ fieldError('categoryId') }}</span>
      </div>

      <!-- URL de imagen -->
      <div class="field" :class="{ 'field--error': fieldError('imageUrl') }">
        <label class="field__label" for="imageUrl">URL de imagen</label>
        <input
          id="imageUrl"
          v-model="form.imageUrl"
          type="url"
          class="field__input"
          placeholder="https://ejemplo.com/imagen.jpg"
          @blur="touch('imageUrl')"
        />
        <span v-if="fieldError('imageUrl')" class="field__error">{{ fieldError('imageUrl') }}</span>
      </div>

      <!-- Preview de imagen -->
      <div v-if="form.imageUrl && !fieldError('imageUrl')" class="img-preview">
        <img :src="form.imageUrl" alt="Preview" />
      </div>

      <p v-if="submitError" class="feedback feedback--error">{{ submitError }}</p>

      <div class="form-actions">
        <RouterLink
          :to="isEdit ? `/product/${route.params.id}` : '/'"
          class="btn btn--secondary"
        >
          Cancelar
        </RouterLink>
        <button type="submit" class="btn btn--primary" :disabled="submitting">
          {{ submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
}

.back-link {
  display: inline-block;
  font-size: 0.9rem;
  color: var(--color-primary);
  margin-bottom: 20px;
}

.back-link:hover {
  text-decoration: underline;
}

.form-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 28px;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.field__input {
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.field__input:focus {
  border-color: var(--color-primary);
}

.field--error .field__input {
  border-color: var(--color-danger);
}

.field__textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.field__select {
  cursor: pointer;
}

.field__error {
  font-size: 0.8rem;
  color: var(--color-danger);
}

.img-preview {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  max-height: 180px;
}

.img-preview img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn {
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn--primary:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.feedback {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-muted);
}

.feedback--error {
  padding: 0;
  text-align: left;
  color: var(--color-danger);
  font-size: 0.9rem;
}
</style>
