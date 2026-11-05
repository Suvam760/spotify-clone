const configuredBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

export function apiUrl(path) {
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${configuredBase}${route}`;
}

export async function apiGet(path, options = {}) {
  let response;
  try {
    response = await fetch(apiUrl(path), options);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('Could not reach the music server. Check that the backend is running.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The music server returned an invalid response.');
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }
  return payload;
}

export async function apiPost(path, body = {}, options = {}) {
  let response;
  try {
    response = await fetch(apiUrl(path), {
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
    throw new Error('Could not reach the authentication server. Check that the backend is running.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The authentication server returned an invalid response.');
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }
  return payload;
}
