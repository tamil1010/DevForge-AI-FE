import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
    if (error.response?.status === 401) {
      localStorage.removeItem('devforge_token');
    }
    const message = error.response?.data?.message || error.message || 'An unexpected API error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Demo auto-login helper to ensure zero-friction user experience
export const ensureDemoAuth = async () => {
  let token = localStorage.getItem('devforge_token');
  if (token) {
    try {
      await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      return token;
    } catch (e) {
      localStorage.removeItem('devforge_token');
    }
  }

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'demo@devforge.ai',
      password: 'password123'
    });
    const authToken = res.data?.token || res.token;
    if (authToken) {
      localStorage.setItem('devforge_token', authToken);
      return authToken;
    }
  } catch (err) {
    // Register if login fails
    try {
      const regRes = await axios.post(`${API_BASE_URL}/auth/register`, {
        full_name: 'Demo Architect',
        email: 'demo@devforge.ai',
        password: 'password123',
        confirm_password: 'password123'
      });
      const authToken = regRes.data?.token || regRes.token;
      if (authToken) {
        localStorage.setItem('devforge_token', authToken);
        return authToken;
      }
    } catch (e) {
      console.warn('Auto auth registration fallback handled:', e.message);
    }
  }
  return localStorage.getItem('devforge_token');
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
  chatAi: (data) => api.post('/database/review-ai', data),
  modifyAi: (data) => api.post('/database/modify-ai', data),
  getModifyDiff: (projectId) => api.get(`/database/modify-diff/${projectId}`),
  getAiReviews: (projectId) => api.get(`/database/ai-reviews/${projectId}`),
  getAiChatHistory: (projectId) => api.get(`/database/ai-reviews/${projectId}`),
  deleteAiReview: (id) => api.delete(`/database/ai-reviews/${id}`),
  deleteAiChatHistory: (id) => api.delete(`/database/ai-reviews/${id}`),
  clearAiReviews: (projectId) => api.delete(`/database/ai-reviews/clear/${projectId}`),
  clearAiChatHistory: (projectId) => api.delete(`/database/ai-reviews/clear/${projectId}`),
  getIndexRecommendations: (projectId) => api.get(`/database/indexes/${projectId}`),
  saveIndexState: (data) => api.post('/database/indexes/save', data),
  runAiIndexAnalysis: (data) => api.post('/database/indexes/analyze-ai', data)
};

export const versionApi = {
  getVersions: (projectId) => api.get(`/versions/${projectId}`),
  createVersion: (projectId, data) => api.post(`/versions/${projectId}`, data),
  compareVersions: (projectId, v1, v2) => api.get(`/versions/${projectId}/compare?v1=${v1}&v2=${v2}`),
  restoreVersion: (projectId, versionNumber) => api.post(`/versions/${projectId}/restore/${versionNumber}`),
  deleteVersion: (projectId, versionNumber) => api.delete(`/versions/${projectId}/${versionNumber}`)
};

export const codeProjectApi = {
  analyzeRequirement: (data) => api.post('/code-projects/analyze-requirement', data),
  getCodeByDbProjectId: (dbProjectId) => api.get(`/code-projects/by-db-project/${dbProjectId}`),
  generateForDbProject: (data) => api.post('/code-projects/generate-for-db-project', data),
  getProjects: () => api.get('/code-projects'),
  getProject: (id) => api.get(`/code-projects/${id}`),
  createProject: (data) => api.post('/code-projects', data),
  updateProject: (id, data) => api.put(`/code-projects/${id}`, data),
  deleteProject: (id) => api.delete(`/code-projects/${id}`),
  duplicateProject: (id) => api.post(`/code-projects/${id}/duplicate`),
  saveFile: (id, data) => api.post(`/code-projects/${id}/files`, data),
  importDatabaseSchema: (id, data) => api.post(`/code-projects/${id}/import-database`, data),
  generateCrud: (id, data) => api.post(`/code-projects/${id}/generate-crud`, data),
  generateApi: (id, data) => api.post(`/code-projects/${id}/generate-api`, data),
  generateAuth: (id, data) => api.post(`/code-projects/${id}/generate-auth`, data),
  debugCode: (id, data) => api.post(`/code-projects/${id}/debug`, data),
  modifyCode: (id, data) => api.post(`/code-projects/${id}/modify`, data),
  reviewCode: (id) => api.get(`/code-projects/${id}/review`),
  generateTests: (id) => api.post(`/code-projects/${id}/generate-tests`),
  optimizeCode: (id, data) => api.post(`/code-projects/${id}/optimize`, data),
  explainCode: (id, data) => api.post(`/code-projects/${id}/explain`, data),
  getDocs: (id) => api.get(`/code-projects/${id}/docs`),
  scanSecurity: (id) => api.get(`/code-projects/${id}/security-scan`),
  scanDependencies: (id) => api.get(`/code-projects/${id}/dependencies`),
  getChatHistory: (id) => api.get(`/code-projects/${id}/chats`),
  sendChatMessage: (id, data) => api.post(`/code-projects/${id}/chats`, data),
  getVersions: (id) => api.get(`/code-projects/${id}/versions`),
  createVersion: (id, data) => api.post(`/code-projects/${id}/versions`, data),
  restoreVersion: (id, versionNumber) => api.post(`/code-projects/${id}/versions/${versionNumber}/restore`),
  exportProject: (id) => api.get(`/code-projects/${id}/export`)
};

export default api;
