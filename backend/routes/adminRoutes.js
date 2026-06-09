import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', async (_req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, lowStock, revenue] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(10),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: revenue[0]?.total || 0,
      lowStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/products', async (_req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
