import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { ShieldCheck, Truck, RotateCcw, CreditCard, Star, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.getCategories(),
      productApi.getProducts({ size: 8 })
    ]).then(([catRes, prodRes]) => {
      if (catRes.success) setCategories(catRes.data);
      if (prodRes.success) setFeaturedProducts(prodRes.data.content || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-wrapper">
        <div className="hero-info animate-fade-up">
          <span className="hero-subtitle">
            New Collection
          </span>
          <h1 className="hero-heading">
            Carry Your<br/>Style Everywhere
          </h1>
          <p className="hero-description">
            Discover our new collection of premium bags designed for every occasion, combining modern practicality with sophisticated design.
          </p>
          <div>
            <Link to="/products" className="hero-cta-btn">
              Shop Now
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-container animate-float">
            {/* Glass badges */}
            <div className="hero-badge-glass" style={{ top: '15px', left: '-20px' }}>
              <Sparkles size={14} color="var(--text-dark)" />
              <span>Premium Quality</span>
            </div>
            <div className="hero-badge-glass" style={{ bottom: '30px', right: '-20px' }}>
              <Star size={14} fill="currentColor" color="var(--text-dark)" />
              <span>4.9 rated</span>
            </div>
            <img src="/uploads/handbags/handbag3.jpg" alt="Hero Bag" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      </div>

      {/* Feature Badges */}
      <div className="feature-section">
        <div className="feature-inner-grid">
          <div className="feature-item-card">
            <div className="feature-icon-box">
              <Truck size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Free Shipping</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On orders over ₹499</div>
            </div>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-box">
              <RotateCcw size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Easy Returns</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>10-day return policy</div>
            </div>
          </div>

          <div className="feature-item-card">
            <div className="feature-icon-box">
              <ShieldCheck size={22} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Secure Checkout</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100% secure payment methods</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Categories Section */}
        <div style={{ margin: '60px 0 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.8px' }}>
            Shop by Category
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '40px' }}>
            Explore curated collections designed specifically for your style.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {(categories.length >= 4 ? categories.slice(0, 4) : [
              { categoryId: 1, categoryName: 'Handbags & Purses' },
              { categoryId: 2, categoryName: 'Backpacks & Travel' },
              { categoryId: 3, categoryName: 'Tech & Laptop Bags' },
              { categoryId: 4, categoryName: 'Fashion Accessories' }
            ]).map((cat, idx) => (
              <Link 
                key={cat.categoryId || idx} 
                to={`/products?categoryId=${cat.categoryId}`}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  fontWeight: '800',
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cat.categoryName}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div style={{ margin: '100px 0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.8px' }}>
                Featured Collections
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Handpicked premium designs, trending this season.
              </p>
            </div>
            <Link to="/products" style={{ color: 'var(--text-dark)', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'underline', paddingBottom: '4px' }}>
              See all products
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading products...</div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Secondary Banner */}
        <div className="secondary-banner-grid">
          <div className="secondary-banner-content">
            <span style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Premium Quality
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '14px 0 16px', letterSpacing: '-1px', color: 'var(--text-dark)', lineHeight: '1.2' }}>
              Crafted for You
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '420px', lineHeight: '1.6' }}>
              Elevate your everyday style with bags crafted from premium, long-lasting materials and designed for ultimate function.
            </p>
            <Link to="/products" className="btn-primary" style={{ padding: '14px 36px', fontSize: '0.85rem', width: 'auto', display: 'inline-block', borderRadius: '4px' }}>
              Explore Collection
            </Link>
          </div>
          <div className="secondary-banner-image-box">
            <img src="/uploads/handbags/handbag2.jpg" alt="Crafted Bag" className="secondary-banner-image" />
          </div>
        </div>

        {/* Newsletter Subscription Box */}
        <div className="newsletter-section">
          <h2 className="newsletter-title">Stay in Style</h2>
          <p className="newsletter-desc">
            Subscribe to our newsletter to receive access to exclusive collections, design releases, and special member offers.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to B-MART!'); }} className="newsletter-form">
            <input type="email" placeholder="Enter your email address" className="newsletter-input" required />
            <button type="submit" className="btn-primary newsletter-btn">Subscribe</button>
          </form>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '40px', marginTop: '80px', textAlign: 'center' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Premium Quality</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Finest materials & craftsmanship</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stylish Designs</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>For every modern lifestyle</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Support</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>We are always here to help you</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Secure Shopping</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Your data is completely safe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
