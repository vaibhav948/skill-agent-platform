import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const skillApi = {
  getAll: () => api.get('/api/skills'),
  getPublished: () => api.get('/api/skills/published'),
  get: (id) => api.get(`/api/skills/${id}`),
  create: (data) => api.post('/api/skills', data),
  update: (id, data) => api.put(`/api/skills/${id}`, data),
  delete: (id) => api.delete(`/api/skills/${id}`),
  publish: (id) => api.post(`/api/skills/${id}/publish`),
  getVersions: (id) => api.get(`/api/skills/${id}/versions`), // ✅ NEW
};

// Executions API

export const executionApi = {
  create: (data) => api.post('/api/executions', {
    skill_id: data.skill_id,
    skill_version: data.skill_version || 1,  // ✅ Added skill_version
    input_data: data.input_data
  }),
  getAll: (skillId) => api.get('/api/executions', { params: { skill_id: skillId } }),
  get: (id) => api.get(`/api/executions/${id}`),
  approve: (id, stepId, approved) => 
    api.post(`/api/executions/${id}/approve`, { step_id: stepId, approved }),
  cancel: (id) => api.post(`/api/executions/${id}/cancel`),
};

// Tools API
export const toolApi = {
  getAll: () => api.get('/api/tools'),
  get: (name) => api.get(`/api/tools/${name}`),
};

export default api;