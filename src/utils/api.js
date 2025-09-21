import axios from 'axios';

// Use Vite environment variable (must be defined in .env or Vercel dashboard)
const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

// Create Axios instance
const apiClient = axios.create({
  baseURL: backendURL,
  withCredentials: true, // Include cookies for session-based auth
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Log requests in development only
if (import.meta.env.MODE !== 'production') {
  apiClient.interceptors.request.use(request => {
    console.log('%c[API Request]', 'color: blue; font-weight: bold;', request);
    return request;
  });
}

// Handle responses & errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || error.message;

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Authentication required:', error.config.url);
          break;
        case 403:
          alert("You don't have permission to perform this action");
          break;
        case 404:
          console.error('Resource not found:', error.config.url);
          break;
        default:
          if (error.response.status >= 500) {
            alert('Server error. Please try again later.');
          } else {
            console.warn('API Warning:', errorMessage);
          }
      }
    } else {
      // Network or CORS errors
      alert('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
