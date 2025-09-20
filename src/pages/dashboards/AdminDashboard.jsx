import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState({
    stats: true,
    artisans: true,
    users: true,
    products: true,
    "product-moderation": true,
    orders: true,
    customizations: true
  });
  const [errors, setErrors] = useState({});
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
  const [productCard, setProductCard] = useState(null);

  const fetchStats = async () => {
    setLoading(prev => ({...prev, stats: true}));
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/products'),
        apiClient.get('/orders').catch(() => ({ data: { orders: [] } })) // Fallback if orders not implemented
      ]);

      const users = usersRes.data.users || [];
      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];
      
      // Calculate stats
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
    } catch (error) {
      console.error('Error fetching stats:', error);
      setErrors(prev => ({...prev, stats: 'Failed to load stats'}));
    } finally {
      setLoading(prev => ({...prev, stats: false}));
    }
  };

  // Modify the fetch functions to handle errors better
  const fetchPendingArtisans = async () => {
    setLoading(prev => ({...prev, artisans: true}));
    try {
      const response = await apiClient.get('/users?role=artisan&status=pending');
      setPendingArtisans(response.data.users || []);
    } catch (error) {
      console.error('Error fetching pending artisans:', error);
      setErrors(prev => ({...prev, artisans: 'Failed to load pending artisans'}));
    } finally {
      setLoading(prev => ({...prev, artisans: false}));
    }
  };

  const fetchAllUsers = async () => {
    setLoading(prev => ({...prev, users: true}));
    try {
      const response = await apiClient.get('/users');
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching all users:', error);
      setErrors(prev => ({...prev, users: 'Failed to load users'}));
    } finally {
      setLoading(prev => ({...prev, users: false}));
    }
  };

  const fetchProducts = async () => {
    setLoading(prev => ({...prev, products: true}));
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrors(prev => ({...prev, products: 'Failed to load products'}));
    } finally {
      setLoading(prev => ({...prev, products: false}));
    }
  };

  const fetchPendingProducts = async () => {
    setLoading(prev => ({...prev, "product-moderation": true}));
    try {
      const response = await apiClient.get('/products?status=pending');
      setPendingProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching pending products:', error);
      setErrors(prev => ({...prev, "product-moderation": 'Failed to load pending products'}));
    } finally {
      setLoading(prev => ({...prev, "product-moderation": false}));
    }
  };

  const fetchOrders = async () => {
    setLoading(prev => ({...prev, orders: true}));
    try {
      const response = await apiClient.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrors(prev => ({...prev, orders: 'Failed to load orders'}));
    } finally {
      setLoading(prev => ({...prev, orders: false}));
    }
  };

  const fetchCustomizationRequests = async () => {
    setLoading(prev => ({...prev, customizations: true}));
    try {
      const response = await apiClient.get('/customizations');
      setCustomizationRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching customization requests:', error);
      setErrors(prev => ({...prev, customizations: 'Failed to load customization requests'}));
    } finally {
      setLoading(prev => ({...prev, customizations: false}));
    }
  };

  // Modify the useEffect hook
  useEffect(() => {
    fetchStats();
    
    // Only fetch data for the active tab if it hasn't been fetched yet
    const fetchTabData = async () => {
      if (activeTab === 'artisans') {
        fetchPendingArtisans();
      } else if (activeTab === 'users') {
        fetchAllUsers();
        // Also fetch pending artisans for the user management tab
        fetchPendingArtisans();
      } else if (activeTab === 'products') {
        fetchProducts();
      } else if (activeTab === 'product-moderation') {
        fetchPendingProducts();
      } else if (activeTab === 'orders') {
        fetchOrders();
      } else if (activeTab === 'customizations') {
        fetchCustomizationRequests();
      }
    };
    
    fetchTabData();
  }, [activeTab]);

  const handleApproveArtisan = async (userId) => {
    try {
      await apiClient.put(`/users/${userId}/status`, { status: 'approved' });
      alert('Artisan approved successfully!');
      fetchPendingArtisans();
      fetchStats();
      fetchAllUsers(); // Refresh user list
    } catch (error) {
      console.error('Error approving artisan:', error);
      alert('Failed to approve artisan');
    }
  };

  const handleRejectArtisan = async (userId) => {
    try {
      await apiClient.put(`/users/${userId}/status`, { status: 'rejected' });
      alert('Artisan rejected');
      fetchPendingArtisans();
      fetchStats();
      fetchAllUsers(); // Refresh user list
    } catch (error) {
      console.error('Error rejecting artisan:', error);
      alert('Failed to reject artisan');
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      await apiClient.put(`/products/${productId}/status`, { status: 'published' });
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
      await apiClient.put(`/products/${productId}/status`, { 
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
      await apiClient.delete(`/products/${productId}/admin`);
      alert('Product removed successfully');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error removing product:', error);
      alert('Failed to remove product');
    }
  };

  if (loading.stats) {
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
            { id: 'users', name: 'User Management', icon: '👥', description: 'Manage all users and their accounts', badge: stats.pendingApprovals },
            { id: 'product-moderation', name: 'Product Moderation', icon: '🔍', description: 'Review and moderate product listings', badge: stats.pendingProducts },
            { id: 'orders', name: 'Order Oversight', icon: '📦', description: 'Monitor and manage all orders' },
            { id: 'customizations', name: 'Customizations', icon: '🎨', description: 'Oversee customization requests' },
            { id: 'analytics', name: 'Platform Analytics', icon: '📈', description: 'View detailed platform analytics' },
            { id: 'content', name: 'Content Management', icon: '📝', description: 'Manage featured content and banners' }
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

        {/* User Management Tab (now includes artisan approvals) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Artisan Approvals Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Artisan Approvals</h2>
                <span className="text-gray-600 text-sm">
                  {pendingArtisans.length} pending approval(s)
                </span>
              </div>
              
              {pendingArtisans.length > 0 ? (
                <div className="space-y-4">
                  {pendingArtisans.map((artisan) => (
                    <div key={artisan._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{artisan.name}</h3>
                            <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              Pending Review
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{artisan.email}</p>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                        <div className="flex space-x-3 mt-4 sm:mt-0">
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

            {/* All Users Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Users</h2>
              
              {allUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'artisan' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'approved' ? 'bg-green-100 text-green-800' :
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">There are no users in the system yet.</p>
                </div>
              )}
            </div>
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
                    <div className="flex flex-wrap gap-2">
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
                    <div className="flex flex-wrap gap-2">
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

        {/* Product Card */}
        {productCard && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{productCard.title}</h3>
            <div className="space-y-3">
              {productCard.artisan && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">Artisan:</span>
                  <p className="text-gray-600 ml-2">{productCard.artisan.name}</p>
                </div>
              )}
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Price:</span>
                <p className="text-gray-600 ml-2">₹{productCard.price}</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Category:</span>
                <p className="text-gray-600 ml-2">{productCard.category}</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Status:</span>
                <p className="text-gray-600 ml-2">{productCard.status}</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Stock:</span>
                <p className="text-gray-600 ml-2">{productCard.stock}</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Sold:</span>
                <p className="text-gray-600 ml-2">{productCard.sold}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && loading.products && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {activeTab === 'products' && !loading.products && products.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">There are no products in the marketplace yet.</p>
          </div>
        )}

        {activeTab === 'products' && !loading.products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                    <p className="text-sm text-gray-600">₹{product.price}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setProductCard(product)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(product._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Moderation Tab */}
        {activeTab === 'product-moderation' && loading["product-moderation"] && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {activeTab === 'product-moderation' && !loading["product-moderation"] && pendingProducts.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending products</h3>
            <p className="text-gray-600">There are no products awaiting moderation.</p>
          </div>
        )}

        {activeTab === 'product-moderation' && !loading["product-moderation"] && pendingProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                    <p className="text-sm text-gray-600">₹{product.price}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproveProduct(product._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectProduct(product._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && loading.orders && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {activeTab === 'orders' && !loading.orders && orders.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">There are no orders in the marketplace yet.</p>
          </div>
        )}

        {activeTab === 'orders' && !loading.orders && orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order._id}</h3>
                    <p className="text-sm text-gray-600">₹{order.totalAmount}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setProductCard(order.product)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customizations Tab */}
        {activeTab === 'customizations' && loading.customizations && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {activeTab === 'customizations' && !loading.customizations && customizationRequests.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customization requests</h3>
            <p className="text-gray-600">There are no customization requests at this time.</p>
          </div>
        )}

        {activeTab === 'customizations' && !loading.customizations && customizationRequests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {customizationRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Request #{request._id}</h3>
                    <p className="text-sm text-gray-600">Product: {request.product.title}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setProductCard(request.product)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  {loading.stats ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 010 5.292M12 4.354a4 4 0 010 5.292M12 4.354v9.292m0-9.292a4 4 0 014 4m-4-4a4 4 0 01-4 4m4 4v2.5m-4-4v2.5"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{stats.totalUsers}</p>
                          <h4 className="text-lg font-bold text-gray-900">Total Users</h4>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">{stats.pendingApprovals} pending approvals</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;