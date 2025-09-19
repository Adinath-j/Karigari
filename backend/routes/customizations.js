import express from 'express';
import { Customization } from '../models/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all customization requests (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer, artisan } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (artisan) filter.artisan = artisan;

    const requests = await Customization.find(filter)
      .populate('customer', 'name email profile')
      .populate('artisan', 'name email profile.businessName')
      .populate('product', 'title price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Customization.countDocuments(filter);

    res.json({
      success: true,
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get customization requests error:', error);
    res.status(500).json({ error: 'Failed to fetch customization requests' });
  }
});

// Get customization request by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const request = await Customization.findById(req.params.id)
      .populate('customer', 'name email profile')
      .populate('artisan', 'name email profile.businessName profile.location')
      .populate('product', 'title description price images');

    if (!request) {
      return res.status(404).json({ error: 'Customization request not found' });
    }

    // Check if user has permission to view this request
    const canView = req.user.role === 'admin' || 
                   request.customer.toString() === req.user._id.toString() ||
                   request.artisan?.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get customization request error:', error);
    res.status(500).json({ error: 'Failed to fetch customization request' });
  }
});

// Create customization request (Customer only)
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can create customization requests' });
    }

    const {
      artisan,
      product,
      requestDetails
    } = req.body;

    if (!artisan || !product || !requestDetails) {
      return res.status(400).json({ error: 'Artisan, product, and request details are required' });
    }

    const customization = new Customization({
      customer: req.user._id,
      artisan,
      product,
      requestDetails,
      status: 'pending'
    });

    await customization.save();
    await customization.populate([
      { path: 'customer', select: 'name email' },
      { path: 'artisan', select: 'name email profile.businessName' },
      { path: 'product', select: 'title price images' }
    ]);

    res.status(201).json({ 
      message: 'Customization request created successfully',
      request: customization
    });
  } catch (error) {
    console.error('Create customization request error:', error);
    res.status(500).json({ error: 'Failed to create customization request' });
  }
});

// Update customization request status (Admin or involved parties)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const request = await Customization.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Customization request not found' });
    }

    // Check permission
    const canUpdate = req.user.role === 'admin' || 
                     request.customer.toString() === req.user._id.toString() ||
                     request.artisan?.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    request.status = status;
    if (note) {
      request.timeline.push({
        status,
        timestamp: new Date(),
        note,
        updatedBy: req.user._id
      });
    }

    await request.save();
    await request.populate([
      { path: 'customer', select: 'name email' },
      { path: 'artisan', select: 'name email profile.businessName' },
      { path: 'product', select: 'title price images' }
    ]);

    res.json({ message: 'Customization request status updated successfully', request });
  } catch (error) {
    console.error('Update customization request status error:', error);
    res.status(500).json({ error: 'Failed to update customization request status' });
  }
});

// Get customer's customization requests
router.get('/customer/my-requests', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const requests = await Customization.find({ customer: req.user._id })
      .populate('artisan', 'name profile.businessName')
      .populate('product', 'title price images')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get customer customization requests error:', error);
    res.status(500).json({ error: 'Failed to fetch customization requests' });
  }
});

// Get artisan's customization requests
router.get('/artisan/my-requests', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const requests = await Customization.find({ artisan: req.user._id })
      .populate('customer', 'name email profile')
      .populate('product', 'title price images')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get artisan customization requests error:', error);
    res.status(500).json({ error: 'Failed to fetch customization requests' });
  }
});

export default router;