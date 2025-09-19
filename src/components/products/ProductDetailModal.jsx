import React, { useState } from 'react';
import axios from 'axios';

const ProductDetailModal = ({ product, isOpen, onClose, user, onFavoriteToggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please login to add to favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await axios.delete(`/users/favorites/${product._id}`);
        setIsFavorite(false);
      } else {
        await axios.post('/users/favorites', { productId: product._id });
        setIsFavorite(true);
      }
      if (onFavoriteToggle) onFavoriteToggle();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCustomization = () => {
    // This will be implemented when chat system is ready
    alert('Customization request feature coming soon!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative">
                    <img
                      src={`http://localhost:5000${product.images[currentImageIndex]}`}
                      alt={product.title}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Images */}
                  {product.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex ? 'border-indigo-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={`http://localhost:5000${image}`}
                            alt={`${product.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">🖼️</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Price */}
              <div className="text-3xl font-bold text-green-600">
                {formatPrice(product.price)}
              </div>

              {/* Artisan Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Artisan</h3>
                <p className="text-gray-700">{product.artisan?.profile?.name || 'Unknown Artisan'}</p>
                {product.artisan?.profile?.businessName && (
                  <p className="text-sm text-gray-600">{product.artisan.profile.businessName}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Category</h4>
                  <p className="text-gray-600">{product.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Stock</h4>
                  <p className="text-gray-600">{product.stock} available</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Materials</h4>
                  <p className="text-gray-600">{product.materials}</p>
                </div>
                {product.size && (
                  <div>
                    <h4 className="font-medium text-gray-900">Size</h4>
                    <p className="text-gray-600">{product.size}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization */}
              {product.customizationOptions?.customizable && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-600 mr-2">🎨</span>
                    <h4 className="font-medium text-yellow-900">Customizable Product</h4>
                  </div>
                  <p className="text-yellow-800 text-sm mb-3">
                    {product.customizationOptions.customizationNote || 'This product can be customized according to your preferences.'}
                  </p>
                  <button
                    onClick={handleRequestCustomization}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Request Customization
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Add to Cart
                </button>
                {user && (
                  <button
                    onClick={handleFavoriteToggle}
                    disabled={loading}
                    className={`px-4 py-3 rounded-lg border transition-colors ${
                      isFavorite
                        ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;