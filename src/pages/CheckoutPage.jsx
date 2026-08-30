import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { orderApi, paymentApi } from '../api/shopApi';
import { clearCartState } from '../store/slices/cartSlice';
import { CreditCard, Banknote, ShieldCheck, AlertCircle } from 'lucide-react';
import RazorpayModal from '../components/RazorpayModal';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  const [address, setAddress] = useState('Flat 402, B-MART Heights, Outer Ring Road, Bengaluru, Karnataka - 560103');
  const [paymentMode, setPaymentMode] = useState('RAZORPAY'); // RAZORPAY or COD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // State for Razorpay Modal (with Coin movement animation)
  const [razorpayModalData, setRazorpayModalData] = useState(null); // { orderId, razorpayOrderId, amount }

  const codDeliveryFee = 49;
  const payableTotal = paymentMode === 'COD' ? totalAmount + codDeliveryFee : totalAmount;

  useEffect(() => {
    orderApi.getUserOrders().then(res => {
      if (res.success && Array.isArray(res.data)) {
        const uniqueAddresses = [...new Set(res.data.map(order => order.shippingAddress))].filter(Boolean);
        setSavedAddresses(uniqueAddresses.slice(0, 3));
      }
    }).catch(err => console.error(err));
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please provide a shipping address.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Create order on backend
      const backendPaymentMode = paymentMode === 'COD' ? 'COD' : 'RAZORPAY';
      const res = await orderApi.createOrder(address, backendPaymentMode);
      if (!res.success || !res.data) {
        setError(res.message || 'Failed to place order');
        setLoading(false);
        return;
      }

      const orderData = res.data;

      // If Cash on Delivery, complete flow immediately
      if (paymentMode === 'COD') {
        dispatch(clearCartState());
        navigate(`/order-confirmation/${orderData.orderId}`);
        return;
      }

      // If Razorpay Online Payment selected:
      // Trigger Razorpay Modal with 🪙 Coin Animation
      setRazorpayModalData({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        amount: totalAmount,
      });
      setLoading(false);
    } catch (err) {
      setError(err.message || 'An error occurred during checkout process');
      setLoading(false);
    }
  };

  // Complete Razorpay Payment Verification & Navigate
  const handleRazorpaySuccess = async (paymentDetails) => {
    if (!razorpayModalData && !paymentDetails?.targetOrderId) return;
    const targetOrderId = paymentDetails?.targetOrderId || razorpayModalData?.orderId;
    setLoading(true);

    try {
      const verifyRes = await paymentApi.verifyPayment({
        orderId: targetOrderId,
        razorpayOrderId: paymentDetails?.razorpayOrderId || razorpayModalData?.razorpayOrderId || `order_rzp_${Date.now()}`,
        razorpayPaymentId: paymentDetails?.razorpayPaymentId || `pay_rzp_${Date.now()}`,
        razorpaySignature: paymentDetails?.razorpaySignature || 'rzp_test_mock_signature',
      });

      if (verifyRes && (verifyRes.success === true || verifyRes.data === true || verifyRes === true)) {
        dispatch(clearCartState());
        setRazorpayModalData(null);
        navigate(`/order-confirmation/${targetOrderId}`);
      } else {
        setError(verifyRes?.message || 'Razorpay payment verification failed.');
        setRazorpayModalData(null);
      }
    } catch (err) {
      console.error('Razorpay verification error:', err);
      setError(err?.message || 'An error occurred during payment verification.');
      setRazorpayModalData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      {/* Steps Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <span style={{ color: 'var(--text-muted)' }}>01 Shopping Cart</span>
        <span style={{ color: 'var(--text-dark)', borderBottom: '2px solid var(--text-dark)', paddingBottom: '18px', marginBottom: '-21px' }}>02 Checkout Details</span>
        <span style={{ color: 'var(--text-muted)' }}>03 Order Complete</span>
      </div>

      <div className="split-layout">
        {/* Left Column: Form Info */}
        <div>
          <div style={{ background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              Checkout
            </h1>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid #ef4444', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder}>
              {/* Contact Details */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contact Information
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={user?.email || ''}
                  readOnly
                  style={{ background: 'var(--img-bg)', cursor: 'not-allowed' }}
                />
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Shipping Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                  placeholder="Full address details"
                />
                {savedAddresses.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>Recent Addresses:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {savedAddresses.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAddress(addr)}
                          style={{ textAlign: 'left', padding: '8px 12px', fontSize: '0.8rem', background: 'var(--img-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-dark)' }}
                        >
                          {addr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Payment Method
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Razorpay Online Payment Option */}
                  <div
                    onClick={() => setPaymentMode('RAZORPAY')}
                    style={{
                      border: `2px solid ${paymentMode === 'RAZORPAY' ? '#0284c7' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: paymentMode === 'RAZORPAY' ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'RAZORPAY'}
                      onChange={() => setPaymentMode('RAZORPAY')}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <CreditCard size={24} color="#0284c7" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        Razorpay Online Payment Gateway
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI (Google Pay, PhonePe, Paytm), Cards & NetBanking</div>
                    </div>
                  </div>

                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMode('COD')}
                    style={{
                      border: `2px solid ${paymentMode === 'COD' ? 'var(--text-dark)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: paymentMode === 'COD' ? 'var(--img-bg)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'COD'}
                      onChange={() => setPaymentMode('COD')}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    <Banknote size={24} color="var(--text-dark)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Cash on Delivery (COD)</span>
                        <span style={{ background: '#f59e0b', color: '#ffffff', fontSize: '0.65rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                          +₹49 DELIVERY FEE
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Pay with cash upon delivery (+₹49 delivery charge)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-amber"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <ShieldCheck size={20} />
                {loading
                  ? 'Processing Order...'
                  : paymentMode === 'COD'
                  ? `Place Order with COD (₹${payableTotal.toLocaleString('en-IN')})`
                  : 'Proceed to Pay with Razorpay'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div style={{ background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Order Items ({items?.length || 0})
            </h3>

            {/* Items Mini List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '48px', height: '48px', objectFit: 'contain', background: 'var(--img-bg)', borderRadius: 'var(--radius-sm)', padding: '4px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-dark)', flexShrink: 0 }}>
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Delivery / Handling:</span>
                {paymentMode === 'COD' ? (
                  <span style={{ color: '#d97706', fontWeight: '700' }}>+ ₹49.00 (COD Fee)</span>
                ) : (
                  <span style={{ color: '#007600', fontWeight: '700' }}>FREE</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                <span>Order Total:</span>
                <span>₹{payableTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Secure Checkout Seal */}
          <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} color="#0284c7" />
            <div style={{ fontSize: '0.75rem', textAlign: 'left' }}>
              <div style={{ fontWeight: '700' }}>Secure Checkout</div>
              <div style={{ color: 'var(--text-muted)' }}>Your payment information is fully encrypted and safe with us.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Modal with 🪙 Coin Animation */}
      {razorpayModalData && (
        <RazorpayModal
          orderData={razorpayModalData}
          amount={razorpayModalData.amount}
          user={user}
          onSuccess={handleRazorpaySuccess}
          onClose={() => setRazorpayModalData(null)}
        />
      )}
    </div>
  );
}
