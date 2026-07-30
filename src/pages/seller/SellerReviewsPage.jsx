import React, { useEffect, useState } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { Star, MessageSquare, CornerDownRight } from 'lucide-react';

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState({});

  const fetchReviews = () => {
    setLoading(true);
    sellerApi.getReviews()
      .then(res => {
        if (res.success) setReviews(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = (reviewId) => {
    const text = replyText[reviewId];
    if (text && text.trim()) {
      sellerApi.replyReview(reviewId, text.trim())
        .then(res => {
          if (res.success) {
            setReplyText({ ...replyText, [reviewId]: '' });
            fetchReviews();
          }
        });
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Product Customer Reviews</h2>
      <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '24px' }}>Read and respond to feedback left by customers on your store items.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#fafafa', borderRadius: '12px' }}>
          No product reviews received yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(r => (
            <div key={r.reviewId} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={r.product?.imageUrl} alt={r.product?.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{r.product?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>By: {r.user?.fullName || r.user?.username} | {new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', color: '#f08804' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < r.rating ? '#f08804' : 'none'} color="#f08804" />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#333', marginBottom: '12px' }}>"{r.comment}"</p>

              {r.replyComment ? (
                <div style={{ background: '#fff8e7', borderLeft: '4px solid #f08804', padding: '12px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '700', color: '#744210', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CornerDownRight size={16} /> Store Owner Reply:
                  </div>
                  <div style={{ color: '#444', marginTop: '4px' }}>{r.replyComment}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Write a public seller reply to this review..."
                    value={replyText[r.reviewId] || ''}
                    onChange={e => setReplyText({ ...replyText, [r.reviewId]: e.target.value })}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                  />
                  <button onClick={() => handleSendReply(r.reviewId)} className="btn-amber" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Post Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
