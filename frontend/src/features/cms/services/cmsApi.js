/* global process, window, localStorage */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'
const TOKEN_KEY = 'omnicontact_cms_token'

function getApiBase() {
  if (typeof window === 'undefined') {
    return API_BASE_URL
  }

  const configured = new URL(API_BASE_URL)
  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

  if (isLocalHost && ['localhost', '127.0.0.1'].includes(configured.hostname)) {
    configured.hostname = window.location.hostname
  }

  return configured.origin
}

function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function clearCmsToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.ok === false) {
    const message = payload?.error?.message || payload?.error || payload?.message || 'The CMS request failed.'
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload?.data ?? payload
}

async function apiRequest(path, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    cache: 'no-store',
    ...options,
    headers,
  })

  return parseResponse(response)
}

export async function adminLogin(email, password, remember = true) {
  const data = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, remember }),
  })

  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, data.token)
  }

  return data
}

export async function adminLogout() {
  clearCmsToken()
  return { success: true }
}

export async function fetchCurrentAdmin() {
  const data = await apiRequest('/api/v1/auth/me')
  return data.admin
}

export async function fetchAdminBlogs() {
  const data = await apiRequest('/api/v1/admin/posts')
  return data.posts || []
}

export function createAdminBlog(payload) {
  return apiRequest('/api/v1/admin/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminBlog(id, payload) {
  return apiRequest(`/api/v1/admin/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminBlog(id) {
  return apiRequest(`/api/v1/admin/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function approveBlog(id, action) {
  return apiRequest(`/api/v1/admin/posts/${encodeURIComponent(id)}/approval`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
}

export async function uploadBlogImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const data = await apiRequest('/api/v1/admin/media', {
    method: 'POST',
    body: formData,
  })

  return data
}

export async function fetchUsers() {
  const data = await apiRequest('/api/v1/admin/users')
  return data.users || []
}

export function createUser(payload) {
  return apiRequest('/api/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUser(id, payload) {
  return apiRequest(`/api/v1/admin/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteUser(id) {
  return apiRequest(`/api/v1/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function fetchSocialDashboard() {
  return apiRequest('/api/v1/admin/social/dashboard')
}

export function checkSocialNames(names) {
  return apiRequest('/api/v1/admin/social/check-names', {
    method: 'POST',
    body: JSON.stringify({ names }),
  })
}
