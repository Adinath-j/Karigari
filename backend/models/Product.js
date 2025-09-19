import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: function() {
      return this.status !== 'draft';
    }
  },
  aiDescription: {
    type: String,
    default: "{AI_GENERATED_DESCRIPTION} - This product showcases traditional craftsmanship with modern appeal. The intricate details and quality materials make it a perfect addition to any collection. Each piece is handcrafted with care and attention to detail."
  },
  category: {
    type: String,
    required: true,
    enum: ['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalcraft', 'Paintings', 'Sculptures', 'Home Decor', 'Handicrafts', 'Traditional Art', 'Modern Art']
  },
  subcategory: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  images: [String],
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  materials: String,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'mm'],
      default: 'cm'
    }
  },
  customizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: {
    colors: [String],
    sizes: [String],
    materials: [String],
    personalizations: [String]
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'pending', 'approved', 'rejected', 'out-of-stock', 'discontinued'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    sales: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: String
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: Number,
    processingTime: {
      type: String,
      default: '1-3 business days'
    }
  }
}, {
  timestamps: true
});

// Create slug from title
productSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Indexes for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ artisan: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);