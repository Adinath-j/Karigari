import express from 'express';
import { User } from '../models/index.js';
import { requireAuth, requireAdmin, requireOwnershipOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Favorites routes (must come before /:id route)
router.get('/favorites', requireAuth, async (req, res) => {
  try {
    console.log('GET /favorites - Session check:', {
      sessionId: req.sessionID,
      userId: req.session?.userId,
      sessionKeys: req.session ? Object.keys(req.session) : 'no session'
    });

    const user = await User.findById(req.session.userId).populate({
      path: 'favorites',
      populate: {
        path: 'artisan',
        select: 'name'
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Favorites found:', user.favorites?.length || 0, 'items');
    res.json({ favorites: user.favorites || [] });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

router.post('/favorites', requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already in favorites
    if (user.favorites && user.favorites.includes(productId)) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }
    user.favorites.push(productId);
    await user.save();

    res.json({ message: 'Product added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

router.delete('/favorites/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.favorites) {
      user.favorites = [];
    }
    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();

    res.json({ message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Get user by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update user status (Admin only)
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});



export default router;