import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userApi, orderApi, notificationApi } from '../api/shopApi';
import { updateUser } from '../store/slices/authSlice';
import { User, MapPin, Package, Bell, KeyRound, CheckCircle, Phone, Mail, ShieldCheck, Edit3, Download, FileText, Eye, EyeOff, CheckCircle2, AlertCircle, AlertTriangle, Trash2, CheckCheck, ArrowRight, Filter } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const activeTabParam = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(activeTabParam);
  const { user } = useSelector((state) => state.auth);

  // Profile & Address Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [stateName, setStateName] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Orders & Invoice state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all', 'unread', 'read'

  // Fetch full live profile from backend on load
  useEffect(() => {
    userApi.getProfile().then(res => {
      if (res.success && res.data) {
        const u = res.data;
        setFullName(u.fullName || '');
        setPhoneNumber(u.phoneNumber || '');
        setAddress(u.address || '');
        setCity(u.city || '');
        setStateName(u.state || '');
        setPincode(u.pincode || '');
        dispatch(updateUser(u));
      }
    }).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      orderApi.getUserOrders().then(res => {
        if (res.success) setOrders(res.data);
        setOrdersLoading(false);
      }).catch(() => setOrdersLoading(false));
    } else if (activeTab === 'notifications') {
      notificationApi.getNotifications().then(res => {
        if (res.success) setNotifications(res.data);
      });
    }
  }, [activeTab]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileLoading(true);

    userApi.updateProfile({ 
      fullName, 
      phoneNumber, 
      address, 
      city, 
      state: stateName, 
      pincode 
    }).then(res => {
      if (res.success && res.data) {
        dispatch(updateUser(res.data));
        setProfileMsg('Profile and address details updated successfully!');
      }
    }).finally(() => setProfileLoading(false));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');
    userApi.changePassword({ oldPassword, newPassword }).then(res => {
      if (res.success) {
        setPassMsg('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
      } else {
        setPassError(res.message);
      }
    }).catch(err => setPassError(err.message || 'Error changing password'));
  };

  const markNotificationRead = (id) => {
    notificationApi.markAsRead(id).then(() => {
      setNotifications(notifications.map(n => n.notificationId === id ? { ...n, read: true } : n));
    });
  };

  const markAllNotificationsRead = () => {
    notificationApi.markAllAsRead().then(() => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }).catch(err => console.error(err));
  };

  const deleteNotificationItem = (id) => {
    notificationApi.deleteNotification(id).then(() => {
      setNotifications(notifications.filter(n => n.notificationId !== id));
    }).catch(err => console.error(err));
  };

  const renderStatusPipeline = (status) => {
    const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = steps.indexOf(status);

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0', position: 'relative' }}>
        {/* Background Track Line */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '10%',
          right: '10%',
          height: '4px',
          background: '#e0e0e0',
          zIndex: 0
        }} />

        {/* Active Progress Line */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '10%',
          width: `${(currentIdx / (steps.length - 1)) * 80}%`,
          height: '4px',
          background: '#2e7d32',
          zIndex: 0,
          transition: 'width 0.3s ease'
        }} />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIdx;
          return (
            <div key={step} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 6px',
                background: isDone ? '#2e7d32' : '#e0e0e0', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem'
              }}>
                {isDone ? <CheckCircle size={18} /> : idx + 1}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: isDone ? '700' : '400', color: isDone ? '#2e7d32' : '#777' }}>
                {step.replace(/_/g, ' ')}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px', margin: '30px auto' }}>
      {/* Sidebar Navigation */}
      <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: activeTab === 'profile' ? 'rgba(240, 136, 4, 0.15)' : 'none',
            color: activeTab === 'profile' ? '#f08804' : 'var(--text-dark)',
            fontWeight: activeTab === 'profile' ? '700' : '500',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '4px'
          }}
        >
          <User size={18} /> Profile & Addresses
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: activeTab === 'orders' ? 'rgba(240, 136, 4, 0.15)' : 'none',
            color: activeTab === 'orders' ? '#f08804' : 'var(--text-dark)',
            fontWeight: activeTab === 'orders' ? '700' : '500',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '4px'
          }}
        >
          <Package size={18} /> Your Orders
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: activeTab === 'notifications' ? 'rgba(240, 136, 4, 0.15)' : 'none',
            color: activeTab === 'notifications' ? '#f08804' : 'var(--text-dark)',
            fontWeight: activeTab === 'notifications' ? '700' : '500',
            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'
          }}
        >
          <Bell size={18} /> Notifications
        </button>
      </div>

      {/* Main Content Area */}
      <div>
        {activeTab === 'profile' && (
          <div>
            {/* Account Card Banner */}
            <div style={{ background: 'linear-gradient(135deg, #131921 0%, #232f3e 100%)', color: 'white', padding: '24px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ background: '#febd69', color: '#111', fontWeight: '800', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase' }}>
                  {user?.role || 'CUSTOMER'} ACCOUNT
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px' }}>{fullName || user?.username}</h2>
                <div style={{ fontSize: '0.9rem', color: '#ccc', display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {user?.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {phoneNumber || 'Not provided'}</span>
                </div>
              </div>
              <ShieldCheck size={48} color="#febd69" />
            </div>

            {/* Profile & Address Edit Form */}
            <div style={{ background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="#f08804" /> Personal & Contact Details
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                View and update your phone number, full name, and delivery address preferences.
              </p>

              {profileMsg && (
                <div style={{ background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', padding: '12px', borderRadius: '8px', fontWeight: '700', marginBottom: '16px' }}>
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>
                      Mobile Phone Number (India)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)', fontWeight: '600' }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', pt: '16px', marginTop: '16px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="#007185" /> Saved Shipping Address
                  </h3>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Street Address / Flat / Building</label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat 402, B-MART Heights, Outer Ring Road"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Bengaluru"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>State</label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Karnataka"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="560103"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={profileLoading} className="btn-amber" style={{ width: 'auto', padding: '10px 28px', fontSize: '0.95rem' }}>
                  {profileLoading ? 'Saving Changes...' : 'Save Profile & Address'}
                </button>
              </form>
            </div>

            {/* Security & Password */}
            <div style={{ background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#f08804" /> Security & Password
              </h2>
              {passMsg && <div style={{ color: 'green', fontWeight: '700', marginBottom: '14px' }}>{passMsg}</div>}
              {passError && <div style={{ color: 'red', fontWeight: '700', marginBottom: '14px' }}>{passError}</div>}
              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title={showOldPassword ? "Hide password" : "Show password"}
                      >
                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>New Password (Min 6 chars)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-dark)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Update Password</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={{ background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>Your Order History</h2>

            {ordersLoading ? (
              <div>Loading your orders...</div>
            ) : orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>You have not placed any orders yet.</p>
            ) : (
              orders.map(o => (
                <div key={o.orderId} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Order #{o.orderId}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed on: {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>₹{Number(o.totalAmount).toLocaleString('en-IN')}</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                          {o.status}
                        </span>
                        <button
                          onClick={() => setSelectedInvoiceOrder(o)}
                          style={{
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={14} /> Download Invoice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Pipeline Visualizer */}
                  {renderStatusPipeline(o.status)}

                  {/* Items List */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px' }}>Items in this order:</div>
                    {o.orderItems?.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                        <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ flex: 1, fontSize: '0.9rem' }}>
                          <span style={{ fontWeight: '600' }}>{item.product.name}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>x {item.quantity}</span>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>₹{Number(item.totalPrice).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            {/* Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={24} color="#f08804" />
                  <span>In-App Notifications</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                      {notifications.filter(n => !n.read).length} UNREAD
                    </span>
                  )}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
                  Stay updated on your orders, payment confirmations, and account activity.
                </p>
              </div>

              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllNotificationsRead}
                  style={{
                    background: 'rgba(0, 113, 133, 0.1)',
                    color: '#007185',
                    border: '1px solid #007185',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCheck size={16} /> Mark All as Read
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {['all', 'unread', 'read'].map(filterKey => {
                const count = filterKey === 'all'
                  ? notifications.length
                  : filterKey === 'unread'
                  ? notifications.filter(n => !n.read).length
                  : notifications.filter(n => n.read).length;

                return (
                  <button
                    key={filterKey}
                    onClick={() => setNotifFilter(filterKey)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                      background: notifFilter === filterKey ? 'var(--text-dark)' : 'var(--body-bg)',
                      color: notifFilter === filterKey ? 'var(--card-bg)' : 'var(--text-dark)',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{filterKey}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.85, background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '10px' }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Notifications List */}
            {(() => {
              const filteredList = notifications.filter(n => {
                if (notifFilter === 'unread') return !n.read;
                if (notifFilter === 'read') return n.read;
                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--body-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    <Bell size={40} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '10px' }} />
                    <p style={{ color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>
                      No {notifFilter !== 'all' ? notifFilter : ''} notifications found.
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredList.map(n => {
                    const isSuccess = n.title?.toLowerCase().includes('success') || n.title?.toLowerCase().includes('confirmed');
                    const isFailed = n.title?.toLowerCase().includes('fail') || n.title?.toLowerCase().includes('cancel');

                    return (
                      <div
                        key={n.notificationId}
                        style={{
                          padding: '16px 20px',
                          borderRadius: '12px',
                          background: n.read ? 'var(--body-bg)' : 'rgba(240, 136, 4, 0.08)',
                          border: `1px solid ${n.read ? 'var(--border-color)' : '#f08804'}`,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Icon */}
                        <div style={{
                          padding: '10px',
                          borderRadius: '10px',
                          background: isSuccess ? 'rgba(34, 197, 94, 0.15)' : isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(240, 136, 4, 0.15)',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {isSuccess ? (
                            <CheckCircle2 size={20} color="#22c55e" />
                          ) : isFailed ? (
                            <AlertCircle size={20} color="#ef4444" />
                          ) : (
                            <Bell size={20} color="#f08804" />
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <h4 style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-dark)', margin: 0 }}>
                              {n.title}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p style={{ color: 'var(--text-dark)', fontSize: '0.85rem', marginTop: '6px', marginBottom: '8px', lineHeight: '1.4' }}>
                            {n.message}
                          </p>

                          {/* Quick Action Link if message contains Order ID */}
                          {n.message?.includes('#ORD-') && (
                            <button
                              onClick={() => setActiveTab('orders')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#007185',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px'
                              }}
                            >
                              <Package size={14} /> View Order Details <ArrowRight size={12} />
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {!n.read && (
                            <button
                              onClick={() => markNotificationRead(n.notificationId)}
                              style={{
                                background: '#007185',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Mark Read
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotificationItem(n.notificationId)}
                            title="Delete notification"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Invoice Modal for Selected Order in Order History */}
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
}
