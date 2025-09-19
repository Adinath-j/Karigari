import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductDetailModal from '../../components/products/ProductDetailModal';

const CustomerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentProducts, setRecentProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchUserProfile();
    fetchRecentProducts();
    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      const response = await axios.get('/products?limit=8');
      setRecentProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/users/favorites');
      setFavoriteProducts(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleRemoveFromFavorites = async (productId) => {
    try {
      await axios.delete(`/users/favorites/${productId}`);
      setFavoriteProducts(prev => prev.filter(product => product._id !== productId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove from favorites');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.profile?.name || user.email}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/products"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'orders', name: 'My Orders', icon: '📦' },
              { id: 'favorites', name: 'Favorites', icon: '❤️' },
              { id: 'profile', name: 'Profile', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/products"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">🛍️</span>
                  <span className="font-medium text-gray-900">Browse Products</span>
                </Link>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">📦</span>
                  <span className="font-medium text-gray-900">View Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">❤️</span>
                  <span className="font-medium text-gray-900">My Favorites</span>
                </button>
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Featured Products</h3>
                <Link
                  to="/products"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              
              {recentProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recentProducts.slice(0, 4).map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.title}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-2xl">🖼️</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(product.price)}
                          </span>
                          <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">🛍️</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Explore Amazing Products</h3>
                  <p className="text-gray-600 mb-4">Discover handcrafted items from talented artisans.</p>
                  <Link
                    to="/products"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h2>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Your order history will appear here.</p>
              <Link
                to="/products"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
              <span className="text-gray-600 text-sm">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteProducts.map((product) => (
                  <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                    {/* Product Image */}
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000${product.images[0]}`}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">🖼️</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Price and Stock */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Stock: {product.stock}
                        </span>
                      </div>

                      {/* Artisan Info */}
                      <div className="text-xs text-gray-500 mb-3">
                        By: {product.artisan?.profile?.name || 'Unknown Artisan'}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleRemoveFromFavorites(product._id)}
                          className="px-3 py-2 bg-red-50 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Remove from favorites"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">❤️</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600 mb-4">
                  Products you mark as favorites will appear here for easy access.
                </p>
                <Link
                  to="/products"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Favorites</h2>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">❤️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-4">Save products you love for easy access later.</p>
              <Link
                to="/products"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Discover Products
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.profile?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{user.profile?.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.profile?.address ? 
                    `${user.profile.address.street}, ${user.profile.address.city}, ${user.profile.address.state} ${user.profile.address.pincode}` : 
                    'Not provided'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={user}
        onFavoriteToggle={() => fetchFavorites()}
      />
    </div>
  );
};

export default CustomerDashboard;