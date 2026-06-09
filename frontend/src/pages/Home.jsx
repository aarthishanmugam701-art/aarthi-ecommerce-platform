import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, recsRes] = await Promise.all([
          API.get('/products?sort=rating&limit=4'),
          API.get('/recommendations?limit=4'),
        ]);
        setFeatured(productsRes.data.products);
        setRecommendations(recsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-content">
          <h1>Discover Amazing Products</h1>
          <p>
            Shop the latest trends with AI-powered recommendations tailored just for you.
          </p>
          <Link to="/products" className="btn btn-lg">
            Shop Now
          </Link>
        </div>
      </section>

      <div className="container">
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On orders over $100</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>Powered by Stripe</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>AI Recommendations</h3>
            <p>Personalized for you</p>
          </div>
        </div>

        {recommendations.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2>✨ Recommended For You</h2>
              <Link to="/products">View All →</Link>
            </div>
            <div className="grid grid-4">
              {recommendations.map((product) => (
                <ProductCard key={product._id} product={product} showRecommendation />
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: '3rem' }}>
          <div className="section-header">
            <h2>Top Rated Products</h2>
            <Link to="/products">View All →</Link>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : (
            <div className="grid grid-4">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
