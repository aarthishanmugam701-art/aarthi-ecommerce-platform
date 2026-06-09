import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const statusBadge = {
  pending: 'badge-warning',
  processing: 'badge-primary',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      API.get('/orders/myorders')
        .then(({ data }) => setOrders(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="container loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <h1 className="page-title">My Orders</h1>
      <p className="page-subtitle">Track your order history</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
              <span className={`badge ${statusBadge[order.status] || 'badge-primary'}`}>
                {order.status}
              </span>
            </div>
            <div className="order-date">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="order-items">
              {order.orderItems.map((item) => (
                <div key={item.product}>
                  {item.name} × {item.quantity}
                </div>
              ))}
            </div>
            <div className="order-footer">
              <span className={order.isPaid ? 'badge badge-success' : 'badge badge-warning'}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
              <span className="order-total">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
