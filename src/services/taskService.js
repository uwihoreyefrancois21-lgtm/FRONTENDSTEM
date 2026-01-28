// import api from './api';

// export const taskService = {
//   getAll: (projectId, month, year) => {
//     const params = {};
//     if (projectId) params.project_id = projectId;
//     if (month) params.month = month;
//     if (year) params.year = year;
//     return api.get('/tasks', { params });
//   },
//   getById: (id) => api.get(`/tasks/${id}`),
//   create: (task) => api.post('/tasks', task),
//   update: (id, task) => api.put(`/tasks/${id}`, task),
//   delete: (id) => api.delete(`/tasks/${id}`),
// };
// c:\Users\uwiho\Documents\SPEMSFRONTEND\my-react-app\src\services\taskService.js
import api from './api';

export const taskService = {
  getAll: (projectId, month, year, startDate, endDate) => {
    const params = { project_id: projectId };
    // Date range takes priority over month/year
    if (startDate && endDate) {
      params.start_date = startDate;
      params.end_date = endDate;
    } else if (startDate) {
      params.start_date = startDate;
    } else if (endDate) {
      params.end_date = endDate;
    } else {
      // Use month/year if date range not provided
      if (month) params.month = month;
      if (year) params.year = year;
    }
    return api.get('/tasks', { params });
  },
  getById: (id) => api.get(`/tasks/${id}`),
  create: (task) => api.post('/tasks', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
};
