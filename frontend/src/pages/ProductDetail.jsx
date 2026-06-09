import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);

        if (user) {
          API.post(`/recommendations/track/${id}`).catch(() => {});
        }

        const recs = await API.get(`/recommendations?productId=${id}&limit=4`);
        setRecommendations(recs.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user]);

  if (loading) {
    return (
      <div className="container loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container empty-state">
        <h3>Product not found</h3>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-info">
          <span className="badge badge-primary">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-detail-meta">
            <span>⭐ {product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>
          <div className="product-detail-price">${product.price.toFixed(2)}</div>
          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-actions">
            <div className="qty-selector">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => addToCart(product, qty)}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>

          <p className={`stock-info ${product.stock <= 10 ? 'low' : ''}`}>
            {product.stock === 0
              ? 'Out of stock'
              : product.stock <= 10
              ? `Only ${product.stock} left in stock!`
              : `${product.stock} in stock`}
          </p>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="recommendations-section">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>✨ You May Also Like</h2>
          <div className="grid grid-4">
            {recommendations.map((p) => (
              <ProductCard key={p._id} product={p} showRecommendation />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
