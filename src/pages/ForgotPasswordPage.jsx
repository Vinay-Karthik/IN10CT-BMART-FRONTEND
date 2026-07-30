import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      if (res.success) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.message || 'Error processing request');
      }
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', margin: '60px auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd', textAlign: 'center' }}>
        <KeyRound size={48} color="#f08804" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Password Assistance</h2>
        <p style={{ color: '#555', fontSize: '0.85rem', margin: '8px 0 20px' }}>
          Enter the email address associated with your B-MART account.
        </p>

        {error && <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-amber" style={{ padding: '12px', fontSize: '1rem' }}>
            {loading ? 'Sending OTP...' : 'Send Password Reset OTP'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '0.85rem' }}>
          Remember your password? <Link to="/login" style={{ color: '#007185', fontWeight: '700' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
