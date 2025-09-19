import React, { useState } from 'react';
import axios from 'axios';

const ProductList = ({ products, onProductsChange }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`/api/products/${productId}`);
      onProductsChange();
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      await axios.put(`/api/products/${productId}`, { status: newStatus });
      onProductsChange();
      alert(`Product ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully`);
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-600 mb-6">Start by adding your first product to showcase your craftsmanship.</p>
        <button 
          onClick={() => window.location.hash = '#add-product'}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Your First Product
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {product.title}
                </h3>
                {getStatusBadge(product.status)}
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags && product.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags && product.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{product.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Statistics */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="flex items-center mr-4">
                  👁️ {product.statistics?.views || 0} views
                </span>
                <span className="flex items-center">
                  📅 {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusToggle(product._id, product.status)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    product.status === 'published'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {product.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => handleDelete(product._id)}
                  disabled={isDeleting}
                  className="px-3 py-2 bg-red-100 text-red-800 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${image}`}
                        alt={`${selectedProduct.title} ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedProduct.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <span className="ml-2 text-green-600 font-bold">
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Stock:</span>
                    <span className="ml-2">{selectedProduct.stock}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2">{selectedProduct.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Materials:</span>
                    <span className="ml-2">{selectedProduct.materials}</span>
                  </div>
                  {selectedProduct.size && (
                    <div>
                      <span className="font-medium text-gray-700">Size:</span>
                      <span className="ml-2">{selectedProduct.size}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedProduct.status)}</span>
                  </div>
                </div>

                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedProduct.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.customizationOptions?.customizable && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="font-medium text-yellow-800">🎨 Customizable Product</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {selectedProduct.customizationOptions.customizationNote}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p>Created: {new Date(selectedProduct.createdAt).toLocaleString()}</p>
                  <p>Last Updated: {new Date(selectedProduct.updatedAt).toLocaleString()}</p>
                  <p>Views: {selectedProduct.statistics?.views || 0}</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => handleStatusToggle(selectedProduct._id, selectedProduct.status)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedProduct.status === 'published'
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {selectedProduct.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                
                <button
                  onClick={() => handleDelete(selectedProduct._id)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Delete Product
                </button>
                
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;