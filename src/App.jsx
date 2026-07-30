import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import Footer from './components/Footer';

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

// Seller Dashboard Pages (Phases 1 - 7)
import SellerApplyPage from './pages/seller/SellerApplyPage';
import SellerDashboardLayout from './pages/seller/SellerDashboardLayout';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerStorePage from './pages/seller/SellerStorePage';
import SellerEarningsPage from './pages/seller/SellerEarningsPage';
import SellerReviewsPage from './pages/seller/SellerReviewsPage';
import SellerAnalyticsPage from './pages/seller/SellerAnalyticsPage';

// Admin Dashboard Pages (Phases 8 - 14)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <CategoryBar />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/payment-failure" element={<PaymentFailurePage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* User Account */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* Seller Ecosystem (Phases 1 to 7) */}
          <Route path="/seller/apply" element={<SellerApplyPage />} />
          <Route path="/seller" element={<SellerDashboardLayout />}>
            <Route index element={<Navigate to="/seller/products" replace />} />
            <Route path="products" element={<SellerProductsPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="store" element={<SellerStorePage />} />
            <Route path="earnings" element={<SellerEarningsPage />} />
            <Route path="reviews" element={<SellerReviewsPage />} />
            <Route path="analytics" element={<SellerAnalyticsPage />} />
          </Route>

          {/* Admin Portal (Phases 8 to 14) */}
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
