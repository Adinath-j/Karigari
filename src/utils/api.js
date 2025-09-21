import axios from 'axios';

// Determine backend URL based on environment
const backendURL =
  process.env.NODE_ENV === 'production'
    ? 'https://karigari-2xcq.onrender.com/api' // Your deployed backend on Render
    : 'http://localhost:10000/api'; // Local development backend

// Create Axios instance
const apiClient = axios.create({
  baseURL: backendURL,
  withCredentials: true, // Include cookies for session-based auth
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Development request logging
if (process.env.NODE_ENV !== 'production') {
  apiClient.interceptors.request.use(request => {
    console.log('%c[API Request]', 'color: blue; font-weight: bold;', request);
    return request;
  });
}

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Extract meaningful error message
    const errorMessage = error.response?.data?.error || error.message;

    // Handle different HTTP status codes
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
