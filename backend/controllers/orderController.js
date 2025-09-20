import { Order } from '../models/index.js';

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer, artisan } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (artisan) filter['items.artisan'] = artisan;

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('items.product', 'title price images')
      .populate('items.artisan', 'name email profile.businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email profile')
      .populate('items.product', 'title description price images')
      .populate('items.artisan', 'name email profile.businessName profile.location');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has permission to view this order
    const canView = req.user.role === 'admin' || 
                   order.customer.toString() === req.user._id.toString() ||
                   order.items.some(item => item.artisan._id.toString() === req.user._id.toString());

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Update order status (Admin only)
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            note: note || `Status updated to ${status} by admin`,
            updatedBy: req.user._id
          }
        }
      },
      { new: true }
    ).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Update order status (Artisan - for their own orders)
export const updateOrderStatusArtisan = async (req, res) => {
  try {
    const { status, note, tracking } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Find the order that belongs to this artisan
    const order = await Order.findOne({
      _id: req.params.id,
      'items.artisan': req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or access denied' });
    }

    // Validate status transitions for artisans
    const validTransitions = {
      'pending': ['confirmed'],
      'confirmed': ['processing'],
      'processing': ['shipped'],
      'shipped': ['delivered']
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${order.status} to ${status}` 
      });
    }

    // Prepare update data
    const updateData = { 
      status,
      $push: {
        timeline: {
          status,
          timestamp: new Date(),
          note: note || `Status updated to ${status} by artisan`,
          updatedBy: req.user._id
        }
      }
    };

    // Add tracking information if provided
    if (tracking) {
      updateData.tracking = tracking;
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customer', 'name email');

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Get customer orders
export const getCustomerOrders = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'title price images')
      .populate('items.artisan', 'name profile.businessName')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get artisan orders
export const getArtisanOrders = async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await Order.find({ 'items.artisan': req.user._id })
      .populate('customer', 'name email profile')
      .populate('items.product', 'title price images')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};