const BASE_URL = '/api'

async function request(path, { signal, ...options } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    signal,
    ...options
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Error ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  categories: {
    list: (signal) => request('/categories', { signal })
  },
  products: {
    list: (params = {}, signal) => {
      const query = new URLSearchParams(params).toString()
      return request(`/products${query ? `?${query}` : ''}`, { signal })
    },
    get: (id, signal) => request(`/products/${id}`, { signal }),
    create: (data) =>
      request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  cart: {
    get: () => request('/cart'),
    addItem: (productId, quantity = 1) =>
      request('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      }),
    updateItem: (productId, quantity) =>
      request(`/cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      }),
    removeItem: (productId) =>
      request(`/cart/items/${productId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' })
  }
}
