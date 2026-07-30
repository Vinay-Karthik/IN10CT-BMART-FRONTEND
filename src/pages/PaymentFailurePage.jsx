import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  return (
    <div className="container" style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #ddd' }}>
        <XCircle size={64} color="#e53e3e" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ color: '#e53e3e', fontSize: '1.8rem', fontWeight: '800' }}>Payment Failed</h1>
        <p style={{ color: '#666', margin: '12px 0 24px' }}>
          Your payment transaction could not be processed. Your card or account was not charged.
        </p>
        <Link to="/cart" className="btn-amber" style={{ width: 'auto', padding: '10px 28px', display: 'inline-block' }}>
          Return to Cart & Retry
        </Link>
      </div>
    </div>
  );
}
