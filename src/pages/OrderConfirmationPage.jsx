import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { orderApi } from '../api/shopApi';
import { clearCartState } from '../store/slices/cartSlice';
import { CheckCircle2, Package, Truck } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    orderApi.getOrderById(orderId).then(res => {
      if (res.success) {
        setOrder(res.data);
        dispatch(clearCartState());
      }
    });
  }, [orderId, dispatch]);

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      {/* Steps Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <span style={{ color: 'var(--text-muted)' }}>01 Shopping Cart</span>
        <span style={{ color: 'var(--text-muted)' }}>02 Checkout Details</span>
        <span style={{ color: 'var(--text-dark)', borderBottom: '2px solid var(--text-dark)', paddingBottom: '18px', marginBottom: '-21px' }}>03 Order Complete</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <CheckCircle2 size={64} color="#2e7d32" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ color: '#2e7d32', fontSize: '2rem', fontWeight: '800' }}>Order Confirmed & Placed!</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '1rem' }}>
          Thank you for shopping with B-MART. Your order reference ID is <strong>#{orderId}</strong>.
        </p>

        {order && (
          <div style={{ background: 'var(--body-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', margin: '30px 0', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Order Details</h3>
            <p><strong>Status:</strong> <span style={{ color: '#007185', fontWeight: '700' }}>{order.status}</span></p>
            <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
            <p style={{ marginTop: '8px' }}><strong>Shipping Address:</strong> {order.shippingAddress}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/profile?tab=orders" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
            <Package size={16} /> Track Orders
          </Link>
          <Link to="/products" className="btn-amber" style={{ width: 'auto', padding: '10px 24px' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
