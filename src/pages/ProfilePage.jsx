import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userApi, orderApi, notificationApi } from '../api/shopApi';
import { updateUser } from '../store/slices/authSlice';
import { User, MapPin, Package, Bell, KeyRound, CheckCircle, Phone, Mail, ShieldCheck, Edit3 } from 'lucide-react';

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
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);

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

  const renderStatusPipeline = (status) => {
    const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = steps.indexOf(status);

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0', position: 'relative' }}>
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
      <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #ddd', height: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
            background: activeTab === 'profile' ? '#fff8e7' : 'none',
            color: activeTab === 'profile' ? '#f08804' : '#333',
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
            background: activeTab === 'orders' ? '#fff8e7' : 'none',
            color: activeTab === 'orders' ? '#f08804' : '#333',
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
            background: activeTab === 'notifications' ? '#fff8e7' : 'none',
            color: activeTab === 'notifications' ? '#f08804' : '#333',
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
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="#f08804" /> Personal & Contact Details
              </h2>
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '20px' }}>
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
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
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
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: '600' }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #eee', pt: '16px', marginTop: '16px', marginBottom: '16px' }}>
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
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
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
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>State</label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Karnataka"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="560103"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
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
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#f08804" /> Security & Password
              </h2>
              {passMsg && <div style={{ color: 'green', fontWeight: '700', marginBottom: '14px' }}>{passMsg}</div>}
              {passError && <div style={{ color: 'red', fontWeight: '700', marginBottom: '14px' }}>{passError}</div>}
              <form onSubmit={handleChangePassword}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>New Password (Min 6 chars)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Update Password</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>Your Order History</h2>

            {ordersLoading ? (
              <div>Loading your orders...</div>
            ) : orders.length === 0 ? (
              <p style={{ color: '#666' }}>You have not placed any orders yet.</p>
            ) : (
              orders.map(o => (
                <div key={o.orderId} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', pb: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Order #{o.orderId}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Placed on: {new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>₹{o.totalAmount}</div>
                      <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                        {o.status}
                      </span>
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
                          <span style={{ color: '#666', marginLeft: '8px' }}>x {item.quantity}</span>
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>₹{item.totalPrice}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' }}>In-App Notifications</h2>
            {notifications.length === 0 ? (
              <p style={{ color: '#666' }}>No notifications found.</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.notificationId} 
                  style={{
                    padding: '16px', borderRadius: '10px', marginBottom: '12px',
                    background: n.read ? '#fafafa' : '#fff8e7', border: '1px solid #eee',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>{n.title}</h4>
                    <p style={{ color: '#444', fontSize: '0.85rem', marginTop: '4px' }}>{n.message}</p>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markNotificationRead(n.notificationId)}
                      style={{ background: '#007185', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'cursor' }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
