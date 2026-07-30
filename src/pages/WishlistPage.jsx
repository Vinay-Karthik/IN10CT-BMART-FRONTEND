import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { wishlistApi } from '../api/shopApi';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistApi.getWishlist().then(res => {
        if (res.success) setWishlistItems(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ margin: '60px auto', textAlign: 'center', background: 'white', padding: '60px', borderRadius: '16px' }}>
        <h2>Sign in to View Your Saved Wishlist</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Heart size={28} fill="#e53e3e" color="#e53e3e" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Your Saved Wishlist ({wishlistItems.length})</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading saved items...</div>
      ) : wishlistItems.length === 0 ? (
        <div style={{ background: 'white', padding: '60px', borderRadius: '16px', textAlign: 'center' }}>
          <h3>Your wishlist is currently empty</h3>
          <p style={{ color: '#666', marginTop: '8px' }}>Save items by clicking the heart icon on any product card.</p>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistItems.map(item => (
            <ProductCard key={item.wishlistId} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
