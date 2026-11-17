/* global process */

// In the browser, call the API on the site the visitor is on, so staging
// posts to staging and live to live (a cross-site call is blocked by CORS).
// The configured base URL is only used outside the browser.
const API_BASE_URL = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL || '' : ''

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
  return request('/api/v1/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function submitAssessment(payload) {
  return request('/api/v1/assessment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
