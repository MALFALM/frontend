import { API_URL } from '../config/constants';

const STORAGE_KEY = 'altoque_auth_session';

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading auth session', error);
    return null;
  }
}

export function getAuthToken() {
  return getStoredSession()?.token || null;
}

export async function apiRequest(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error HTTP ${response.status}`);
  }

  return data;
}
