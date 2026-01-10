import api from './api';

export const taskService = {
  getAll: (projectId) => api.get('/tasks', { params: { project_id: projectId } }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (task) => api.post('/tasks', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
};

