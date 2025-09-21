import axios from 'axios';

const backendURL =
  process.env.NODE_ENV === 'production'
    ? 'https://karigari-2xcq.onrender.com/api' // <-- Replace with your Render backend URL after deploying
    : 'http://localhost:10000/api';

const apiClient = axios.create({
  baseURL: backendURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

if (process.env.NODE_ENV !== 'production') {
  apiClient.interceptors.request.use(request => {
    console.log('Request:', request);
    return request;
  });
}

apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || error.message;

    if (error.response?.status === 401) {
      console.error('Authentication required:', error.config.url);
    } else if (error.response?.status === 403) {
      alert("You don't have permission to perform this action");
    } else if (error.response?.status === 404) {
      console.error('Resource not found:', error.config.url);
    } else if (error.response?.status >= 500) {
      alert('Server error. Please try again later.');
    } else if (!error.response) {
      alert('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
