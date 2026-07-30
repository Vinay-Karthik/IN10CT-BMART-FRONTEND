import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mode, setMode] = useState('password'); // 'password' or 'otp'
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpTarget, setOtpTarget] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const parseErrorMsg = (err, fallback) => {
    if (err && err.data && typeof err.data === 'object') {
      return Object.entries(err.data).map(([field, msg]) => `${field}: ${msg}`).join(' | ');
    }
    return err?.message || fallback;
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.login({ emailOrUsername: emailOrUsername.trim(), password });
      if (res.success && res.data) {
        dispatch(setCredentials(res.data));
        navigate('/');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(parseErrorMsg(err, 'Invalid credentials'));
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.requestOtpLogin(otpTarget.trim());
      if (res.success) {
        setOtpSent(true);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(parseErrorMsg(err, 'Error requesting OTP'));
    }
  };

  const handleVerifyOtpLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.verifyOtpLogin({ target: otpTarget.trim(), otp: otp.trim(), type: 'LOGIN' });
      if (res.success && res.data) {
        dispatch(setCredentials(res.data));
        navigate('/');
      } else {
        setError(res.message || 'OTP Verification failed');
      }
    } catch (err) {
      setError(parseErrorMsg(err, 'Invalid OTP'));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', margin: '60px auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.8rem', fontWeight: '800' }}>
            <ShoppingBag size={32} color="#f08804" /> B-MART
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '8px' }}>Sign in to your account</h2>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <button
            onClick={() => { setMode('password'); setError(''); }}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: mode === 'password' ? '3px solid #f08804' : 'none', fontWeight: mode === 'password' ? '700' : '400', cursor: 'pointer' }}
          >
            Password Login
          </button>
          <button
            onClick={() => { setMode('otp'); setError(''); }}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: mode === 'otp' ? '3px solid #f08804' : 'none', fontWeight: mode === 'otp' ? '700' : '400', cursor: 'pointer' }}
          >
            OTP Login
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Email or Username</label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Password</label>
                <Link to="/forgot-password" style={{ color: '#007185', fontSize: '0.8rem' }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <button type="submit" className="btn-amber" style={{ padding: '12px', fontSize: '1rem' }}>Sign In</button>
          </form>
        ) : (
          !otpSent ? (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Email or Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter email or phone"
                  value={otpTarget}
                  onChange={(e) => setOtpTarget(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>
              <button type="submit" className="btn-amber" style={{ padding: '12px', fontSize: '1rem' }}>Get Security OTP</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Enter 6-digit OTP sent to {otpTarget}</label>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                />
              </div>
              <button type="submit" className="btn-amber" style={{ padding: '12px', fontSize: '1rem' }}>Verify & Sign In</button>
            </form>
          )
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee', pt: '16px' }}>
          New to B-MART? <Link to="/register" style={{ color: '#007185', fontWeight: '700' }}>Create your account</Link>
        </div>
      </div>
    </div>
  );
}
