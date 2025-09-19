import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from '../../components/products/ProductForm';
import ProductList from '../../components/products/ProductList';

const ArtisanDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    totalViews: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchUserProfile();
    if (activeTab === 'products') {
      fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products/artisan/my-products');
      setProducts(response.data.products);
      
      // Calculate stats
      const published = response.data.products.filter(p => p.status === 'published').length;
      const drafts = response.data.products.filter(p => p.status === 'draft').length;
      const totalViews = response.data.products.reduce((sum, p) => sum + (p.statistics?.views || 0), 0);
      
      setStats({
        totalProducts: response.data.products.length,
        publishedProducts: published,
        draftProducts: drafts,
        totalViews,
        totalOrders: 0 // Will be updated when orders are implemented
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleProductAdded = () => {
    fetchProducts();
    setActiveTab('products');
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
              <h1 className="text-3xl font-bold text-gray-900">Artisan Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.profile?.name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user.status === 'pending' && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Account Pending Approval</p>
                  <p className="text-xs">Your account is under review by our team.</p>
                </div>
              )}
              {user.status === 'approved' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">✓ Verified Artisan</p>
                </div>
              )}
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
              { id: 'products', name: 'My Products', icon: '🛍️' },
              { id: 'add-product', name: 'Add Product', icon: '➕' },
              { id: 'orders', name: 'Orders', icon: '📦' },
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
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.publishedProducts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('add-product')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <span className="text-2xl mb-2 block">➕</span>
                  <span className="font-medium text-gray-900">Add New Product</span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <span className="text-2xl mb-2 block">🛍️</span>
                  <span className="font-medium text-gray-900">Manage Products</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <span className="text-2xl mb-2 block">📦</span>
                  <span className="font-medium text-gray-900">View Orders</span>
                </button>
              </div>
            </div>

            {/* Account Status */}
            {user.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Account Under Review
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your artisan account is currently being reviewed by our team. This usually takes 1-2 business days.</p>
                      <p className="mt-2">Once approved, you'll be able to:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>List and sell your products</li>
                        <li>Receive customer orders</li>
                        <li>Communicate with customers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-product' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <ProductForm onProductAdded={handleProductAdded} />
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
              <button
                onClick={() => setActiveTab('add-product')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Product
              </button>
            </div>
            <ProductList products={products} onProductsChange={fetchProducts} />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders</h2>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Orders from customers will appear here.</p>
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
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.profile?.businessName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <p className="mt-1 text-sm text-gray-900">{user.profile?.specialization || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : user.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanDashboard;