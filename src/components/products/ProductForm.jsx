import React, { useState, useRef } from 'react';
import axios from 'axios';

const ProductForm = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    materials: '',
    size: '',
    price: '',
    stock: '',
    category: '',
    tags: [],
    customizationOptions: {
      customizable: false,
      customizationNote: ''
    }
  });
  
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    'Pottery', 'Textiles', 'Jewelry', 'Woodwork', 
    'Metalcraft', 'Paintings', 'Sculptures', 'Home Decor',
    'Handicrafts', 'Traditional Art', 'Modern Art'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 6) {
      alert('Maximum 6 images allowed');
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          file,
          preview: event.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const generateAIDescription = async () => {
    if (!formData.category || !formData.materials) {
      alert('Please select category and materials first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await axios.post('/products/generate-description', {
        category: formData.category,
        materials: formData.materials,
        title: formData.title
      });
      
      setFormData(prev => ({
        ...prev,
        description: response.data.description,
        tags: response.data.suggestedTags
      }));
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'customizationOptions') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      submitData.append('status', saveAsDraft ? 'draft' : 'published');
      
      // Add images
      images.forEach(image => {
        submitData.append('images', image.file);
      });

      await axios.post('/products', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert(saveAsDraft ? 'Product saved as draft!' : 'Product published successfully!');
      
      // Reset form
      setFormData({
        title: '', description: '', materials: '', size: '', 
        price: '', stock: '', category: '', tags: [],
        customizationOptions: { customizable: false, customizationNote: '' }
      });
      setImages([]);
      
      if (onProductAdded) {
        onProductAdded();
      }
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Add New Product</h2>
        <button 
          type="button" 
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      {previewMode ? (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Product Preview</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {images.map(img => (
                  <img 
                    key={img.id} 
                    src={img.preview} 
                    alt="Product" 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
                {images.length === 0 && (
                  <div className="col-span-3 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No images uploaded</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-gray-800">
                {formData.title || 'Product Title'}
              </h4>
              <p className="text-gray-600">
                {formData.description || 'Product description will appear here...'}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-2xl font-bold text-green-600">
                  ₹{formData.price || '0'}
                </span>
                <span className="text-gray-600">Stock: {formData.stock || '0'}</span>
                <span className="text-gray-600">Materials: {formData.materials}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {formData.customizationOptions.customizable && (
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">🎨 Customizable Product</p>
                  <p className="text-xs text-yellow-700">{formData.customizationOptions.customizationNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter product title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button 
              type="button" 
              onClick={generateAIDescription}
              disabled={!formData.category || !formData.materials || isGeneratingDescription}
              className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingDescription ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '🤖 Generate AI Description'
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials *
              </label>
              <input
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleInputChange}
                required
                placeholder="e.g., Cotton, Wood, Clay"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., 15x10 cm"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              placeholder="Type tags and press Enter or comma to add"
              onKeyDown={handleTagInput}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Customization Options */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                name="customizationOptions.customizable"
                checked={formData.customizationOptions.customizable}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                This product can be customized
              </label>
            </div>
            {formData.customizationOptions.customizable && (
              <textarea
                name="customizationOptions.customizationNote"
                value={formData.customizationOptions.customizationNote}
                onChange={handleInputChange}
                placeholder="Describe what can be customized (colors, size, design, etc.)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Max 6)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              disabled={images.length >= 6}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 disabled:cursor-not-allowed transition-colors"
            >
              Upload Images ({images.length}/6)
            </button>
            
            <div className="grid grid-cols-6 gap-2 mt-4">
              {images.map(img => (
                <div key={img.id} className="relative">
                  <img 
                    src={img.preview} 
                    alt="Preview" 
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Save as Draft
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Product'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductForm;