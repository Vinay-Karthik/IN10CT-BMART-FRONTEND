import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.resetPassword({ email, otp, newPassword });
      if (res.success) {
        alert('Password reset successful! Please sign in with your new password.');
        navigate('/login');
      } else {
        setError(res.message || 'Error resetting password');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', margin: '60px auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd', textAlign: 'center' }}>
        <Lock size={48} color="#f08804" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Create New Password</h2>
        <p style={{ color: '#555', fontSize: '0.85rem', margin: '8px 0 20px' }}>
          Enter the 6-digit OTP code sent to your email and your new password.
        </p>

        {error && <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleReset} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>6-Digit OTP</label>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>New Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-amber" style={{ padding: '12px', fontSize: '1rem' }}>
            {loading ? 'Saving...' : 'Reset Password & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
