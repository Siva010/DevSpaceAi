import axios from 'axios';
import { store } from '../store/store';
import { clearAuth } from '../store/store';

// Create a globally configured Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach workspace slug
api.interceptors.request.use(
  (config) => {    // 2. Extract workspace slug from URL (e.g. /workspace/acme/projects -> acme)
    // Note: In a real app we might read this from Redux state instead to be cleaner,
    // but reading from the URL is a bulletproof way to ensure it matches the current page.
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments[1] === 'workspace' && pathSegments[2]) {
      const workspaceSlug = pathSegments[2];
      config.headers['x-workspace-slug'] = workspaceSlug;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if the request was to the login endpoint itself,
      // so the login page can handle and display the error inline
      if (!error.config?.url?.includes('/auth/login')) {
        // Clear both Redux store and localStorage (clearAuth handles localStorage)
        store.dispatch(clearAuth());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
