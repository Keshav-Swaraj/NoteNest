import axios from 'axios'

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api`, timeout: 10000 })

export const notesApi = {
  list: params => api.get('/notes', { params }).then(r => r.data),
  get: id => api.get(`/notes/${id}`).then(r => r.data),
  create: data => api.post('/notes', data).then(r => r.data),
  update: (id, data) => api.put(`/notes/${id}`, data).then(r => r.data),
  remove: id => api.delete(`/notes/${id}`),
  pin: id => api.patch(`/notes/${id}/pin`).then(r => r.data),
  archive: id => api.patch(`/notes/${id}/archive`).then(r => r.data),
  stats: () => api.get('/notes/stats').then(r => r.data),
  categories: () => api.get('/categories').then(r => r.data),
  tags: () => api.get('/tags').then(r => r.data)
}

export function errorMessage(error) {
  if (error.response?.data?.fields) return Object.values(error.response.data.fields).join(' · ')
  return error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The server took too long to respond.' : 'Could not reach the server. Check that the backend and MySQL are running.')
}
