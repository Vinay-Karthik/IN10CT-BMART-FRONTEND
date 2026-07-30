import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../api/shopApi';
import { CheckCircle2, Package, Truck } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.getOrderById(orderId).then(res => {
      if (res.success) setOrder(res.data);
    });
  }, [orderId]);

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #ddd', textAlign: 'center' }}>
        <CheckCircle2 size={64} color="#2e7d32" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ color: '#2e7d32', fontSize: '2rem', fontWeight: '800' }}>Order Confirmed & Placed!</h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '1rem' }}>
          Thank you for shopping with B-MART. Your order reference ID is <strong>#{orderId}</strong>.
        </p>

        {order && (
          <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px', margin: '30px 0', textAlign: 'left' }}>
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
