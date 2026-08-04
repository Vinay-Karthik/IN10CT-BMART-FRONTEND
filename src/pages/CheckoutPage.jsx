import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { orderApi } from '../api/shopApi';
import { clearCartState } from '../store/slices/cartSlice';
import { CreditCard, ShieldCheck, Landmark, Smartphone, X, Check } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  const [address, setAddress] = useState('Flat 402, B-MART Heights, Outer Ring Road, Bengaluru, Karnataka - 560103');
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('RAZORPAY');
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    orderApi.getUserOrders().then(res => {
      if (res.success && Array.isArray(res.data)) {
        const uniqueAddresses = [...new Set(res.data.map(order => order.shippingAddress))].filter(Boolean);
        setSavedAddresses(uniqueAddresses.slice(0, 3));
      }
    }).catch(err => console.error(err));
  }, []);
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await orderApi.createOrder(address, paymentMode);
      if (!res.success || !res.data) {
        alert(res.message || 'Failed to place order');
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

      const razorpayOrderId = orderData.razorpayOrderId;

      // 2. Fetch Razorpay key from backend
      let razorpayKey = 'rzp_test_BMartDummyKey123';
      try {
        const keyRes = await orderApi.getRazorpayKey();
        if (keyRes.success && keyRes.data) {
          razorpayKey = keyRes.data;
        }
      } catch (keyErr) {
        console.warn('Could not fetch Razorpay key from backend, using fallback.', keyErr);
      }

      // 3. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay) {
        const options = {
          key: razorpayKey,
          amount: Math.round(orderData.totalAmount * 100),
          currency: 'INR',
          name: 'B-MART E-Commerce',
          description: `Order #${orderData.orderId}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            // 4. Verify Payment Signature
            const verifyRes = await orderApi.verifyPayment({
              orderId: orderData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              dispatch(clearCartState());
              navigate(`/order-confirmation/${orderData.orderId}`);
            } else {
              navigate('/payment-failure');
            }
          },
          prefill: {
            name: user?.fullName || user?.username,
            email: user?.email,
            contact: user?.phoneNumber || '9999999999',
          },
          theme: {
            color: '#131921',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          navigate('/payment-failure');
        });
        rzp.open();
      } else {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
      }
    } catch (err) {
      alert(err.message || 'Error during checkout process');
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
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select from Recently Used Addresses:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {savedAddresses.map((addr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAddress(addr)}
                        style={{
                          textAlign: 'left',
                          background: address === addr ? 'var(--nav-light)' : 'transparent',
                          border: '1px solid var(--border-color)',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          color: 'var(--text-dark)',
                          transition: 'all 0.2s ease',
                          width: '100%'
                        }}
                      >
                        {addr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Payment Method
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Razorpay Option */}
                <div 
                  onClick={() => setPaymentMode('RAZORPAY')}
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    padding: '16px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: paymentMode === 'RAZORPAY' ? 'var(--nav-light)' : 'transparent', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="radio" 
                    checked={paymentMode === 'RAZORPAY'} 
                    onChange={() => setPaymentMode('RAZORPAY')} 
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <CreditCard size={18} color="var(--text-dark)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Pay online with Razorpay</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPI, Cards, NetBanking, Wallets</div>
                  </div>
                </div>

                {/* COD Option */}
                <div 
                  onClick={() => setPaymentMode('COD')}
                  style={{ 
                    border: '1px solid var(--border-color)', 
                    padding: '16px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: paymentMode === 'COD' ? 'var(--nav-light)' : 'transparent', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="radio" 
                    checked={paymentMode === 'COD'} 
                    onChange={() => setPaymentMode('COD')} 
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '18px', fontWeight: 'bold', width: '18px', textAlign: 'center', color: 'var(--text-dark)' }}>₹</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay at your doorstep</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-amber"
              style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ShieldCheck size={18} />
              {loading ? 'Processing Order...' : (paymentMode === 'COD' ? 'Place COD Order' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`)}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Order summary with item list thumbnails */}
      <div>
        <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Details</h3>

          {/* List thumbnails */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '280px', overflowY: 'auto', paddingRight: '6px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--img-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={item.product.imageUrl} alt={item.product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
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
              <span>₹{(totalAmount * 0.9).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Tax (10%):</span>
              <span>₹{(totalAmount * 0.1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '1rem', fontWeight: '800', color: 'var(--text-dark)' }}>
              <span>Order Total:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Secure Checkout Seal */}
        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="var(--text-dark)" />
          <div style={{ fontSize: '0.75rem', textAlign: 'left' }}>
            <div style={{ fontWeight: '700' }}>Secure Checkout</div>
            <div style={{ color: 'var(--text-muted)' }}>Your payment information is fully encrypted and safe with us.</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
