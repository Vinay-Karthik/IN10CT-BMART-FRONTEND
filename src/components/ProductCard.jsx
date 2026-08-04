import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { cartApi, wishlistApi } from '../api/shopApi';
import { setCart } from '../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    cartApi.addToCart(product.productId, 1).then(res => {
      if (res.success && res.data) {
        dispatch(setCart(res.data));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    }).catch(err => alert(err.message || 'Error adding to cart'));
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
          <img src={product.imageUrl} alt={product.name} className="product-img" />
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

      <button 
        className={added ? "btn-amber" : "btn-primary"} 
        onClick={handleAddToCart}
        style={{ marginTop: '14px' }}
      >
        {added ? 'Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
}
