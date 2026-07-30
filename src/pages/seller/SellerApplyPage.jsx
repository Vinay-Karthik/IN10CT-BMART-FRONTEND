import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../../api/sellerApi';
import { Store, ShieldCheck, CheckCircle } from 'lucide-react';

export default function SellerApplyPage() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);

    sellerApi.applySeller({
      storeName: storeName.trim(),
      storeDescription: storeDescription.trim(),
      logoUrl: logoUrl.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined
    })
      .then(res => {
        if (res.success) {
          setMsg('Application submitted successfully! Your account will be reviewed by B-MART Admin.');
          setTimeout(() => navigate('/seller/products'), 2000);
        } else {
          setError(res.message);
        }
      })
      .catch(err => setError(err?.message || 'Error submitting application'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <div style={{ background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #ddd' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff8e7', color: '#f08804', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Store size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Become a B-MART Seller</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '6px' }}>Start selling your products to millions of B-MART customers today.</p>
        </div>

        {msg && (
          <div style={{ background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} /> {msg}
          </div>
        )}

        {error && (
          <div style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="e.g. Royal Leather Crafts"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Store Description</label>
            <textarea
              rows={3}
              value={storeDescription}
              onChange={e => setStoreDescription(e.target.value)}
              placeholder="Tell buyers about your brand and products..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Logo Image URL (Optional)</label>
              <input
                type="text"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.jpg"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div>
              <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Banner Image URL (Optional)</label>
              <input
                type="text"
                value={bannerUrl}
                onChange={e => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-amber" style={{ padding: '12px', fontSize: '1rem' }}>
            {loading ? 'Submitting Application...' : 'Submit Seller Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
