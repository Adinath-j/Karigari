import express from 'express';
import { requireAuth, requireAdmin, requireArtisan } from '../middleware/auth.js';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatusAdmin,
  updateOrderStatusArtisan,
  getCustomerOrders,
  getArtisanOrders
} from '../controllers/orderController.js';

const router = express.Router();

// Get all orders (Admin only)
router.get('/', requireAdmin, getAllOrders);

// Get order by ID (All authenticated users)
router.get('/:id', requireAuth, getOrderById);

// Update order status (Admin only)
router.put('/:id/status', requireAdmin, updateOrderStatusAdmin);

// Update order status (Artisan - for their own orders)
router.put('/:id/status/artisan', requireAuth, requireArtisan, updateOrderStatusArtisan);

// Get customer orders
router.get('/customer/my-orders', requireAuth, getCustomerOrders);

// Get artisan orders
router.get('/artisan/my-orders', requireAuth, getArtisanOrders);

export default router;