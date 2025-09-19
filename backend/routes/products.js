import express from 'express';
import {
  getAllProducts,
  getCategories,
  getProduct,
  createProduct,
  generateDescription,
  getArtisanProducts,
  updateProduct,
  deleteProduct,
  upload
} from '../controllers/productController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/auth.js';
import { Product } from '../models/index.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Protected routes (require authentication)
router.use(authMiddleware);

// Artisan-only routes
router.post('/', upload.array('images', 6), createProduct);
router.post('/generate-description', generateDescription);
router.get('/artisan/my-products', getArtisanProducts);
router.put('/:id', upload.array('images', 6), updateProduct);
router.delete('/:id', deleteProduct);

// Artisan can toggle their own product status between draft and published
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      artisan: req.session.userId
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    // Only allow toggle between draft and published
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    
    product.status = newStatus;
    await product.save();

    res.json({ 
      message: `Product ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully`,
      product 
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Admin-only routes for product moderation
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['draft', 'published', 'pending', 'approved', 'rejected', 'out-of-stock', 'discontinued'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('artisan', 'name email profile.businessName');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ 
      message: `Product status updated to ${status}`,
      product 
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Admin route to delete any product
router.delete('/:id/admin', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully by admin' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;