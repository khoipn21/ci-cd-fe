import axios from 'axios';

console.log('[API] Initializing API client...');
console.log('[API] Base URL:', import.meta.env.VITE_API_URL);
console.log('[API] Environment:', import.meta.env.MODE);
console.log('[API] All env vars:', import.meta.env);

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[API] Request interceptor:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      headers: config.headers
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response success:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      dataPreview: typeof response.data === 'object' ? Object.keys(response.data) : response.data
    });
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    if (error.response?.status === 401) {
      console.log('[API] Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('token');
      
      // Optionally redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        console.log('[API] Redirecting to login from:', window.location.pathname);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;