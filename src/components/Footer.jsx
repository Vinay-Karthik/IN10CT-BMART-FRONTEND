import React from 'react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ marginTop: '60px', background: '#232f3e', color: 'white' }}>
      <button 
        onClick={scrollToTop}
        style={{
          width: '100%', background: '#37475a', border: 'none', color: 'white',
          padding: '14px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'
        }}
      >
        Back to top
      </button>

      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '40px 20px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px',
        fontSize: '0.85rem'
      }}>
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: 'white' }}>Get to Know Us</h4>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>About B-MART</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Careers</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Press Releases</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>B-MART Science</p>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: 'white' }}>Connect with Us</h4>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Facebook</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Twitter</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Instagram</p>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: 'white' }}>Make Money with Us</h4>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Sell on B-MART</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Protect and Build Your Brand</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>B-MART Global Selling</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Become an Affiliate</p>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: 'white' }}>Let Us Help You</h4>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>COVID-19 and B-MART</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Your Account</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Returns Centre</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>100% Purchase Protection</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>B-MART App Download</p>
          <p style={{ color: '#ccc', marginBottom: '8px' }}>Help</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #37475a', padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#ccc' }}>
        <p>© 2026 B-MART.in, Inc. or its affiliates. All rights reserved.</p>
      </div>
    </footer>
  );
}
