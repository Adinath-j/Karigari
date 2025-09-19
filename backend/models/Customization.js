import mongoose from 'mongoose';

const customizationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  requestDetails: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    specifications: {
      color: String,
      size: String,
      material: String,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: String
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      budget: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      }
    },
    referenceImages: [String],
    deadline: Date,
    notes: String
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'quoted', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  artisanResponse: {
    isAvailable: Boolean,
    estimatedPrice: Number,
    estimatedDelivery: Date,
    message: String,
    alternativeOptions: String,
    respondedAt: Date
  },
  quote: {
    basePrice: Number,
    customizationFee: Number,
    materialCost: Number,
    laborCost: Number,
    totalPrice: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    validUntil: Date,
    terms: String
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }
}, {
  timestamps: true
});

// Update timeline on status change
customizationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Customization request status updated to ${this.status}`
    });
  }
  next();
});

// Indexes
customizationSchema.index({ customer: 1 });
customizationSchema.index({ artisan: 1 });
customizationSchema.index({ product: 1 });
customizationSchema.index({ status: 1 });
customizationSchema.index({ createdAt: -1 });

export default mongoose.model('Customization', customizationSchema);