import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // 根据后端实际地址调整
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    throw error;
  }
);

export const login = (payload) => api.post('/auth/login', payload);

export const fetchCourseDailyKpi = (params) => api.get('/kpi/course_daily', { params });

export const fetchVideoRank = (params) => api.get('/rank/videos', { params });

export const fetchScoreDist = (params) => api.get('/kpi/score_dist', { params });

export const fetchUserProfile = (params) => api.get('/user/profile', { params });

export const createReport = (payload) => api.post('/reports/create', payload);

export const fetchReportList = () => api.get('/reports/list');

export default api;

