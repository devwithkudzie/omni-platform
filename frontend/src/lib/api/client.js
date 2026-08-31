/* global process */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''
const BLOG_API_BASE_URL = process.env.NEXT_PUBLIC_BLOG_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({
    ok: false,
    data: null,
    error: {
      code: 'INVALID_JSON',
      message: 'The API returned an invalid JSON response.',
    },
  }))

  if (!response.ok || payload.ok === false) {
    throw payload
  }

  return payload
}

export function getHealth() {
  return request('/api/health.php', { cache: 'no-store' })
}

export function submitContact(payload) {
  return request('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function submitAssessment(payload) {
  return request('/api/assessment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchBlogs() {
  const response = await fetch(`${BLOG_API_BASE_URL}/cms/api/blogs.php`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Unable to load latest insights right now.')
  }

  return response.json()
}
