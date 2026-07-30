import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Search, MapPin, User, Heart, Bell, LogOut, Package, Store, ShieldCheck } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { cartApi, notificationApi } from '../api/shopApi';
import { productApi } from '../api/productApi';
import { setCart } from '../store/slices/cartSlice';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalCount } = useSelector((state) => state.cart);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    productApi.getCategories().then(res => {
      if (res.success && res.data) setCategories(res.data);
    }).catch(() => {});

    if (isAuthenticated) {
      cartApi.getCart().then(res => {
        if (res.success && res.data) {
          dispatch(setCart(res.data));
        }
      }).catch(() => {});

      notificationApi.getUnreadCount().then(res => {
        if (res.success) setUnreadNotifications(res.data);
      }).catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    let url = `/products?query=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory) {
      url += `&categoryId=${selectedCategory}`;
    }
    navigate(url);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <header className="amz-header">
      {/* Brand Logo */}
      <Link to="/" className="amz-logo">
        <ShoppingBag size={28} color="#febd69" />
        B-MART<span>.in</span>
      </Link>

      {/* Deliver To Location */}
      <div className="amz-location" title="Deliver to India">
        <MapPin size={18} color="#febd69" />
        <div>
          <div style={{ fontSize: '0.75rem' }}>Deliver to</div>
          <div className="amz-location-bold">India</div>
        </div>
      </div>

      {/* Amazon-style Search Bar */}
      <form onSubmit={handleSearch} className="amz-search-bar">
        <select 
          className="amz-search-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
          ))}
        </select>

        <input
          type="text"
          className="amz-search-input"
          placeholder="Search B-MART for backpacks, handbags, luggage & wallets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button type="submit" className="amz-search-btn" title="Search">
          <Search size={20} color="#111" />
        </button>
      </form>

      {/* Navigation Actions */}
      <div className="amz-nav-actions">
        {/* Admin Portal link for Admins */}
        {isAdmin && (
          <Link to="/admin" className="amz-nav-item" title="Admin Portal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#febd69' }}>
              <ShieldCheck size={18} />
              <span className="amz-nav-bold">Admin Portal</span>
            </div>
          </Link>
        )}

        {/* Sell on B-MART / Seller Hub Link */}
        <Link to={user?.role === 'ROLE_SELLER' || isAdmin ? '/seller/products' : '/seller/apply'} className="amz-nav-item" title="Seller Hub">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Store size={18} color="#febd69" />
            <span className="amz-nav-bold">{user?.role === 'ROLE_SELLER' ? 'Seller Hub' : 'Sell on B-MART'}</span>
          </div>
        </Link>

        {/* Wishlist Link */}
        <Link to="/wishlist" className="amz-nav-item" title="Wishlist">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={18} color="#febd69" />
            <span className="amz-nav-bold">Wishlist</span>
          </div>
        </Link>

        {/* Notifications */}
        {isAuthenticated && (
          <Link to="/profile?tab=notifications" className="amz-nav-item" title="Notifications">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bell size={18} color="#febd69" />
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#f08804', color: 'white', fontSize: '0.65rem',
                  fontWeight: '800', borderRadius: '50%', padding: '2px 5px'
                }}>
                  {unreadNotifications}
                </span>
              )}
              <span className="amz-nav-bold">Alerts</span>
            </div>
          </Link>
        )}

        {/* Account & Lists Dropdown */}
        <div 
          className="amz-nav-item" 
          onMouseEnter={() => setShowAccountMenu(true)}
          onMouseLeave={() => setShowAccountMenu(false)}
        >
          <span>Hello, {isAuthenticated ? user?.fullName || user?.username : 'sign in'}</span>
          <div className="amz-nav-bold" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            Account & Lists
          </div>

          {showAccountMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: '220px',
              background: 'white', color: '#111', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              borderRadius: '8px', padding: '12px', zIndex: 1000, marginTop: '2px'
            }}>
              {isAuthenticated ? (
                <>
                  <div style={{ fontWeight: '700', marginBottom: '8px', borderBottom: '1px solid #eee', pb: '6px' }}>
                    {user?.fullName || user?.username}
                  </div>
                  {isAdmin && (
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: '#007185', fontWeight: '700' }}>
                      <ShieldCheck size={16} /> Admin Control Portal
                    </Link>
                  )}
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: '#333' }}>
                    <User size={16} /> Your Profile
                  </Link>
                  <Link to="/profile?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: '#333' }}>
                    <Package size={16} /> Your Orders
                  </Link>
                  <Link to={user?.role === 'ROLE_SELLER' || isAdmin ? '/seller/products' : '/seller/apply'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: '#333' }}>
                    <Store size={16} /> {user?.role === 'ROLE_SELLER' || isAdmin ? 'Seller Dashboard' : 'Become a Seller'}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 0', fontSize: '0.9rem', color: '#e53e3e',
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none', marginBottom: '8px' }}>
                    Sign In
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    New customer? <Link to="/register" style={{ color: '#007185', fontWeight: '600' }}>Start here.</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="amz-nav-item amz-cart-btn">
          <ShoppingBag size={28} color="#white" />
          <span className="amz-cart-badge">{totalCount}</span>
          <span className="amz-nav-bold" style={{ marginLeft: '12px' }}>Cart</span>
        </Link>
      </div>
    </header>
  );
}
