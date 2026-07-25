import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach authorization token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified Error Handling Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected API error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Demo auto-login helper to ensure zero-friction user experience
export const ensureDemoAuth = async () => {
  let token = localStorage.getItem('devforge_token');
  if (token) return token;

  try {
    const res = await axios.post('/api/auth/login', {
      email: 'demo@devforge.ai',
      password: 'password123'
    });
    if (res.data?.token) {
      localStorage.setItem('devforge_token', res.data.token);
      return res.data.token;
    }
  } catch (err) {
    // Register if login fails
    try {
      const regRes = await axios.post('/api/auth/register', {
        full_name: 'Demo Architect',
        email: 'demo@devforge.ai',
        password: 'password123',
        confirm_password: 'password123'
      });
      if (regRes.data?.token) {
        localStorage.setItem('devforge_token', regRes.data.token);
        return regRes.data.token;
      }
    } catch (e) {
      console.warn('Auto auth registration fallback handled:', e.message);
    }
  }
  return null;
};

export const projectApi = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  duplicateProject: (id) => api.post(`/projects/${id}/duplicate`),
  deleteProject: (id) => api.delete(`/projects/${id}`)
};

export const databaseApi = {
  analyzeRequirement: (data) => api.post('/database/analyze', data),
  saveEntities: (data) => api.post('/database/save-entities', data),
  saveRelationships: (data) => api.post('/database/save-relationships', data),
  generateSchema: (data) => api.post('/database/generate-schema', data),
  generateSql: (data) => api.post('/database/generate-sql', data),
  validateSchema: (data) => api.post('/database/validate', data),
  safeAutoFix: (data) => api.post('/database/safe-autofix', data),
  reviewAi: (data) => api.post('/database/review-ai', data),
  getIndexRecommendations: (projectId) => api.get(`/database/indexes/${projectId}`)
};

export const versionApi = {
  getVersions: (projectId) => api.get(`/versions/${projectId}`),
  createVersion: (projectId) => api.post(`/versions/${projectId}`),
  compareVersions: (projectId, v1, v2) => api.get(`/versions/${projectId}/compare?v1=${v1}&v2=${v2}`),
  restoreVersion: (projectId, versionNumber) => api.post(`/versions/${projectId}/restore/${versionNumber}`)
};

export default api;
