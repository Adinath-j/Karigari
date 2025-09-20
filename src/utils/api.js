import axios from 'axios';

// Create an instance with default settings
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'your-backend-domain.com/api' 
    : '/api', // Use relative path for Vite proxy in development
  withCredentials: true, // Important for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
    // Accept header for API versioning if needed in the future
    'Accept': 'application/json',
  },
});

// Add a request interceptor to log requests in development
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
  });
}

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || error.message;
    
    // Show user-friendly error messages
    if (error.response?.status === 401) {
      console.error('Authentication required:', error.config.url);
      // In a real app, you would redirect to login page
      // window.location.href = '/login';
    } else if (error.response?.status === 403) {
      alert("You don't have permission to perform this action");
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.config.url);
      // Don't show alert for 404 errors
      // alert('Resource not found');
    } else if (error.response?.status >= 500) {
      alert('Server error. Please try again later.');
    } else if (!error.response) {
      alert('Network error. Please check your internet connection.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;