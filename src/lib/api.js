const BASE = import.meta.env.VITE_API_URL || 'https://agileback-production-kny7qd.laravel.cloud/api'

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.message || `HTTP ${res.status}`), { status: res.status, data })
  return data
}

function qs(params) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') p.append(k, v)
  const s = p.toString()
  return s ? '?' + s : ''
}

export const api = {
  // Public
  articles: (params = {}) => request('GET', '/articles' + qs(params)),
  products: (params = {}) => request('GET', '/products' + qs(params)),
  featured: ()             => request('GET', '/featured'),

  // Admin — all open, protected only by the frontend login guard
  admin: {
    articles:      (params = {}) => request('GET',    '/admin/articles' + qs(params)),
    createArticle: (data)         => request('POST',   '/admin/articles', data),
    updateArticle: (id, data)     => request('PUT',    `/admin/articles/${id}`, data),
    deleteArticle: (id)           => request('DELETE', `/admin/articles/${id}`),

    products:      (params = {}) => request('GET',    '/admin/products' + qs(params)),
    createProduct: (data)         => request('POST',   '/admin/products', data),
    updateProduct: (id, data)     => request('PUT',    `/admin/products/${id}`, data),
    deleteProduct: (id)           => request('DELETE', `/admin/products/${id}`),

    featured:       ()            => request('GET',    '/admin/featured'),
    createFeatured: (data)        => request('POST',   '/admin/featured', data),
    updateFeatured: (id, data)    => request('PUT',    `/admin/featured/${id}`, data),
    deleteFeatured: (id)          => request('DELETE', `/admin/featured/${id}`),
    reorderFeatured:(order)       => request('PUT',    '/admin/featured-reorder', { order }),

    imports:        ()            => request('GET',  '/admin/imports'),
    importSubstack: ()            => request('POST', '/admin/imports/substack'),
    importPayhip:   ()            => request('POST', '/admin/imports/payhip'),
  },
}
