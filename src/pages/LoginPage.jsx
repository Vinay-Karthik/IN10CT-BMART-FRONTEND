import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../api/authApi';
import { cartApi } from '../api/shopApi';
import { setCredentials } from '../store/slices/authSlice';
import { setCart } from '../store/slices/cartSlice';
import { ShoppingBag, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState('password'); // 'password' or 'otp'
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpTarget, setOtpTarget] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role;
      if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        const targetPath = (redirect && redirect !== '/admin') ? redirect : '/';
        navigate(targetPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirect]);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const parseErrorMsg = (err, fallback) => {
    if (err && err.data && typeof err.data === 'object') {
      return Object.entries(err.data).map(([field, msg]) => `${field}: ${msg}`).join(' | ');
    }
    return err?.message || fallback;
  };

  const handlePostLoginSync = async (authData) => {
    const userRole = authData.role || authData.user?.role || '';
    if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
      setError('Access Denied: Admin accounts must log in via the Admin Portal at /admin');
      return;
    }

    dispatch(setCredentials(authData));

    // Sync guest cart items if present
    try {
      const guestItems = JSON.parse(localStorage.getItem('bmart_guest_cart') || '[]');
      if (Array.isArray(guestItems) && guestItems.length > 0) {
        for (const item of guestItems) {
          const prodId = item.product?.productId || item.productId;
          if (prodId) {
            await cartApi.addToCart(prodId, item.quantity || 1);
          }
        }
        localStorage.removeItem('bmart_guest_cart');
      }
      const cartRes = await cartApi.getCart();
      const cartObj = cartRes.data || cartRes;
      if (cartObj) dispatch(setCart(cartObj));
    } catch (e) {
      console.error('Error syncing guest cart:', e);
    }

    const targetPath = (redirect && redirect !== '/admin') ? redirect : '/';
    navigate(targetPath);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.login({ emailOrUsername: emailOrUsername.trim(), password });
      if (res.success && res.data) {
        await handlePostLoginSync(res.data);
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
    setSuccessMsg('');
    try {
      const res = await authApi.requestOtpLogin(otpTarget.trim());
      if (res.success) {
        setOtpSent(true);
        setSuccessMsg(`Security OTP code sent to ${otpTarget.trim()}`);
        setResendCountdown(30);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(parseErrorMsg(err, 'Error requesting OTP'));
    }
  };

  const handleResendOtpLogin = async () => {
    if (resendCountdown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);
    try {
      const res = await authApi.requestOtpLogin(otpTarget.trim());
      if (res.success) {
        setSuccessMsg('Security OTP code has been resent to your email address!');
        setResendCountdown(30);
      } else {
        setError(res.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(parseErrorMsg(err, 'Error resending OTP'));
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtpLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await authApi.verifyOtpLogin({ target: otpTarget.trim(), otp: otp.trim(), type: 'LOGIN' });
      if (res.success && res.data) {
        await handlePostLoginSync(res.data);
      } else {
        setError(res.message || 'OTP Verification failed');
      }
    } catch (err) {
      setError(parseErrorMsg(err, 'Invalid OTP'));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', margin: '60px auto', padding: '0 16px' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            <ShoppingBag size={32} color="#f08804" /> B-MART
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '8px', color: '#1e293b' }}>
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.4 }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <button
            onClick={() => { setMode('password'); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: mode === 'password' ? '3px solid #f08804' : 'none', fontWeight: mode === 'password' ? '700' : '400', cursor: 'pointer' }}
          >
            Password Login
          </button>
          <button
            onClick={() => { setMode('otp'); setError(''); setSuccessMsg(''); }}
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
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Password</label>
                <Link to="/forgot-password" style={{ color: '#007185', fontSize: '0.8rem' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 42px 12px 12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-amber" style={{ padding: '14px', fontSize: '1.05rem', fontWeight: '700' }}>Sign In</button>
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
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
                />
              </div>
              <button type="submit" className="btn-amber" style={{ padding: '14px', fontSize: '1.05rem', fontWeight: '700' }}>Get Security OTP</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Enter 6-digit OTP sent to {otpTarget}</label>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                  (Check your <strong>Spam / Junk</strong> or <strong>Promotions</strong> folder if not in Inbox)
                </div>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', outline: 'none' }}
                />
              </div>
              <button type="submit" className="btn-amber" style={{ padding: '14px', fontSize: '1.05rem', fontWeight: '700', width: '100%' }}>Verify & Sign In</button>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={handleResendOtpLogin}
                  disabled={resendCountdown > 0 || resending}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: resendCountdown > 0 ? '#94a3b8' : '#007185', 
                    cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer', 
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} className={resending ? 'spin' : ''} />
                  {resending ? 'Resending OTP...' : resendCountdown > 0 ? `Resend OTP code in ${resendCountdown}s` : "Didn't receive code? Resend OTP via Email"}
                </button>
              </div>
            </form>
          )
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '16px' }}>
          New to B-MART? <Link to="/register" style={{ color: '#007185', fontWeight: '700' }}>Create your account</Link>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
            B-MART System Administrator? <Link to="/admin" style={{ color: '#f59e0b', fontWeight: '700' }}>Sign in to Admin Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
