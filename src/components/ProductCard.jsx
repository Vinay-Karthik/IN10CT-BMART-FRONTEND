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
      <button 
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
        onClick={handleToggleWishlist}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={18} fill={isWishlisted ? "#e53e3e" : "none"} color={isWishlisted ? "#e53e3e" : "#666"} />
      </button>

      <Link to={`/products/${product.productId}`}>
        <div className="product-img-box">
          <img src={product.imageUrl} alt={product.name} className="product-img" />
        </div>
      </Link>

      <div className="product-brand">{product.brand || 'B-MART'}</div>
      
      <Link to={`/products/${product.productId}`} className="product-title">
        {product.name}
      </Link>

      <div className="rating-box">
        <Star size={15} fill="#ffa41c" color="#ffa41c" />
        <span style={{ fontWeight: '700', color: '#111' }}>{product.rating || 4.2}</span>
        <span style={{ color: '#565959', fontSize: '0.8rem' }}>({product.reviewCount || 12})</span>
      </div>

      <div className="price-box">
        <span className="price-symbol">₹</span>
        <span className="price-main">{Number(product.price).toLocaleString('en-IN')}</span>
        <span style={{ fontSize: '0.8rem', color: '#565959', textDecoration: 'line-through', marginLeft: '6px' }}>
          ₹{(Number(product.price) * 1.25).toFixed(0)}
        </span>
        <span style={{ fontSize: '0.8rem', color: '#cc0c39', fontWeight: '700', marginLeft: 'auto' }}>
          20% OFF
        </span>
      </div>

      <button 
        className={added ? "btn-amber" : "btn-primary"} 
        onClick={handleAddToCart}
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
    </div>
  );
}
