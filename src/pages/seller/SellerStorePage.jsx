import React, { useEffect, useState } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { Store, Globe, CheckCircle, Edit } from 'lucide-react';

export default function SellerStorePage() {
  const [profile, setProfile] = useState(null);
  const [storeDescription, setStoreDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sellerApi.getSellerProfile().then(res => {
      if (res.success && res.data) {
        const s = res.data;
        setProfile(s);
        setStoreDescription(s.storeDescription || '');
        setLogoUrl(s.logoUrl || '');
        setBannerUrl(s.bannerUrl || '');
        setStoreSlug(s.storeSlug || '');
      }
    });
  }, []);

  const handleSaveStore = (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    sellerApi.updateStore({ storeDescription, logoUrl, bannerUrl, storeSlug })
      .then(res => {
        if (res.success) {
          setProfile(res.data);
          setMsg('Store details updated successfully!');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Storefront Management</h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>Customize your public vendor store profile and URL slug.</p>
        </div>
        {profile && (
          <a href={`/store/${profile.storeSlug}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#007185', fontWeight: '700', textDecoration: 'none' }}>
            <Globe size={18} /> View Public Storefront
          </a>
        )}
      </div>

      {msg && <div style={{ background: '#f0fff4', color: '#276749', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontWeight: '700' }}>{msg}</div>}

      <form onSubmit={handleSaveStore}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Store URL Slug</label>
          <input
            type="text"
            value={storeSlug}
            onChange={e => setStoreSlug(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <span style={{ fontSize: '0.75rem', color: '#777' }}>Public URL: http://localhost:3000/store/{storeSlug}</span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Store Description</label>
          <textarea
            rows={4}
            value={storeDescription}
            onChange={e => setStoreDescription(e.target.value)}
            placeholder="Describe your brand, products, and story..."
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Logo URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.jpg"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Banner URL</label>
            <input
              type="text"
              value={bannerUrl}
              onChange={e => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-amber" style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
          {loading ? 'Saving Store...' : 'Save Store Changes'}
        </button>
      </form>
    </div>
  );
}
