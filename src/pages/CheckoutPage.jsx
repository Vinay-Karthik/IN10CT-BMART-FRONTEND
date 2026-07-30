import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { orderApi } from '../api/shopApi';
import { clearCartState } from '../store/slices/cartSlice';
import { CreditCard, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  const [address, setAddress] = useState('Flat 402, B-MART Heights, Outer Ring Road, Bengaluru, Karnataka - 560103');
  const [loading, setLoading] = useState(false);

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
      const res = await orderApi.createOrder(address);
      if (!res.success || !res.data) {
        alert(res.message || 'Failed to place order');
        setLoading(false);
        return;
      }

      const orderData = res.data;
      const razorpayOrderId = orderData.razorpayOrderId;

      // 2. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay) {
        const options = {
          key: 'rzp_test_BMartDummyKey123',
          amount: Math.round(orderData.totalAmount * 100),
          currency: 'INR',
          name: 'B-MART E-Commerce',
          description: `Order #${orderData.orderId}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            // 3. Verify Payment Signature
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
        // Fallback demo payment completion if external Razorpay script is blocked or offline
        const mockVerify = await orderApi.verifyPayment({
          orderId: orderData.orderId,
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: 'pay_mock_' + Date.now(),
          razorpaySignature: 'mock_valid_signature',
        });

        if (mockVerify.success) {
          dispatch(clearCartState());
          navigate(`/order-confirmation/${orderData.orderId}`);
        } else {
          navigate('/payment-failure');
        }
      }
    } catch (err) {
      alert(err.message || 'Error during checkout process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', borderBottom: '1px solid #eee', pb: '14px', marginBottom: '20px' }}>
          Checkout & Payment
        </h1>

        <form onSubmit={handlePlaceOrder}>
          {/* Shipping Address */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: '700', fontSize: '1rem', display: 'block', marginBottom: '8px' }}>
              1. Delivery Shipping Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem' }}
            />
          </div>

          {/* Payment Method Option */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: '700', fontSize: '1rem', display: 'block', marginBottom: '8px' }}>
              2. Payment Gateway
            </label>
            <div style={{ border: '2px solid #007185', padding: '16px', borderRadius: '10px', background: '#f0f8ff', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditCard size={24} color="#007185" />
              <div>
                <div style={{ fontWeight: '700' }}>Razorpay Payment Gateway</div>
                <div style={{ fontSize: '0.85rem', color: '#555' }}>Supports UPI (GPay, PhonePe), Credit/Debit Cards, NetBanking, Wallets</div>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Items Total ({items.length}):</span>
              <span style={{ fontWeight: '700' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Delivery Charges:</span>
              <span style={{ color: 'green', fontWeight: '700' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', pt: '8px', fontSize: '1.2rem', fontWeight: '800' }}>
              <span>Order Total:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-amber"
            style={{ padding: '14px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <ShieldCheck size={20} />
            {loading ? 'Processing Order...' : 'Pay with Razorpay & Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
