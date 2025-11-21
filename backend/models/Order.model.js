const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Please provide an order number'],
    unique: true,
    trim: true,
    maxlength: [50, 'Order number cannot be more than 50 characters'],
  },
  customerName: {
    type: String,
    required: [true, 'Please provide customer name'],
    trim: true,
    maxlength: [100, 'Customer name cannot be more than 100 characters'],
  },
  customerEmail: {
    type: String,
    required: [true, 'Please provide customer email'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  customerPhone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters'],
  },
  items: {
    type: [
      {
        productName: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
      },
    ],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Order must have at least one item',
    },
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
    min: [0, 'Total amount cannot be negative'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  shippingAddress: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'USA',
    },
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Admin-only fields
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot be more than 1000 characters'],
    default: null,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  tags: {
    type: [String],
    default: [],
  },
  estimatedDeliveryDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for better query performance
orderSchema.index({ createdBy: 1, status: 1 });
orderSchema.index({ assignedTo: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ status: 1, paymentStatus: 1 });

// Auto-calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items') && this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);


