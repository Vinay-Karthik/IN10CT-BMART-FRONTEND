import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Search, MapPin, User, Heart, Bell, LogOut, Package, Store, ShieldCheck, Sun, Moon } from 'lucide-react';
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
    <header className="amz-header" style={{ justifyContent: 'space-between', padding: '16px 40px' }}>
      {/* Brand Logo */}
      <Link to="/" className="amz-logo" style={{ letterSpacing: '2px', fontWeight: '900', fontSize: '1.4rem' }}>
        B-MART
      </Link>

      {/* Centered Navigation Links (Reference style) */}
      <div className="nav-center-links" style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', fontWeight: '600' }}>
        <Link to="/" style={{ color: 'var(--text-dark)' }}>Home</Link>
        <Link to="/products" style={{ color: 'var(--text-dark)' }}>Shop</Link>
        <Link to="/wishlist" style={{ color: 'var(--text-dark)' }}>Wishlist</Link>
        <Link to={user?.role === 'ROLE_SELLER' || isAdmin ? '/seller/products' : '/seller/apply'} style={{ color: 'var(--text-dark)' }}>
          {user?.role === 'ROLE_SELLER' ? 'Seller Hub' : 'Sell on B-MART'}
        </Link>
      </div>

      {/* Right-aligned items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Slim Search Bar */}
        <form onSubmit={handleSearch} className="amz-search-bar" style={{ maxWidth: '240px', height: '34px', borderRadius: '20px' }}>
          <input
            type="text"
            className="amz-search-input"
            placeholder="Search bags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0 12px', fontSize: '0.8rem' }}
          />
          <button type="submit" className="amz-search-btn" title="Search" style={{ width: '34px' }}>
            <Search size={16} />
          </button>
        </form>

        {/* Notifications */}
        {isAuthenticated && (
          <Link to="/profile?tab=notifications" className="amz-nav-item" title="Notifications">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: 'var(--text-dark)', color: 'var(--card-bg)', fontSize: '0.6rem',
                  fontWeight: '800', borderRadius: '50%', padding: '1px 4px'
                }}>
                  {unreadNotifications}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Account Menu */}
        <div 
          className="amz-nav-item amz-nav-dropdown-wrapper" 
          onMouseEnter={() => setShowAccountMenu(true)}
          onMouseLeave={() => setShowAccountMenu(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div className="nav-icon-trigger" style={{ display: 'flex', alignItems: 'center', gap: '4px', transition: 'opacity 0.2s' }}>
            <User size={18} />
          </div>

          {showAccountMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, width: '220px',
              background: 'var(--card-bg)', color: 'var(--text-dark)', border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: '8px', padding: '12px', zIndex: 1000, marginTop: '8px'
            }}>
              {isAuthenticated ? (
                <>
                  <div style={{ fontWeight: '700', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    {user?.fullName || user?.username}
                  </div>
                  {isAdmin && (
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '700' }}>
                      <ShieldCheck size={16} /> Admin Portal
                    </Link>
                  )}
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    <User size={16} /> Your Profile
                  </Link>
                  <Link to="/profile?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    <Package size={16} /> Your Orders
                  </Link>
                  <Link to={user?.role === 'ROLE_SELLER' || isAdmin ? '/seller/products' : '/seller/apply'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    <Store size={16} /> Seller Hub
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
                  <Link to="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none', marginBottom: '8px', marginTop: 0 }}>
                    Sign In
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    New customer? <Link to="/register" style={{ color: 'var(--text-dark)', fontWeight: '600' }}>Start here.</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dark)'
          }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Cart */}
        <Link to="/cart" className="amz-nav-item amz-cart-btn" title="Cart">
          <ShoppingBag size={18} />
          <span className="amz-cart-badge">{totalCount}</span>
        </Link>
      </div>
    </header>
  );
}
