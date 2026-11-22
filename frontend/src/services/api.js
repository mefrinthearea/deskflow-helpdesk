/** Same-origin requests are forwarded by the Vite development proxy to Express. */
export async function api(path, { method = 'GET', body, ...options } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      method,
      credentials: 'same-origin',
      headers: body === undefined ? options.headers : {
        'Content-Type': 'application/json', ...options.headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error('Cannot reach DeskFlow API. Check that Express is running on port 3000.');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(result?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return result;
}

export const authApi = {
  me: () => api('/auth/me'),
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => api('/auth/register', { method: 'POST', body: { name, email, password } }),
  logout: () => api('/auth/logout', { method: 'POST' }),
};

export const ticketApi = {
  list: () => api('/tickets'),
  get: (id) => api(`/tickets/${id}`),
  create: (data) => api('/tickets', { method: 'POST', body: data }),
  update: (id, data) => api(`/tickets/${id}`, { method: 'PUT', body: data }),
  remove: (id) => api(`/tickets/${id}`, { method: 'DELETE' }),
  reply: (id, text) => api(`/tickets/${id}/comments`, { method: 'POST', body: { body: text } }),
  editComment: (id, text) => api(`/comments/${id}`, { method: 'PUT', body: { body: text } }),
  deleteComment: (id) => api(`/comments/${id}`, { method: 'DELETE' }),
};
