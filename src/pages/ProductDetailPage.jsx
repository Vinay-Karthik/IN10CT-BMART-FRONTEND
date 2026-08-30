import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productApi } from '../api/productApi';
import { cartApi, reviewApi, wishlistApi } from '../api/shopApi';
import { setCart, addToCartLocal } from '../store/slices/cartSlice';
import { Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, Check, Bell } from 'lucide-react';
import CustomerReviews from '../components/CustomerReviews';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getProductById(id).then(res => {
      if (res.success) setProduct(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    reviewApi.getProductReviews(id).then(res => {
      if (res.success) setReviews(res.data);
    });

    if (isAuthenticated) {
      wishlistApi.checkWishlist(id).then(res => {
        if (res.success) setIsWishlisted(res.data);
      });
    }
  }, [id, isAuthenticated]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    cartApi.addToCart(product.productId, quantity).then(res => {
      const cartObj = res.data || res;
      if (cartObj) {
        dispatch(setCart(cartObj));
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }).catch(err => {
      if (err?.status === 401 || err?.message?.includes('unauthenticated') || err?.message?.includes('expired')) {
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        alert(err?.message || 'Failed to add product to cart');
      }
    });
  };

  const handleNotifyMe = () => {
    setNotified(true);
    alert(`Notification set! We'll notify you as soon as "${product?.name}" is back in stock.`);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    wishlistApi.toggleWishlist(product.productId).then(res => {
      if (res.success) setIsWishlisted(res.data);
    });
  };

  const handleAddReview = async (reviewData) => {
    const res = await reviewApi.addReview({
      productId: product.productId,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    if (res.success) {
      reviewApi.getProductReviews(id).then(r => setReviews(r.data));
    }
    return res;
  };

  const renderAmazonDescription = (desc) => {
    if (!desc) return null;
    if (desc.includes('•')) {
      const bullets = desc.split('•').map(b => b.trim()).filter(Boolean);
      return (
        <ul style={{ paddingLeft: '18px', margin: '14px 0', lineHeight: 1.6, fontSize: '0.92rem', color: '#333' }}>
          {bullets.map((bullet, idx) => (
            <li key={idx} style={{ marginBottom: '6px' }}>{bullet}</li>
          ))}
        </ul>
      );
    }
    return <p style={{ color: '#333', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>{desc}</p>;
  };

  if (loading) return <div className="container" style={{ padding: '60px', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return <div className="container" style={{ padding: '60px', textAlign: 'center' }}>Product not found</div>;

  const stock = product.stock != null ? product.stock : 10;
  const isOutOfStock = stock <= 0;

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Product Image */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={handleToggleWishlist}
            style={{
              position: 'absolute', top: '10px', right: '10px', background: 'white',
              border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <Heart size={20} fill={isWishlisted ? "#e53e3e" : "none"} color={isWishlisted ? "#e53e3e" : "#666"} />
          </button>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '12px' }}
            onError={(e) => {
              const t = (product.name || '').toLowerCase();
              let fallback = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80';
              if (t.includes('backpack') || t.includes('rucksack') || t.includes('bag') || t.includes('tourist') || t.includes('travel')) {
                fallback = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80';
              } else if (t.includes('shoe') || t.includes('sneaker') || t.includes('nike') || t.includes('footwear')) {
                fallback = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
              } else if (t.includes('headphone') || t.includes('earphone') || t.includes('audio') || t.includes('sound')) {
                fallback = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
              } else if (t.includes('watch') || t.includes('smartwatch')) {
                fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
              } else if (t.includes('shirt') || t.includes('tshirt') || t.includes('apparel') || t.includes('cloth')) {
                fallback = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80';
              }
              e.target.src = fallback;
            }}
          />
        </div>

        {/* Product Meta & Actions */}
        <div>
          <span style={{ fontSize: '0.85rem', color: '#007185', fontWeight: '700', textTransform: 'uppercase' }}>
            Brand: {product.brand || 'B-MART'}
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '8px 0 12px' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffa41c', color: 'white', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', fontSize: '0.9rem' }}>
              <Star size={14} fill="white" /> {product.rating}
            </div>
            <span style={{ color: '#007185', fontWeight: '600', fontSize: '0.9rem' }}>{product.reviewCount || 21595} customer reviews</span>
          </div>

          <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '16px 0', margin: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1rem', color: '#cc0c39', fontWeight: '700' }}>-20%</span>
              <span style={{ fontSize: '2rem', fontWeight: '800' }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#565959' }}>M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{(Number(product.price) * 1.25).toFixed(0)}</span> (Inclusive of all taxes)</div>
          </div>

          {/* Stock Availability Info */}
          <div style={{ margin: '14px 0 16px' }}>
            {isOutOfStock ? (
              <div>
                <div style={{ fontSize: '1.25rem', color: '#cc0c39', fontWeight: '800' }}>Currently unavailable / Out of Stock</div>
                <div style={{ fontSize: '0.9rem', color: '#565959', marginTop: '4px' }}>We don't know when or if this item will be back in stock.</div>
              </div>
            ) : stock <= 5 ? (
              <div style={{ fontSize: '1.2rem', color: '#b12704', fontWeight: '800' }}>Only {stock} left in stock - order soon.</div>
            ) : (
              <div style={{ fontSize: '1.2rem', color: '#007600', fontWeight: '800' }}>In Stock ({stock} available)</div>
            )}
          </div>

          {/* Amazon-Style Bullet Point Features */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>About this item:</h4>
            {renderAmazonDescription(product.description)}
          </div>

          {!isOutOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span style={{ fontWeight: '700' }}>Quantity:</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                {[...Array(Math.min(stock, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}

          {isOutOfStock ? (
            <button
              className={notified ? "btn-notify-success" : "btn-notify"}
              onClick={handleNotifyMe}
              style={{ padding: '14px 28px', fontSize: '1rem', width: '100%', marginBottom: '20px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Bell size={20} color={notified ? "#ffffff" : "#febd69"} /> {notified ? "✓ You will be notified when back in stock!" : "Notify Me When Available"}
              </span>
            </button>
          ) : (
            <button
              className={added ? "btn-amber" : "btn-primary"}
              onClick={handleAddToCart}
              style={{ padding: '14px 28px', fontSize: '1rem', width: '100%', marginBottom: '20px' }}
            >
              {added ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Check size={20} /> Added to Cart</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><ShoppingBag size={20} /> Add to Cart</span>}
            </button>
          )}

          {/* Delivery badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8f9fa', padding: '16px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={20} color="#007185" /> Free Express Shipping</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={20} color="#007185" /> 10 Days Replacement</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} color="#007185" /> 1 Year B-MART Warranty</div>
          </div>
        </div>
      </div>

      {/* Amazon / Flipkart Style Customer Reviews Section */}
      <div style={{ background: 'white', padding: '36px', borderRadius: '16px', border: '1px solid #ddd', marginTop: '30px' }}>
        <CustomerReviews
          product={product}
          reviews={reviews}
          isAuthenticated={isAuthenticated}
          onAddReview={handleAddReview}
          onNavigateLogin={() => navigate('/login')}
        />
      </div>
    </div>
  );
}
