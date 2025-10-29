const API_BASE ='http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if(token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(()=> null);
  if(!res.ok) throw { status: res.status, data };
  return data;
}

export const auth = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) })
};

export const events = {
  list: () => request('/events'),
  create: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/events/${id}`, { method: 'DELETE' })
};

export const swaps = {
  listSwappable: () => request('/swappable-slots'),
  createRequest: (body) => request('/swap-request', { method: 'POST', body: JSON.stringify(body) }),
  respond: (id, body) => request(`/swap-response/${id}`, { method: 'POST', body: JSON.stringify(body) }),
  getRequests: () => request('/requests')
};

export function saveToken(token) { localStorage.setItem('token', token); }
export function clearToken() { localStorage.removeItem('token'); }
export function getUserFromToken() {
  // naive: store user separately on login
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch { return null; }
}
export function saveUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
