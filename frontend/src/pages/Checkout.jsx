import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm({ orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/orders' },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      await API.put(`/orders/${orderId}/pay`, {
        id: paymentIntent.id,
        status: paymentIntent.status,
        email: paymentIntent.receipt_email,
      });
      onSuccess();
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</div>}
      <button
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [step, setStep] = useState('shipping');
  const [error, setError] = useState('');

  const tax = cartTotal * 0.1;
  const shippingCost = cartTotal > 100 ? 0 : 10;
  const total = cartTotal + tax + shippingCost;

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      const { data: order } = await API.post('/orders', {
        orderItems,
        shippingAddress: shipping,
      });

      const { data: payment } = await API.post(`/orders/${order._id}/pay`);
      setClientSecret(payment.clientSecret);
      setOrderId(order._id);
      setStep('payment');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/orders');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <div>
          {step === 'shipping' ? (
            <form className="checkout-form" onSubmit={handleShippingSubmit}>
              <h3>Shipping Address</h3>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  className="form-control"
                  required
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    className="form-control"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    id="postalCode"
                    className="form-control"
                    required
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  className="form-control"
                  required
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Continue to Payment
              </button>
            </form>
          ) : (
            <div className="checkout-form">
              <h3>Payment</h3>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm orderId={orderId} onSuccess={handlePaymentSuccess} />
                </Elements>
              )}
            </div>
          )}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="summary-row">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
