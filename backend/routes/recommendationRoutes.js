import express from 'express';
import { protect } from '../middleware/auth.js';
import { getRecommendations, trackProductView } from '../services/recommendationService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { productId, limit = 8 } = req.query;
    let userId = null;

    if (req.headers.authorization?.startsWith('Bearer')) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {
        // Optional auth — continue as guest
      }
    }

    const recommendations = await getRecommendations(userId, productId, Number(limit));
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/track/:productId', protect, async (req, res) => {
  try {
    await trackProductView(req.user._id, req.params.productId);
    res.json({ message: 'View tracked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
