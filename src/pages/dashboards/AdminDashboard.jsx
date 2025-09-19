import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtisans: 0,
    totalCustomers: 0,
    pendingApprovals: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    popularCategories: []
  });
  const [pendingArtisans, setPendingArtisans] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customizationRequests, setCustomizationRequests] = useState([]);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'artisans') {
      fetchPendingArtisans();
    }
    if (activeTab === 'users') {
      fetchAllUsers();
    }
    if (activeTab === 'products') {
      fetchProducts();
    }
    if (activeTab === 'product-moderation') {
      fetchPendingProducts();
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
    if (activeTab === 'customizations') {
      fetchCustomizationRequests();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/products'),
        axios.get('/orders').catch(() => ({ data: { orders: [] } })) // Fallback if orders not implemented
      ]);

      const users = usersRes.data.users || [];
      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];

      const artisans = users.filter(u => u.role === 'artisan');
      const customers = users.filter(u => u.role === 'customer');
      const pending = artisans.filter(a => a.status === 'pending');
      const pendingProducts = products.filter(p => p.status === 'pending');
      
      // Calculate revenue from orders
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Get popular categories
      const categoryCount = {};
      products.forEach(product => {
        const category = product.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      const popularCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      setStats({
        totalUsers: users.length,
        totalArtisans: artisans.length,
        totalCustomers: customers.length,
        pendingApprovals: pending.length,
        totalProducts: products.length,
        pendingProducts: pendingProducts.length,
        totalOrders: orders.length,
        totalRevenue,
        activeCustomers: customers.filter(c => c.status === 'approved').length,
        popularCategories
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const fetchPendingArtisans = async () => {
    try {
      const response = await axios.get('/users?role=artisan&status=pending');
      setPendingArtisans(response.data.users || []);
    } catch (error) {
      console.error('Error fetching pending artisans:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('/users');
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const response = await axios.get('/products?status=pending');
      setPendingProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching pending products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // Fallback to empty array
    }
  };

  const fetchCustomizationRequests = async () => {
    try {
      const response = await axios.get('/customizations');
      setCustomizationRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching customization requests:', error);
      setCustomizationRequests([]); // Fallback to empty array
    }
  };

  const handleApproveArtisan = async (userId) => {
    try {
      await axios.put(`/users/${userId}/status`, { status: 'approved' });
      alert('Artisan approved successfully!');
      fetchPendingArtisans();
      fetchStats();
    } catch (error) {
      console.error('Error approving artisan:', error);
      alert('Failed to approve artisan');
    }
  };

  const handleRejectArtisan = async (userId) => {
    try {
      await axios.put(`/users/${userId}/status`, { status: 'rejected' });
      alert('Artisan rejected');
      fetchPendingArtisans();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting artisan:', error);
      alert('Failed to reject artisan');
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await axios.put(`/products/${productId}/status`, { status: 'published' });
      alert('Product approved and published!');
      fetchPendingProducts();
      fetchStats();
    } catch (error) {
      console.error('Error approving product:', error);
      alert('Failed to approve product');
    }
  };

  const handleRejectProduct = async (productId, reason = '') => {
    try {
      await axios.put(`/products/${productId}/status`, { 
        status: 'rejected',
        rejectionReason: reason 
      });
      alert('Product rejected');
      fetchPendingProducts();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product');
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!confirm('Are you sure you want to remove this product? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`/products/${productId}`);
      alert('Product removed successfully');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Failed to remove product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin access required.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.name}! Manage the Karigari marketplace.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Cards Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            { id: 'overview', name: 'Overview', icon: '📊', description: 'Platform overview and key metrics' },
            { id: 'artisans', name: 'Artisan Approvals', icon: '👨‍🎨', description: 'Review and approve artisan applications', badge: stats.pendingApprovals },
            { id: 'users', name: 'User Management', icon: '👥', description: 'Manage all users and their accounts' },
            { id: 'product-moderation', name: 'Product Moderation', icon: '🔍', description: 'Review and moderate product listings', badge: stats.pendingProducts },
            { id: 'orders', name: 'Order Oversight', icon: '📦', description: 'Monitor and manage all orders' },
            { id: 'customizations', name: 'Customizations', icon: '🎨', description: 'Oversee customization requests' },
            { id: 'analytics', name: 'Platform Analytics', icon: '📈', description: 'View detailed platform analytics' },
            { id: 'content', name: 'Content Management', icon: '📝', description: 'Manage featured content and banners' },
            { id: 'security', name: 'System Health', icon: '🔒', description: 'Monitor system security and health' }
          ].map((section) => (
            <div
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`relative bg-white rounded-xl shadow-md border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                activeTab === section.id
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {/* Badge for pending items */}
              {section.badge > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                  {section.badge}
                </div>
              )}
              
              {/* Card Content */}
              <div className="text-center">
                <div className="text-4xl mb-3">{section.icon}</div>
                <h3 className={`font-semibold text-lg mb-2 ${
                  activeTab === section.id ? 'text-indigo-900' : 'text-gray-900'
                }`}>
                  {section.name}
                </h3>
                <p className={`text-sm ${
                  activeTab === section.id ? 'text-indigo-700' : 'text-gray-600'
                }`}>
                  {section.description}
                </p>
                
                {/* Active indicator */}
                {activeTab === section.id && (
                  <div className="mt-3 flex justify-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Artisans</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalArtisans}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('artisans')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">👨‍🎨</span>
                  <span className="font-medium text-gray-900">Approve Artisans</span>
                  {stats.pendingApprovals > 0 && (
                    <span className="block text-sm text-red-600 mt-1">
                      {stats.pendingApprovals} pending
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('product-moderation')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">🔍</span>
                  <span className="font-medium text-gray-900">Moderate Products</span>
                  {stats.pendingProducts > 0 && (
                    <span className="block text-sm text-red-600 mt-1">
                      {stats.pendingProducts} pending
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">📦</span>
                  <span className="font-medium text-gray-900">Order Oversight</span>
                  <span className="block text-sm text-gray-600 mt-1">
                    {stats.totalOrders} total orders
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('customizations')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">🎨</span>
                  <span className="font-medium text-gray-900">Customizations</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">📈</span>
                  <span className="font-medium text-gray-900">Analytics</span>
                  <span className="block text-sm text-gray-600 mt-1">
                    ₹{stats.totalRevenue.toLocaleString()} revenue
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                >
                  <span className="text-2xl mb-2 block">📝</span>
                  <span className="font-medium text-gray-900">Content Management</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Artisan Approvals Tab */}
        {activeTab === 'artisans' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Artisan Approvals</h2>
              <span className="text-gray-600 text-sm">
                {pendingArtisans.length} pending approval(s)
              </span>
            </div>
            
            {pendingArtisans.length > 0 ? (
              <div className="space-y-4">
                {pendingArtisans.map((artisan) => (
                  <div key={artisan._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900">{artisan.name}</h3>
                          <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Pending Review
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{artisan.email}</p>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Business Name:</span>
                            <p className="text-gray-600">{artisan.profile?.businessName || 'Not provided'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Specialization:</span>
                            <p className="text-gray-600">{artisan.profile?.specialization || 'Not provided'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Experience:</span>
                            <p className="text-gray-600">{artisan.profile?.experience || 'Not provided'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Registered:</span>
                            <p className="text-gray-600">{new Date(artisan.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {artisan.profile?.bio && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Bio:</span>
                            <p className="text-gray-600 text-sm mt-1">{artisan.profile.bio}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-3 ml-6">
                        <button
                          onClick={() => handleApproveArtisan(artisan._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectArtisan(artisan._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">✓</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending artisan approvals at this time.</p>
              </div>
            )}
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Featured Artisans */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Artisans</h3>
                <div className="space-y-3 mb-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Current Featured Artisan</h4>
                        <p className="text-sm text-gray-600">No artisan currently featured</p>
                      </div>
                      <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
                        Select Artisan
                      </button>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-3">Spotlight Crafts</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-gray-700">Traditional Pottery</span>
                    <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-gray-700">Hand-woven Textiles</span>
                    <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                  </div>
                  <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                    + Add Spotlight Craft
                  </button>
                </div>
              </div>
              
              {/* Promotional Banners */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotional Banners</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Homepage Banner</h4>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">"Discover Authentic Handmade Crafts"</p>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        Edit
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
                        Deactivate
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Festival Special</h4>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">"Diwali Special - 20% Off on All Items"</p>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                        Approve
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                  
                  <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                    + Create New Banner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;