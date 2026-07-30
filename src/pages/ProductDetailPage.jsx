import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { productApi } from '../api/productApi';
import { cartApi, reviewApi, wishlistApi } from '../api/shopApi';
import { setCart } from '../store/slices/cartSlice';
import { Star, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag, Check } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

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
      navigate('/login');
      return;
    }
    cartApi.addToCart(product.productId, quantity).then(res => {
      if (res.success && res.data) {
        dispatch(setCart(res.data));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    });
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

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    reviewApi.addReview({
      productId: product.productId,
      rating: newRating,
      comment: newComment
    }).then(res => {
      if (res.success) {
        setReviewMsg('Review submitted successfully!');
        setNewComment('');
        reviewApi.getProductReviews(id).then(r => setReviews(r.data));
      }
    });
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
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '12px' }} />
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
            <span style={{ color: '#007185', fontWeight: '600', fontSize: '0.9rem' }}>{product.reviewCount} customer reviews</span>
          </div>

          <div style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '16px 0', margin: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1rem', color: '#cc0c39', fontWeight: '700' }}>-20%</span>
              <span style={{ fontSize: '2rem', fontWeight: '800' }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#565959' }}>M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{(Number(product.price) * 1.25).toFixed(0)}</span> (Inclusive of all taxes)</div>
          </div>

          {/* Amazon-Style Bullet Point Features */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px' }}>About this item:</h4>
            {renderAmazonDescription(product.description)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span style={{ fontWeight: '700' }}>Quantity:</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              {[1, 2, 3, 4, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button
            className={added ? "btn-amber" : "btn-primary"}
            onClick={handleAddToCart}
            style={{ padding: '14px 28px', fontSize: '1rem', width: '100%', marginBottom: '20px' }}
          >
            {added ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Check size={20} /> Added to Cart</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><ShoppingBag size={20} /> Add to Cart</span>}
          </button>

          {/* Delivery badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8f9fa', padding: '16px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={20} color="#007185" /> Free Express Shipping</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={20} color="#007185" /> 10 Days Replacement</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} color="#007185" /> 1 Year B-MART Warranty</div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd', marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>Customer Reviews & Ratings</h2>

        {/* Submit Review Form */}
        <div style={{ background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1px solid #eee', marginBottom: '30px' }}>
          <h4 style={{ fontWeight: '700', marginBottom: '12px' }}>Write a Customer Review</h4>
          {reviewMsg && <div style={{ color: 'green', fontWeight: '700', marginBottom: '10px' }}>{reviewMsg}</div>}
          <form onSubmit={handleReviewSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <label style={{ fontWeight: '600' }}>Rating:</label>
              <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: '6px' }}>
                <option value="5">5 Star - Excellent</option>
                <option value="4">4 Star - Very Good</option>
                <option value="3">3 Star - Average</option>
                <option value="2">2 Star - Poor</option>
                <option value="1">1 Star - Terrible</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <textarea
                rows={3}
                placeholder="Share your thoughts about this product..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <button type="submit" className="btn-amber" style={{ padding: '8px 20px' }}>Submit Review</button>
          </form>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p style={{ color: '#666' }}>No reviews yet for this product. Be the first to leave a review!</p>
        ) : (
          reviews.map(r => (
            <div key={r.reviewId} style={{ borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', color: '#ffa41c' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < r.rating ? "#ffa41c" : "none"} color="#ffa41c" />
                  ))}
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{r.user?.fullName || r.user?.username}</span>
                <span style={{ color: '#777', fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#333' }}>{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
