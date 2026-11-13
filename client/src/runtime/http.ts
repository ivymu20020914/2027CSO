import axios from 'axios';

export const axiosForBackend = axios.create({
  baseURL: '/',
  timeout: 20_000,
  headers: { Accept: 'application/json', 'X-CSO-Request': '1' },
});

axiosForBackend.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !String(error.config?.url).startsWith('/api/auth/')) {
    window.dispatchEvent(new Event('cso-session-expired'));
  }
  return Promise.reject(error);
});
