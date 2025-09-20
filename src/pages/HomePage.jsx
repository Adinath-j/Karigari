import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductDetailModal from '../components/products/ProductDetailModal';

const HomePage = ({ user }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userFavorites, setUserFavorites] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
    if (user) {
      fetchUserFavorites();
    }
  }, [user]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/products?limit=8&sortBy=createdAt&sortOrder=desc');
      setFeaturedProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/products/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await axios.get('/users/favorites');
      setUserFavorites(response.data.favorites.map(fav => fav._id));
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

  const handleFavoriteToggle = async (productId) => {
    if (!user) {
      alert('Please login to add to favorites');
      return;
    }

    try {
      const isFavorite = userFavorites.includes(productId);
      if (isFavorite) {
        await axios.delete(`/users/favorites/${productId}`);
        setUserFavorites(prev => prev.filter(id => id !== productId));
      } else {
        await axios.post('/users/favorites', { productId });
        setUserFavorites(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-green-50">
      {/* Hero Section with Image */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700 overflow-hidden">
        {/* Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <div className="bg-gray-200 overflow-hidden w-full h-full flex items-center justify-center">
            {/* Placeholder for hero image */}
            <div className="text-center p-4">
              <div className="text-5xl mb-4">🏺</div>
              <h3 className="text-xl font-semibold text-gray-700">Handcrafted Art</h3>
              <p className="text-gray-600 mt-2">Discover unique artisan products</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-purple-700/80"></div>
        </div>

        <div className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Authentic
              <span className="block mt-2">Handcrafted Art</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Connect with skilled artisans and discover unique, handcrafted products.
              From pottery to jewelry, each piece tells a story of traditional craftsmanship.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="bg-white text-indigo-600 hover:bg-gray-100 font-medium rounded-lg transition-colors duration-200 text-lg px-8 py-3 shadow-lg">
                Explore Products
              </Link>
              {!user && (
                <Link to="/register" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium rounded-lg transition-colors duration-200 text-lg px-8 py-3">
                  Join as Artisan
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Karigari?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the beauty of handcrafted products with our unique marketplace features
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentic Craftsmanship</h3>
              <p className="text-gray-600">
                Every product is handcrafted by skilled artisans with years of experience and passion for their craft.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Orders</h3>
              <p className="text-gray-600">
                Work directly with artisans to create personalized pieces that match your exact requirements.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                All artisans are verified and products are quality-checked to ensure you receive the best.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistance</h3>
              <p className="text-gray-600">
                Empower artisans with AI tools for design suggestions, pricing optimization, and market insights.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multilanguage Support</h3>
              <p className="text-gray-600">
                Connect with artisans and customers worldwide with our comprehensive multilanguage platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of handcrafted products
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 px-4 sm:px-6 lg:px-8">
            {categories.slice(0, 6).map((category, index) => {
              const categoryIcons = {
                'Pottery': '🏺',
                'Textiles': '🧵',
                'Jewelry': '💍',
                'Woodwork': '🪵',
                'Metalcraft': '⚒️',
                'Paintings': '🎨',
                'Sculptures': '🗿',
                'Home Decor': '🏠',
                'Handicrafts': '🎯',
                'Traditional Art': '🖼️',
                'Modern Art': '🎭'
              };
              return (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="group text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="text-4xl mb-3">{categoryIcons[category] || '🎨'}</div>
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {category}
                  </h3>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-indigo-300 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              View All Categories
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-white py-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the latest handcrafted treasures from our talented artisans
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
              {featuredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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

                    {/* Price */}
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
                      {user && (
                        <button
                          onClick={() => handleFavoriteToggle(product._id)}
                          className={`px-3 py-2 border rounded-lg transition-colors ${userFavorites.includes(product._id)
                              ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                              : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <svg className="w-4 h-4" fill={userFavorites.includes(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
            >
              View All Products
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Whether you're looking to buy unique handcrafted items or showcase your artisan skills,
            Karigari is the perfect platform for you.
          </p>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=customer" className="bg-white text-indigo-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors">
                Start Shopping
              </Link>
              <Link to="/register?role=artisan" className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-medium py-3 px-8 rounded-lg transition-colors">
                Become an Artisan
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="bg-white text-indigo-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={user}
        onFavoriteToggle={() => fetchUserFavorites()}
      />
    </div>
  );
};

export default HomePage;