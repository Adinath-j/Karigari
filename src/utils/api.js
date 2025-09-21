import axios from 'axios';

// Use Vite env variable or fallback to local dev backend
const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

const apiClient = axios.create({
  baseURL: backendURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Log requests in development only
if (import.meta.env.MODE !== 'production') {
  apiClient.interceptors.request.use(req => {
    console.log('%c[API Request]', 'color: blue; font-weight: bold;', req);
    return req;
  });
}

// Response interceptor
apiClient.interceptors.response.use(
  res => res,
  err => {
    const errorMessage = err.response?.data?.error || err.message;

    if (err.response) {
      switch (err.response.status) {
        case 401:
          console.error('Authentication required:', err.config.url);
          break;
        case 403:
          alert("You don't have permission to perform this action");
          break;
        case 404:
          console.error('Resource not found:', err.config.url);
          break;
        default:
          if (err.response.status >= 500) {
            alert('Server error. Please try again later.');
          } else {
            console.warn('API Warning:', errorMessage);
          }
      }
    } else {
      alert('Network error. Please check your connection.');
    }

    return Promise.reject(err);
  }
);

export default apiClient;
