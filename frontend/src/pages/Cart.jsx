import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  const tax = cartTotal * 0.1;
  const shipping = cartTotal > 100 ? 0 : cartTotal > 0 ? 10 : 0;
  const total = cartTotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container empty-state" style={{ paddingTop: '4rem' }}>
        <h3>Your cart is empty</h3>
        <p style={{ marginBottom: '1.5rem' }}>Add some products to get started</p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <span className="price">${item.price.toFixed(2)}</span>
                <div className="qty-selector" style={{ marginTop: '0.75rem', width: 'fit-content' }}>
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="cart-item-actions">
                <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-lg">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
