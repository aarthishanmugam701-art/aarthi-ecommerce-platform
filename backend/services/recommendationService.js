import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * AI-powered product recommendation engine using collaborative filtering
 * and content-based scoring (category, tags, price range, ratings).
 */
export async function getRecommendations(userId, productId = null, limit = 8) {
  const allProducts = await Product.find({ stock: { $gt: 0 } });
  if (!allProducts.length) return [];

  let user = null;
  if (userId) {
    user = await User.findById(userId).populate('purchaseHistory viewedProducts');
  }

  const scores = new Map();

  const addScore = (id, points, reason) => {
    const key = id.toString();
    const existing = scores.get(key) || { score: 0, reasons: [] };
    existing.score += points;
    if (reason && !existing.reasons.includes(reason)) {
      existing.reasons.push(reason);
    }
    scores.set(key, existing);
  };

  // Content-based: similar to currently viewed product
  if (productId) {
    const current = allProducts.find((p) => p._id.toString() === productId.toString());
    if (current) {
      for (const p of allProducts) {
        if (p._id.toString() === current._id.toString()) continue;

        if (p.category === current.category) addScore(p._id, 30, 'Same category');
        const sharedTags = (p.tags || []).filter((t) => (current.tags || []).includes(t));
        addScore(p._id, sharedTags.length * 10, 'Similar tags');

        const priceDiff = Math.abs(p.price - current.price) / current.price;
        if (priceDiff < 0.2) addScore(p._id, 15, 'Similar price range');
      }
    }
  }

  // User behavior: purchase history
  if (user?.purchaseHistory?.length) {
    const purchasedCategories = new Set();
    const purchasedTags = new Set();

    for (const item of user.purchaseHistory) {
      const prod = typeof item === 'object' ? item : allProducts.find((p) => p._id.toString() === item.toString());
      if (prod) {
        purchasedCategories.add(prod.category);
        (prod.tags || []).forEach((t) => purchasedTags.add(t));
      }
    }

    for (const p of allProducts) {
      const alreadyPurchased = user.purchaseHistory.some((h) => {
        const id = typeof h === 'object' ? h._id.toString() : h.toString();
        return id === p._id.toString();
      });
      if (alreadyPurchased) continue;

      if (purchasedCategories.has(p.category)) addScore(p._id, 25, 'Based on your purchases');
      const tagOverlap = (p.tags || []).filter((t) => purchasedTags.has(t)).length;
      addScore(p._id, tagOverlap * 8, 'Matches your interests');
    }
  }

  // User behavior: viewed products
  if (user?.viewedProducts?.length) {
    for (const viewed of user.viewedProducts) {
      const vProd = typeof viewed === 'object' ? viewed : allProducts.find((p) => p._id.toString() === viewed.toString());
      if (!vProd) continue;

      for (const p of allProducts) {
        if (p._id.toString() === vProd._id.toString()) continue;
        if (p.category === vProd.category) addScore(p._id, 12, 'Because you viewed similar items');
      }
    }
  }

  // Popularity boost (rating + reviews)
  for (const p of allProducts) {
    const popularity = p.rating * 5 + Math.min(p.numReviews, 50) * 0.5;
    addScore(p._id, popularity, p.rating >= 4 ? 'Highly rated' : null);
  }

  const excludeId = productId?.toString();
  const ranked = [...scores.entries()]
    .filter(([id]) => id !== excludeId)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit);

  return ranked.map(([id, data]) => {
    const product = allProducts.find((p) => p._id.toString() === id);
    return {
      ...product.toObject(),
      recommendationScore: Math.round(data.score),
      recommendationReason: data.reasons[0] || 'Popular choice',
    };
  });
}

export async function trackProductView(userId, productId) {
  if (!userId || !productId) return;

  const user = await User.findById(userId);
  if (!user) return;

  const viewed = user.viewedProducts.map(String);
  if (!viewed.includes(productId.toString())) {
    user.viewedProducts.unshift(productId);
    user.viewedProducts = user.viewedProducts.slice(0, 20);
    await user.save();
  }
}
