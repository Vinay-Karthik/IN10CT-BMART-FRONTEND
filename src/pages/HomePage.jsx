import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

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
      <div style={{
        background: 'linear-gradient(135deg, #131921 0%, #232f3e 60%, #37475a 100%)',
        color: 'white', padding: '60px 20px', textAlign: 'center', position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ background: '#febd69', color: '#111', fontWeight: '800', fontSize: '0.8rem', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
            Exclusive Collection 2026
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '16px 0 10px', letterSpacing: '-1px' }}>
            Premium Backpacks, Handbags & Travel Luggage
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#ccc', marginBottom: '24px' }}>
            Discover India’s finest bag collections. Free shipping on all orders over ₹499.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link to="/products" className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem', width: 'auto' }}>
              Explore Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Badges */}
      <div style={{ background: 'white', borderBottom: '1px solid #ddd', padding: '20px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Truck size={28} color="#007185" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Fast Delivery</div>
              <div style={{ fontSize: '0.8rem', color: '#565959' }}>Ships in 24 hours</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <ShieldCheck size={28} color="#007185" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>100% Genuine</div>
              <div style={{ fontSize: '0.8rem', color: '#565959' }}>Direct brand warranty</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <RotateCcw size={28} color="#007185" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Easy 10-Day Returns</div>
              <div style={{ fontSize: '0.8rem', color: '#565959' }}>No questions asked</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <CreditCard size={28} color="#007185" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Secure Payments</div>
              <div style={{ fontSize: '0.8rem', color: '#565959' }}>Razorpay & UPI Protected</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Categories Section */}
        <div style={{ margin: '40px 0 20px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '20px' }}>
            Shop by Category
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {categories.map((cat) => (
              <Link 
                key={cat.categoryId} 
                to={`/products?categoryId=${cat.categoryId}`}
                style={{
                  background: 'white', borderRadius: '12px', overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s',
                  display: 'flex', flexDirection: 'column', height: '220px'
                }}
              >
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <img src={cat.imageUrl} alt={cat.categoryName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px', textAlign: 'center', fontWeight: '700', fontSize: '1rem', background: '#fff' }}>
                  {cat.categoryName}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div style={{ margin: '50px 0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>
              Featured Bag Collections
            </h2>
            <Link to="/products" style={{ color: '#007185', fontWeight: '600' }}>See all products →</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
