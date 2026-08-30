import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function OtpVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const target = searchParams.get('target') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.verifyOtp({ target, otp, type: 'REGISTRATION' });
      if (res.success && res.data) {
        dispatch(setCredentials(res.data));
        navigate('/');
      } else {
        setError(res.message || 'OTP Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setMsg('');
    setError('');
    setResending(true);
    try {
      const res = await authApi.resendOtp(target, 'REGISTRATION');
      if (res.success) {
        setMsg('Verification OTP code has been resent to your email address!');
        setCountdown(30);
      } else {
        setError(res.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Error resending OTP code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '420px', margin: '60px auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <ShieldCheck size={48} color="#f08804" style={{ margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Enter Verification Code</h2>
        <p style={{ color: '#555', fontSize: '0.9rem', margin: '8px 0 4px' }}>
          We sent a 6-digit verification code to <strong>{target}</strong>
        </p>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '18px' }}>
          (If not in your Inbox, please check your <strong>Spam / Junk</strong> or <strong>Promotions</strong> folder)
        </p>

        {error && <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}
        {msg && <div style={{ background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>{msg}</div>}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '6px', fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px' }}
          />

          <button type="submit" disabled={loading} className="btn-amber" style={{ padding: '12px', fontSize: '1rem', width: '100%' }}>
            {loading ? 'Verifying...' : 'Verify OTP & Continue'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <button 
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: countdown > 0 ? '#94a3b8' : '#007185', 
              cursor: countdown > 0 ? 'not-allowed' : 'pointer', 
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={16} className={resending ? 'spin' : ''} />
            {resending ? 'Resending OTP...' : countdown > 0 ? `Resend OTP code in ${countdown}s` : "Didn't receive code? Resend OTP via Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
