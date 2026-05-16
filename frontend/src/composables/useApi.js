import { ref, onUnmounted } from 'vue'

/**
 * Composable genérico para peticiones asíncronas.
 *
 * @param {Function} fetcher  Función que recibe (...args, signal) y devuelve una Promise.
 * @param {object}   options
 * @param {number}   options.retries  Reintentos tras fallo (default: 1).
 */
export function useApi(fetcher, { retries = 1 } = {}) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  let controller = null

  async function execute(...args) {
    // Cancela la petición anterior si sigue en vuelo
    controller?.abort()
    controller = new AbortController()
    const { signal } = controller

    loading.value = true
    error.value = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        data.value = await fetcher(...args, signal)
        loading.value = false
        return
      } catch (err) {
        // Cancelación voluntaria: no es un error
        if (err.name === 'AbortError') {
          loading.value = false
          return
        }
        // Último intento fallido: exponer el error
        if (attempt === retries) {
          error.value = err.message
        } else {
          // Espera breve antes del reintento
          await new Promise(r => setTimeout(r, 500))
        }
      }
    }

    loading.value = false
  }

  function cancel() {
    controller?.abort()
    controller = null
    loading.value = false
  }

  // Limpia la petición en vuelo cuando el componente se desmonta
  onUnmounted(cancel)

  return { data, loading, error, execute, cancel }
}
