import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

// Pages
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

// Admin Dashboard Pages (Phases 8 - 14)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated || !user) {
    return <Navigate to={adminOnly ? "/admin" : "/login"} replace />;
  }
  if (adminOnly && user?.role !== 'ROLE_ADMIN' && user?.role !== 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function AdminPortalRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isAdmin = isAuthenticated && user && (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');

  if (isAdmin) {
    return <AdminDashboardPage />;
  }
  return <AdminLoginPage />;
}

function CustomerOnlyRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (isAuthenticated && user && (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN')) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminUser = isAuthenticated && user && (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(logout());
    };
    window.addEventListener('bmart_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('bmart_unauthorized', handleUnauthorized);
  }, [dispatch]);

  // Restrict Admin users from accessing customer/storefront features
  if (!isAdminRoute && isAdminUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hide Storefront Navigation headers on Admin routes */}
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CategoryBar />}

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/payment-failure" element={<PaymentFailurePage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* User Account */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminPortalRoute />} />
          <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>

      {!isAdminRoute && <ChatbotWidget />}

      {!isAdminRoute && <Footer />}
    </div>
  );
}
