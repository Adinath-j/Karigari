import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Import components
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ArtisanDashboard from './pages/dashboards/ArtisanDashboard';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ProductsPage from './pages/ProductsPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

// API Configuration
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on app load
  // Note: 401 errors in console are expected when user is not logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      // User not authenticated - this is expected behavior when there's no active session
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  // Dashboard Route Component
  const DashboardRoute = () => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    switch (user.role) {
      case 'artisan':
        return <ArtisanDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return <Navigate to="/" replace />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="min-h-screen">
          {/* Add responsive container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage user={user} />} />
              <Route path="/products" element={<ProductsPage user={user} />} />
              
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={
                  user ? <Navigate to="/dashboard" replace /> : 
                  <LoginPage onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  user ? <Navigate to="/dashboard" replace /> : 
                  <RegisterPage onLogin={handleLogin} />
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
