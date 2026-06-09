import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, showRecommendation = false }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      {showRecommendation && product.recommendationReason && (
        <span className="recommendation-badge">✨ {product.recommendationReason}</span>
      )}
      <div className="product-card-image">
        <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} />
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-rating">
          ⭐ {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)
        </div>
        <div className="product-card-footer">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          <button className="btn btn-primary" onClick={handleAddToCart} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
