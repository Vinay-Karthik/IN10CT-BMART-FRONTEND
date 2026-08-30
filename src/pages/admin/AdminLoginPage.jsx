import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { ShieldCheck, Lock, Eye, EyeOff, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as Admin, redirect directly to /admin
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role;
      if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({
        emailOrUsername: emailOrUsername.trim(),
        password: password
      });

      if (res.success && res.data) {
        const userRole = res.data.role || res.data.user?.role || '';
        if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
          dispatch(setCredentials(res.data));
          navigate('/admin', { replace: true });
        } else {
          setError('Access Denied: This portal is restricted to B-MART System Administrators.');
        }
      } else {
        setError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Admin Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: '36px 32px 28px',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={36} color="#ffffff" />
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#f59e0b',
            marginBottom: '4px'
          }}>
            B-MART Management Portal
          </div>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            margin: '0',
            color: '#ffffff',
            letterSpacing: '-0.5px'
          }}>
            Administrator Sign In
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: '#94a3b8',
            marginTop: '6px',
            marginBottom: '0'
          }}>
            Authorized system operations & dashboard access
          </p>
        </div>

        {/* Login Form Body */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              lineHeight: 1.4
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: '#334155',
                marginBottom: '8px'
              }}>
                Admin Username or Email
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter admin username or email"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  background: '#f8fafc'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontWeight: '700',
                fontSize: '0.85rem',
                color: '#334155',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    background: '#f8fafc'
                  }}
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
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
                transition: 'transform 0.1s, opacity 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  Log In to Admin Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            Not an Administrator? <Link to="/" style={{ color: '#007185', fontWeight: '700' }}>Return to B-MART Storefront</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
