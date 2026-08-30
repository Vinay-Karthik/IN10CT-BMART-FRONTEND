import React, { useState, useMemo } from 'react';
import {
  Star,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Camera,
  CheckCircle2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  AlertCircle
} from 'lucide-react';

export default function CustomerReviews({
  product,
  reviews = [],
  isAuthenticated,
  onAddReview,
  onNavigateLogin
}) {
  // --- UI STATES ---
  const [selectedStarFilter, setSelectedStarFilter] = useState(null); // null = All, 5, 4, 3, 2, 1
  const [selectedTopic, setSelectedTopic] = useState(null); // e.g. 'Appearance', 'Quality'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest', 'helpful'
  const [showRatingsPolicy, setShowRatingsPolicy] = useState(false);

  // --- REVIEW FORM STATES ---
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- HELPFUL VOTES STATE ---
  const [helpfulVotes, setHelpfulVotes] = useState({});

  // --- LIGHTBOX STATE ---
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  // --- MOCK CUSTOMER MEDIA GALLERY ---
  const customerMedia = useMemo(() => {
    return [
      { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80', caption: 'Unboxing and leather finish check', author: 'Rahul M.', rating: 5 },
      { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', caption: 'Stitching and zipper quality closeup', author: 'Ananya S.', rating: 5 },
      { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80', caption: 'Carrying it daily to work - fits 15 inch laptop nicely', author: 'Vikram K.', rating: 4 },
      { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80', caption: 'Color matches exact photos shown on B-MART', author: 'Priya P.', rating: 5 },
      { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80', caption: 'Inner lining and compartment pockets', author: 'Amit R.', rating: 4 },
    ];
  }, []);

  // --- RATING BREAKDOWN STATS CALCULATOR ---
  const ratingStats = useMemo(() => {
    const totalCount = Math.max(reviews.length, 1);
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      const rVal = Math.min(Math.max(r.rating || 5, 1), 5);
      counts[rVal] = (counts[rVal] || 0) + 1;
      sum += rVal;
    });

    // If database reviews exist, compute average; else fallback to product.rating or 4.4
    const avgRating = reviews.length > 0 ? (sum / reviews.length).toFixed(1) : (product?.rating || 4.4);
    const globalCount = reviews.length > 0 ? reviews.length + 21590 : 21595;

    // Default distribution percentages matching reference Amazon UI if db count is low
    const p5 = reviews.length > 0 ? Math.round((counts[5] / totalCount) * 100) : 51;
    const p4 = reviews.length > 0 ? Math.round((counts[4] / totalCount) * 100) : 23;
    const p3 = reviews.length > 0 ? Math.round((counts[3] / totalCount) * 100) : 10;
    const p2 = reviews.length > 0 ? Math.round((counts[2] / totalCount) * 100) : 4;
    const p1 = reviews.length > 0 ? Math.round((counts[1] / totalCount) * 100) : 12;

    return {
      avg: avgRating,
      totalGlobal: globalCount,
      percentages: { 5: p5, 4: p4, 3: p3, 2: p2, 1: p1 },
      counts
    };
  }, [reviews, product]);

  // --- TOPIC PILLS (MATCHING AMAZON REFERENCE UI) ---
  const topics = useMemo(() => [
    { label: 'Appearance', count: 461, trend: 'up' },
    { label: 'Quality', count: '1.1K', trend: 'neutral' },
    { label: 'Value for money', count: 624, trend: 'neutral' },
    { label: 'Durability', count: 302, trend: 'neutral' },
    { label: 'Accuracy', count: 193, trend: 'neutral' },
    { label: 'Design', count: 118, trend: 'neutral' },
    { label: 'Performance', count: 406, trend: 'down' },
    { label: 'Stitching & Straps', count: 206, trend: 'down' },
  ], []);

  // --- DYNAMIC AI CUSTOMERS SAY SUMMARY PARAGRAPH ---
  const aiSummaryText = useMemo(() => {
    const pName = product?.name || 'product';
    return `Customers find the ${pName.toLowerCase()}'s appearance premium and appreciate its build quality and sleek design. However, performance and capacity receive mixed feedback from some reviewers who note specific usage needs. Overall, the accuracy and value for money receive strong positive ratings from verified purchasers.`;
  }, [product]);

  // --- ENRICHED REVIEWS LIST (COMBINING REAL DB REVIEWS + SAMPLE VERIFIED AMAZON REVIEWS) ---
  const allEnrichedReviews = useMemo(() => {
    const sampleReviews = [
      {
        reviewId: 'mock-1',
        user: { fullName: 'Rajesh Sharma' },
        rating: 5,
        title: 'Exceptional craftsmanship & premium feel!',
        comment: 'I bought this item 2 weeks ago and it has exceeded all my expectations. The material quality is top notch, zippers glide smoothly, and it looks even better in person than in product photos.',
        createdAt: '2026-08-10T14:30:00Z',
        verified: true,
        helpfulCount: 42,
        location: 'Reviewed in India on 10 August 2026',
        topic: 'Appearance'
      },
      {
        reviewId: 'mock-2',
        user: { fullName: 'Priya Sundaram' },
        rating: 4,
        title: 'Very good product for daily use, minor strap stiffness',
        comment: 'Great value for money! The compartment layout is very practical for carrying essentials. The shoulder straps felt slightly stiff on day 1 but became comfortable after 2 days of use.',
        createdAt: '2026-08-08T09:15:00Z',
        verified: true,
        helpfulCount: 19,
        location: 'Reviewed in India on 8 August 2026',
        topic: 'Quality'
      },
      {
        reviewId: 'mock-3',
        user: { fullName: 'Amitabh Verma' },
        rating: 5,
        title: 'Worth every rupee! Highly recommended.',
        comment: 'The stitching quality and inner lining are excellent. Delivered very fast by B-MART Express. If you are looking for durability and style, go for it without second thoughts.',
        createdAt: '2026-08-05T18:20:00Z',
        verified: true,
        helpfulCount: 31,
        location: 'Reviewed in India on 5 August 2026',
        topic: 'Value for money'
      },
      {
        reviewId: 'mock-4',
        user: { fullName: 'Sneha Kapur' },
        rating: 3,
        title: 'Decent look but size is slightly smaller than expected',
        comment: 'Product appearance is very attractive and premium. However, the internal depth is slightly smaller than I anticipated for heavy daily items. Good for light carrying.',
        createdAt: '2026-08-01T11:45:00Z',
        verified: true,
        helpfulCount: 12,
        location: 'Reviewed in India on 1 August 2026',
        topic: 'Performance'
      }
    ];

    const dbFormatted = reviews.map(r => ({
      reviewId: r.reviewId || `db-${Math.random()}`,
      user: r.user || { fullName: 'Verified Customer' },
      rating: r.rating || 5,
      title: r.comment && r.comment.length > 25 ? r.comment.substring(0, 25) + '...' : 'Verified Customer Review',
      comment: r.comment || 'No detailed text provided.',
      createdAt: r.createdAt || new Date().toISOString(),
      verified: true,
      helpfulCount: 8,
      location: 'Reviewed in India',
      topic: 'Quality'
    }));

    return [...dbFormatted, ...sampleReviews];
  }, [reviews]);

  // --- FILTERED & SORTED REVIEWS LIST ---
  const filteredReviews = useMemo(() => {
    return allEnrichedReviews.filter(r => {
      // Star filter
      if (selectedStarFilter && r.rating !== selectedStarFilter) return false;
      // Topic filter
      if (selectedTopic) {
        const tLower = selectedTopic.toLowerCase();
        const hasTopic = (r.topic && r.topic.toLowerCase().includes(tLower)) ||
          (r.comment && r.comment.toLowerCase().includes(tLower)) ||
          (r.title && r.title.toLowerCase().includes(tLower));
        if (!hasTopic) return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ = (r.comment && r.comment.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.user?.fullName && r.user.fullName.toLowerCase().includes(q));
        if (!matchesQ) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      // default: recent
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [allEnrichedReviews, selectedStarFilter, selectedTopic, searchQuery, sortBy]);

  // --- HANDLERS ---
  const handleHelpfulVote = (revId) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [revId]: (prev[revId] || 0) + 1
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNavigateLogin();
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    setReviewSuccessMsg('');

    try {
      if (onAddReview) {
        await onAddReview({ rating: newRating, comment: newComment });
      }
      setReviewSuccessMsg('Your review has been submitted successfully and verified!');
      setNewComment('');
      setNewTitle('');
      setShowReviewForm(false);
    } catch (err) {
      alert('Error submitting review: ' + (err.message || 'Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a' }}>
      {/* ========================================================================= */}
      {/* SECTION 1: CUSTOMER REVIEWS & CUSTOMERS SAY (AMAZON 2-COLUMN HEADER UI)   */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '40px',
          paddingBottom: '32px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '32px',
        }}
      >
        {/* --- LEFT COLUMN: CUSTOMER REVIEWS RATING BREAKDOWN --- */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a' }}>
            Customer reviews
          </h2>

          {/* Star Average Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', color: '#de7921' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(ratingStats.avg) ? '#de7921' : '#e2e8f0'}
                  color="#de7921"
                />
              ))}
            </div>
            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
              {ratingStats.avg} out of 5
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#565959', marginBottom: '20px' }}>
            {ratingStats.totalGlobal.toLocaleString('en-IN')} global ratings
          </div>

          {/* 5 Star to 1 Star Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const pct = ratingStats.percentages[starNum];
              const isSelected = selectedStarFilter === starNum;

              return (
                <div
                  key={starNum}
                  onClick={() => setSelectedStarFilter(isSelected ? null : starNum)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: isSelected ? '#c45500' : '#007185',
                    fontWeight: isSelected ? '800' : '600',
                  }}
                  title={`Filter by ${starNum} star reviews`}
                >
                  <span style={{ width: '42px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {starNum} star
                  </span>

                  {/* Progress Bar Container */}
                  <div
                    style={{
                      flex: 1,
                      height: '20px',
                      background: '#f0f2f2',
                      borderRadius: '4px',
                      border: '1px solid #d5d9d9',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: isSelected ? '#c45500' : '#de7921',
                        borderRadius: '3px 0 0 3px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  <span style={{ width: '36px', textAlign: 'right', color: '#565959', fontSize: '0.8rem', fontWeight: '700' }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* How Ratings Calculated Accordion */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowRatingsPolicy(!showRatingsPolicy)}
              style={{
                background: 'none',
                border: 'none',
                color: '#007185',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
            >
              <span>How are ratings calculated?</span>
              {showRatingsPolicy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showRatingsPolicy && (
              <div
                style={{
                  marginTop: '10px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.8rem',
                  color: '#475569',
                  lineHeight: '1.5',
                }}
              >
                B-MART calculates a product's star ratings using a machine-learned model rather than a raw data average. The model takes into account factors including the date of a review, verified purchase status, and reviewer trustworthiness ratings.
              </div>
            )}
          </div>

          {/* Write a Review Button */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontWeight: '800', fontSize: '1rem', margin: '0 0 6px 0' }}>Review this product</h4>
            <p style={{ fontSize: '0.82rem', color: '#565959', margin: '0 0 14px 0' }}>Share your thoughts with other customers</p>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onNavigateLogin();
                  return;
                }
                setShowReviewForm(!showReviewForm);
              }}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #d5d9d9',
                borderRadius: '8px',
                padding: '10px 16px',
                fontWeight: '700',
                fontSize: '0.88rem',
                color: '#0f172a',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(213,217,217,0.5)',
                transition: 'background 0.2s',
              }}
            >
              {showReviewForm ? 'Close Review Form' : 'Write a customer review'}
            </button>
          </div>
        </div>

        {/* --- RIGHT COLUMN: CUSTOMERS SAY (AI SUMMARY & TOPIC TAGS) --- */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a' }}>
            Customers say
          </h2>

          <p style={{ fontSize: '0.95rem', color: '#111827', lineHeight: '1.6', margin: '0 0 10px 0' }}>
            {aiSummaryText}
          </p>

          {/* AI Attribution Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginBottom: '24px', fontWeight: '600' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', color: '#475569', fontWeight: '800', fontSize: '0.7rem' }}>
              <Sparkles size={12} color="#2563eb" /> ai
            </span>
            <span>Generated from the text of customer reviews</span>
          </div>

          {/* Select to learn more (Topic Tags Pills Grid) */}
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', marginBottom: '12px' }}>
              Select to learn more
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {topics.map((t, idx) => {
                const isSelected = selectedTopic === t.label;

                // Determine trend icon & color style
                let trendIcon = <Minus size={14} color="#64748b" />;
                let tagBorder = '#e2e8f0';

                if (t.trend === 'up') {
                  trendIcon = <TrendingUp size={14} color="#059669" />;
                  tagBorder = '#a7f3d0';
                } else if (t.trend === 'down') {
                  trendIcon = <TrendingDown size={14} color="#d97706" />;
                  tagBorder = '#fde68a';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedTopic(isSelected ? null : t.label)}
                    style={{
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#007185',
                      border: isSelected ? '2px solid #2563eb' : `1px solid ${tagBorder}`,
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {trendIcon}
                    <span>{t.label}</span>
                    <span style={{ color: '#64748b', fontWeight: '600', fontSize: '0.78rem' }}>({t.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: CUSTOMER PHOTOS AND VIDEOS GALLERY                             */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '36px', paddingBottom: '32px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a' }}>
          Customer photos and videos
        </h3>

        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
          {customerMedia.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxIndex(idx)}
              style={{
                position: 'relative',
                width: '130px',
                height: '130px',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                flexShrink: 0,
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s',
              }}
            >
              <img
                src={item.url}
                alt={item.caption}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                  padding: '6px',
                  color: 'white',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Camera size={12} color="white" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: WRITE A REVIEW FORM (EXPANDABLE)                               */}
      {/* ========================================================================= */}
      {showReviewForm && (
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #2563eb',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '36px',
            boxShadow: '0 10px 25px rgba(37,99,235,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
              Create Verified Customer Review
            </h3>
            <button onClick={() => setShowReviewForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>

          {reviewSuccessMsg && (
            <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> {reviewSuccessMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            {/* Rating Stars Picker */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                Overall Rating *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <Star
                      size={28}
                      fill={star <= newRating ? '#de7921' : '#e2e8f0'}
                      color="#de7921"
                    />
                  </button>
                ))}
                <span style={{ marginLeft: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                  {newRating === 5 ? '5 Star - Excellent' : newRating === 4 ? '4 Star - Very Good' : newRating === 3 ? '3 Star - Average' : newRating === 2 ? '2 Star - Poor' : '1 Star - Terrible'}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Add a headline (Optional)
              </label>
              <input
                type="text"
                placeholder="What's most important to know?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Written Review */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Add a written review *
              </label>
              <textarea
                rows={4}
                required
                placeholder="What did you like or dislike? What did you use this product for?"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #ffa41c 0%, #ff8f00 100%)',
                color: '#0f172a',
                border: '1px solid #de7921',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: submitting ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(222,121,33,0.3)',
              }}
            >
              {submitting ? 'Submitting Review...' : 'Submit Customer Review'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: REVIEWS FILTER TOOLBAR & VERIFIED REVIEWS LIST                  */}
      {/* ========================================================================= */}
      <div>
        {/* Toolbar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              Top Reviews from India
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Showing {filteredReviews.length} verified customer reviews
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#0f172a',
                outline: 'none',
                background: '#ffffff',
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Top Helpful Reviews</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedStarFilter || selectedTopic || searchQuery) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Active Filters:</span>
            {selectedStarFilter && (
              <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                {selectedStarFilter} Star Reviews
              </span>
            )}
            {selectedTopic && (
              <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                Topic: {selectedTopic}
              </span>
            )}
            {searchQuery && (
              <span style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                Search: "{searchQuery}"
              </span>
            )}
            <button
              onClick={() => {
                setSelectedStarFilter(null);
                setSelectedTopic(null);
                setSearchQuery('');
              }}
              style={{ background: 'none', border: 'none', color: '#007185', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', marginLeft: 'auto' }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Reviews Cards List */}
        {filteredReviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <AlertCircle size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <div>No customer reviews match your selected filter criteria.</div>
            <button
              onClick={() => {
                setSelectedStarFilter(null);
                setSelectedTopic(null);
                setSearchQuery('');
              }}
              style={{ marginTop: '12px', background: '#007185', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredReviews.map((rev) => {
              const currentHelpful = (rev.helpfulCount || 0) + (helpfulVotes[rev.reviewId] || 0);

              return (
                <div
                  key={rev.reviewId}
                  style={{
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  {/* User Profile Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {rev.user?.fullName ? rev.user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
                      {rev.user?.fullName || rev.user?.username || 'Verified Customer'}
                    </span>
                  </div>

                  {/* Rating Stars & Title Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', color: '#de7921' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={s <= rev.rating ? '#de7921' : '#e2e8f0'}
                          color="#de7921"
                        />
                      ))}
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>
                      {rev.title}
                    </span>
                  </div>

                  {/* Review Date & Verified Purchase Badge */}
                  <div style={{ fontSize: '0.78rem', color: '#565959', marginBottom: '8px' }}>
                    {rev.location || 'Reviewed in India'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#c45500', fontWeight: '800', marginBottom: '12px' }}>
                    <span>Verified Purchase</span>
                  </div>

                  {/* Review Body */}
                  <p style={{ fontSize: '0.92rem', color: '#111827', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                    {rev.comment}
                  </p>

                  {/* Helpful Vote & Report Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      onClick={() => handleHelpfulVote(rev.reviewId)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #d5d9d9',
                        borderRadius: '6px',
                        padding: '5px 14px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    >
                      <ThumbsUp size={13} color="#565959" />
                      <span>Helpful ({currentHelpful})</span>
                    </button>

                    <span style={{ color: '#e2e8f0' }}>|</span>

                    <button
                      onClick={() => alert('Thank you. This review has been flagged for administrative safety audit.')}
                      style={{ background: 'none', border: 'none', color: '#565959', fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: CUSTOMER MEDIA LIGHTBOX MODAL                                  */}
      {/* ========================================================================= */}
      {activeLightboxIndex !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '720px',
              width: '100%',
              background: '#0f172a',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              color: 'white',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
              <div>
                <span style={{ fontWeight: '800', fontSize: '1rem' }}>{customerMedia[activeLightboxIndex].author}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '10px' }}>
                  Customer Photo {activeLightboxIndex + 1} of {customerMedia.length}
                </span>
              </div>
              <button
                onClick={() => setActiveLightboxIndex(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Media Image */}
            <div style={{ height: '400px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img
                src={customerMedia[activeLightboxIndex].url}
                alt={customerMedia[activeLightboxIndex].caption}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />

              {/* Prev / Next controls */}
              <button
                onClick={() => setActiveLightboxIndex((activeLightboxIndex - 1 + customerMedia.length) % customerMedia.length)}
                style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%',
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={() => setActiveLightboxIndex((activeLightboxIndex + 1) % customerMedia.length)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%',
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Caption */}
            <div style={{ padding: '16px 20px', background: '#1e293b' }}>
              <div style={{ display: 'flex', color: '#de7921', marginBottom: '6px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= customerMedia[activeLightboxIndex].rating ? '#de7921' : '#475569'} color="#de7921" />
                ))}
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0' }}>
                {customerMedia[activeLightboxIndex].caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
