import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { ShieldCheck, Users, Store, Package, DollarSign, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  // Data state
  const [analytics, setAnalytics] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    adminApi.getSiteAnalytics().then(res => { if (res.success) setAnalytics(res.data); });
    adminApi.getPendingSellers().then(res => { if (res.success) setPendingSellers(res.data); });
    adminApi.getPendingProducts().then(res => { if (res.success) setPendingProducts(res.data); });
    adminApi.getPendingPayouts().then(res => { if (res.success) setPendingPayouts(res.data); });
    adminApi.getUsers(0, 50).then(res => { if (res.success && res.data) setUsers(res.data.content || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Admin Actions
  const handleApproveSeller = (id) => {
    adminApi.approveSeller(id).then(() => fetchDashboardData());
  };

  const handleRejectSeller = (id) => {
    const reason = prompt('Reason for rejection:');
    if (reason) adminApi.rejectSeller(id, reason).then(() => fetchDashboardData());
  };

  const handleApproveProduct = (id) => {
    adminApi.approveProduct(id).then(() => fetchDashboardData());
  };

  const handleBanProduct = (id) => {
    const reason = prompt('Reason for banning product:');
    if (reason) adminApi.banProduct(id, reason).then(() => fetchDashboardData());
  };

  const handleSuspendUser = (id) => {
    const reason = prompt('Reason for user suspension:');
    if (reason) adminApi.suspendUser(id, reason).then(() => fetchDashboardData());
  };

  const handleBanUser = (id) => {
    const reason = prompt('Reason for user ban:');
    if (reason) adminApi.banUser(id, reason).then(() => fetchDashboardData());
  };

  const handleApprovePayout = (id) => {
    const note = prompt('Payout transfer reference note:');
    adminApi.approvePayout(id, note || 'Approved').then(() => fetchDashboardData());
  };

  const handleSetCommission = (sellerId) => {
    const rate = prompt('Enter custom commission rate (%):');
    if (rate && !isNaN(rate)) {
      adminApi.setSellerCommission(sellerId, parseFloat(rate)).then(() => fetchDashboardData());
    }
  };

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      {/* Admin Portal Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #131921 0%, #232f3e 100%)', color: 'white', padding: '24px 30px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ background: '#febd69', color: '#111', fontWeight: '800', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
            SUPER ADMIN OVERSIGHT PORTAL
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '6px' }}>B-MART Platform Administration</h2>
        </div>
        <button onClick={fetchDashboardData} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
          <RefreshCw size={18} /> Refresh Portal
        </button>
      </div>

      {/* Metric Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: '700' }}>TOTAL USERS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px' }}>{analytics?.totalUsers || 0}</div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: '700' }}>TOTAL VENDORS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: '#f08804' }}>{analytics?.totalSellers || 0}</div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: '700' }}>TOTAL PRODUCTS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px' }}>{analytics?.totalProducts || 0}</div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: '700' }}>PLATFORM ORDERS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '4px', color: '#2e7d32' }}>{analytics?.totalOrders || 0}</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('sellers')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'sellers' ? '#131921' : '#f7f7f7', color: activeTab === 'sellers' ? 'white' : '#333', fontWeight: '700', cursor: 'pointer' }}>
            Pending Sellers ({pendingSellers.length})
          </button>
          <button onClick={() => setActiveTab('products')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'products' ? '#131921' : '#f7f7f7', color: activeTab === 'products' ? 'white' : '#333', fontWeight: '700', cursor: 'pointer' }}>
            Pending Products ({pendingProducts.length})
          </button>
          <button onClick={() => setActiveTab('payouts')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'payouts' ? '#131921' : '#f7f7f7', color: activeTab === 'payouts' ? 'white' : '#333', fontWeight: '700', cursor: 'pointer' }}>
            Payout Requests ({pendingPayouts.length})
          </button>
          <button onClick={() => setActiveTab('users')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? '#131921' : '#f7f7f7', color: activeTab === 'users' ? 'white' : '#333', fontWeight: '700', cursor: 'pointer' }}>
            User Management ({users.length})
          </button>
        </div>

        {/* Tab 1: Pending Sellers */}
        {activeTab === 'sellers' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Pending Vendor Applications</h3>
            {pendingSellers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', background: '#fafafa', borderRadius: '8px' }}>
                No pending seller applications requiring approval.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px' }}>Store Name</th>
                    <th style={{ padding: '12px' }}>Applicant Email</th>
                    <th style={{ padding: '12px' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.map(s => (
                    <tr key={s.sellerId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{s.storeName}</td>
                      <td style={{ padding: '12px' }}>{s.user?.email}</td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '0.85rem' }}>{s.storeDescription || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => handleApproveSeller(s.sellerId)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
                          Approve Seller
                        </button>
                        <button onClick={() => handleRejectSeller(s.sellerId)} style={{ background: '#c53030', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Pending Products */}
        {activeTab === 'products' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Pending Product Listings</h3>
            {pendingProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', background: '#fafafa', borderRadius: '8px' }}>
                No pending product listings to review.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Store Vendor</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProducts.map(p => (
                    <tr key={p.productId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div style={{ fontWeight: '700' }}>{p.name}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{p.seller?.storeName || 'B-MART Direct'}</td>
                      <td style={{ padding: '12px', fontWeight: '700' }}>₹{p.price}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => handleApproveProduct(p.productId)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem', fontWeight: '700' }}>
                          Approve Listing
                        </button>
                        <button onClick={() => handleBanProduct(p.productId)} style={{ background: '#c53030', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          Ban Product
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Pending Payouts */}
        {activeTab === 'payouts' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Pending Seller Withdrawal Requests</h3>
            {pendingPayouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#666', background: '#fafafa', borderRadius: '8px' }}>
                No pending seller withdrawal requests.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px' }}>Seller Store</th>
                    <th style={{ padding: '12px' }}>Requested Amount</th>
                    <th style={{ padding: '12px' }}>Bank Account Details</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayouts.map(po => (
                    <tr key={po.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{po.seller?.storeName}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#2e7d32' }}>₹{po.amount}</td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '0.85rem' }}>{po.bankDetails}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => handleApprovePayout(po.id)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>
                          Approve Payout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 4: User Control */}
        {activeTab === 'users' && (
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Platform Users Oversight</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px' }}>User</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '700' }}>{u.fullName || u.username}</div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: u.role === 'ROLE_ADMIN' ? '#ebf8ff' : '#fafafa', color: u.role === 'ROLE_ADMIN' ? '#2b6cb0' : '#4a5568', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: u.status === 'ACTIVE' ? '#e6fffa' : '#fff5f5', color: u.status === 'ACTIVE' ? '#234e52' : '#c53030', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button onClick={() => handleSuspendUser(u.userId)} style={{ background: '#edf2f7', color: '#2d3748', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '4px', fontSize: '0.75rem' }}>
                        Suspend
                      </button>
                      <button onClick={() => handleBanUser(u.userId)} style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Ban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
