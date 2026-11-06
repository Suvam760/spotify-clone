// Resolve the API base URL:
// 1. Checks VITE_API_BASE_URL (e.g. https://your-backend.vercel.app)
// 2. Checks window.__NEXA_API_URL__ (runtime configuration override)
// 3. Defaults to relative /api (works automatically when deployed together on Vercel or locally)
const rawBase = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.__NEXA_API_URL__) ||
  ''
).trim().replace(/\/$/, '');

export function apiUrl(path) {
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${rawBase}${route}`;
}

export function getApiBaseUrl() {
  return rawBase || (typeof window !== 'undefined' ? window.location.origin : '');
}

/**
 * Fetch with automatic 1-retry for serverless cold-starts & transient network drops
 */
async function fetchWithRetry(url, options = {}, retries = 1, delayMs = 700) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      // If serverless is waking up (502/503/504 gateway timeout), wait and retry once
      if (attempt < retries && (response.status === 502 || response.status === 503 || response.status === 504)) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      return response;
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
}

export async function apiGet(path, options = {}) {
  let response;
  try {
    response = await fetchWithRetry(apiUrl(path), options);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('Could not reach the music API. Check that the Vercel backend is online.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The music API returned an unexpected response format.');
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }
  return payload;
}

export async function apiPost(path, body = {}, options = {}) {
  let response;
  try {
    response = await fetchWithRetry(apiUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: JSON.stringify(body),
      ...options
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('Could not reach the authentication API. Check that the backend is online.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The authentication API returned an unexpected response format.');
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }
  return payload;
}

export async function checkApiHealth() {
  try {
    const data = await apiGet('/api/health');
    return { online: true, ...data };
  } catch (err) {
    return { online: false, message: err.message };
  }
}
