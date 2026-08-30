import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, ShoppingBag, Check, Bell } from 'lucide-react';
import { cartApi, wishlistApi } from '../api/shopApi';
import { setCart, addToCartLocal } from '../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [notified, setNotified] = useState(false);

  const stock = product.stock != null ? product.stock : 10;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    cartApi.addToCart(product.productId, 1).then(res => {
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

  const handleNotifyMe = (e) => {
    e.preventDefault();
    setNotified(true);
    alert(`Notification set! We'll notify you as soon as "${product.name}" is back in stock.`);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    wishlistApi.toggleWishlist(product.productId).then(res => {
      if (res.success) {
        setIsWishlisted(res.data);
      }
    }).catch(() => {});
  };

  const handleImgError = (e) => {
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
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.productId}`}>
        <div className="product-img-box" style={{ position: 'relative' }}>
          {product.rating >= 4.5 && (
            <span style={{
              position: 'absolute', top: '12px', left: '12px',
              background: '#e11d48', color: 'white', fontSize: '0.7rem',
              fontWeight: '700', padding: '3px 8px', borderRadius: '12px',
              textTransform: 'uppercase', zIndex: 5
            }}>
              Sale
            </span>
          )}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-img"
            onError={handleImgError}
          />
        </div>
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '12px' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
          <div className="product-brand">{product.brand || 'B-MART'}</div>
          <Link to={`/products/${product.productId}`} className="product-title" style={{ marginTop: '2px', fontWeight: '700' }}>
            {product.name}
          </Link>
          <div className="price-box" style={{ marginTop: '6px' }}>
            <span className="price-symbol">₹</span>
            <span className="price-main" style={{ fontSize: '1.1rem' }}>{Number(product.price).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button 
          onClick={handleToggleWishlist}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: isWishlisted ? '#e53e3e' : 'var(--text-muted)',
            flexShrink: 0, marginTop: '12px'
          }}
        >
          <Heart size={20} fill={isWishlisted ? "#e53e3e" : "none"} color={isWishlisted ? "#e53e3e" : "currentColor"} />
        </button>
      </div>

      {/* Stock Availability Info */}
      <div style={{ marginTop: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
        {isOutOfStock ? (
          <span style={{ color: '#cc0c39' }}>Out of Stock</span>
        ) : stock <= 5 ? (
          <span style={{ color: '#b12704' }}>Only {stock} left in stock</span>
        ) : (
          <span style={{ color: '#007600' }}>In Stock ({stock} available)</span>
        )}
      </div>

      {/* Action Button: Add to Cart OR Notify Me */}
      {isOutOfStock ? (
        <button 
          className={notified ? "btn-notify-success" : "btn-notify"} 
          onClick={handleNotifyMe}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Bell size={16} color={notified ? "#ffffff" : "#febd69"} /> {notified ? "✓ Notified" : "Notify Me"}
          </span>
        </button>
      ) : (
        <button 
          className={added ? "btn-amber" : "btn-primary"} 
          onClick={handleAddToCart}
          style={{ marginTop: '10px' }}
        >
          {added ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Check size={16} /> Added to Cart
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <ShoppingBag size={16} /> Add to Cart
            </span>
          )}
        </button>
      )}
    </div>
  );
}
