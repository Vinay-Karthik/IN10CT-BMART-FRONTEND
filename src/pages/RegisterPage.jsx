import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ShoppingBag } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.register({ 
        username: username.trim(), 
        email: email.trim(), 
        password, 
        fullName: fullName.trim(), 
        phoneNumber: phoneNumber.trim() 
      });
      if (res.success) {
        navigate(`/verify-otp?target=${encodeURIComponent(email)}`);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      if (err && err.data && typeof err.data === 'object') {
        const messages = Object.entries(err.data).map(([field, msg]) => `${field}: ${msg}`).join(' | ');
        setError(messages || err.message || 'Validation failed');
      } else {
        setError(err?.message || 'Registration error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', margin: '50px auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.8rem', fontWeight: '800' }}>
            <ShoppingBag size={32} color="#f08804" /> B-MART
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '8px' }}>Create Account</h2>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4 }}>
            <strong>Registration Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Your Name</label>
            <input
              type="text"
              placeholder="First and last name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Username (At least 3 characters)</label>
            <input
              type="text"
              placeholder="Unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Mobile Number (India)</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Password (At least 6 characters)</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-amber" style={{ padding: '12px', fontSize: '1rem' }}>
            {loading ? 'Creating Account...' : 'Continue & Verify OTP'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee', pt: '16px' }}>
          Already have an account? <Link to="/login" style={{ color: '#007185', fontWeight: '700' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
