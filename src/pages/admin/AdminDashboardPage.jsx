import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { productApi } from '../../api/productApi';
import { 
  ShieldCheck, Users, Store, Package, DollarSign, CheckCircle, 
  XCircle, AlertTriangle, RefreshCw, Plus, Calendar, FileText, 
  Clipboard, Undo, ShieldAlert, Award, ArrowLeft, PlusCircle, 
  Edit, Trash2, Search, Filter, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  // Data state
  const [analytics, setAnalytics] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters for Product Catalog
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  // Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Editing draft state
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: '',
    status: ''
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '',
    status: '',
    categoryId: ''
  });

  // Form states for Category Creator
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryImg, setNewCategoryImg] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const fetchDashboardData = () => {
    setLoading(true);
    
    // Fetch categories
    productApi.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});

    // Fetch site analytics
    adminApi.getSiteAnalytics().then(res => {
      if (res.success) setAnalytics(res.data);
    }).catch(() => {});

    // Fetch pending applications
    adminApi.getPendingSellers().then(res => {
      if (res.success) setPendingSellers(res.data);
    }).catch(() => {});

    // Fetch all products
    adminApi.getAllProducts().then(res => {
      if (res.success) setAllProducts(res.data);
    }).catch(() => {});

    // Fetch payout requests
    adminApi.getPendingPayouts().then(res => {
      if (res.success) setPendingPayouts(res.data);
    }).catch(() => {});

    // Fetch platform orders
    adminApi.getAllOrders(0, 50).then(res => {
      if (res.success && res.data) setOrders(res.data.content || []);
    }).catch(() => {});

    // Fetch audit logs
    adminApi.getAuditLogs().then(res => {
      if (res.success) setAuditLogs(res.data);
    }).catch(() => {});

    // Fetch user list
    adminApi.getUsers(0, 50).then(res => {
      if (res.success && res.data) setUsers(res.data.content || []);
    }).finally(() => setLoading(false));
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

  const handleProcessRefund = (orderId) => {
    const reason = prompt('Reason for processing order refund:');
    if (reason) {
      adminApi.processRefund(orderId, reason)
        .then(() => {
          alert('Refund processed successfully.');
          fetchDashboardData();
        })
        .catch(err => alert(err.message || 'Error processing refund'));
    }
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    setCategorySuccess('');
    setCategoryError('');
    
    if (!newCategoryName.trim()) {
      setCategoryError('Category Name is required.');
      return;
    }

    adminApi.createCategory({
      categoryName: newCategoryName.trim(),
      description: newCategoryDesc.trim(),
      imageUrl: newCategoryImg.trim() || '/uploads/handbags/handbag1.jpg'
    }).then(res => {
      if (res.success) {
        setCategorySuccess('Category created successfully!');
        setNewCategoryName('');
        setNewCategoryDesc('');
        setNewCategoryImg('');
        
        // Refresh categories list
        productApi.getCategories().then(cRes => {
          if (cRes.success) setCategories(cRes.data);
        }).catch(() => {});
        
        fetchDashboardData();
      } else {
        setCategoryError(res.message || 'Failed to create category.');
      }
    }).catch(err => {
      setCategoryError(err.message || 'Error occurred while creating category.');
    });
  };

  // User Actions (Phase 8 Extension)
  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'CUSTOMER',
      status: user.status || 'ACTIVE'
    });
  };

  const handleUserUpdate = (e) => {
    e.preventDefault();
    adminApi.updateUser(editingUser.userId, {
      ...editingUser,
      fullName: userForm.fullName,
      username: userForm.username,
      email: userForm.email,
      phoneNumber: userForm.phoneNumber,
      role: userForm.role,
      status: userForm.status
    }).then(res => {
      if (res.success) {
        alert('User details updated successfully.');
        setEditingUser(null);
        fetchDashboardData();
      } else {
        alert(res.message || 'Failed to update user.');
      }
    }).catch(err => {
      alert(err.message || 'Error updating user.');
    });
  };

  // Product Actions (Phase 9 Extension)
  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      brand: product.brand || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '0',
      status: product.status || 'PENDING',
      categoryId: product.category?.categoryId || ''
    });
  };

  const handleProductUpdate = (e) => {
    e.preventDefault();
    adminApi.updateProduct(editingProduct.productId, {
      ...editingProduct,
      name: productForm.name,
      brand: productForm.brand,
      price: parseFloat(productForm.price),
      discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
      stock: parseInt(productForm.stock),
      status: productForm.status,
      category: {
        categoryId: parseInt(productForm.categoryId)
      }
    }).then(res => {
      if (res.success) {
        alert('Product parameters updated successfully.');
        setEditingProduct(null);
        fetchDashboardData();
      } else {
        alert(res.message || 'Failed to update product.');
      }
    }).catch(err => {
      alert(err.message || 'Error updating product.');
    });
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) {
      adminApi.deleteProduct(productId).then(res => {
        if (res.success) {
          alert('Product successfully removed from catalog.');
          fetchDashboardData();
        } else {
          alert(res.message || 'Failed to delete product.');
        }
      }).catch(err => {
        alert(err.message || 'Error deleting product.');
      });
    }
  };

  const handleApproveProductDirect = (productId) => {
    adminApi.approveProduct(productId).then(() => fetchDashboardData());
  };

  // Filter lists
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesStatus = productStatusFilter === '' || p.status === productStatusFilter;
    const matchesCategory = productCategoryFilter === '' || p.category?.categoryId === parseInt(productCategoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.fullName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === '' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const pendingProductsCount = allProducts.filter(p => p.status === 'PENDING').length;

  return (
    <div className="container" style={{ margin: '30px auto' }}>
      
      {/* Admin Portal Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', 
        color: 'white', 
        padding: '30px 40px', 
        borderRadius: '16px', 
        marginBottom: '32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1, pointerEvents: 'none' }}>
          <ShieldCheck size={280} color="white" />
        </div>
        <div style={{ zIndex: 1 }}>
          <span style={{ 
            background: '#d97706', 
            color: 'white', 
            fontWeight: '800', 
            fontSize: '0.7rem', 
            padding: '4px 12px', 
            borderRadius: '12px', 
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'inline-block'
          }}>
            SUPER ADMIN CONTROL PANEL
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '10px', color: 'white', letterSpacing: '-1px' }}>
            B-MART Oversight Portal
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>
            Manage users, sellers, catalog moderation, orders, refunds, and view live system logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
          <Link to="/" className="admin-btn-action admin-btn-secondary" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '8px' }}>
            <ArrowLeft size={16} /> Home Shop
          </Link>
          <button 
            onClick={fetchDashboardData} 
            className="admin-btn-action admin-btn-approve" 
            style={{ padding: '12px 24px', borderRadius: '8px', background: '#d97706' }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} style={{ marginRight: '4px' }} />
            {loading ? "Refreshing..." : "Refresh Logs"}
          </button>
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="admin-metric-grid">
        <div className="admin-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="admin-metric-title">Platform Users</span>
              <Users size={20} color="var(--text-muted)" />
            </div>
            <div className="admin-metric-value">{analytics?.totalUsers || 0}</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Registered profiles</div>
        </div>

        <div className="admin-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="admin-metric-title">Active Sellers</span>
              <Store size={20} color="#d97706" />
            </div>
            <div className="admin-metric-value" style={{ color: '#d97706' }}>{analytics?.totalSellers || 0}</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Approved merchant stores</div>
        </div>

        <div className="admin-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="admin-metric-title">Total Listings</span>
              <Package size={20} color="var(--text-muted)" />
            </div>
            <div className="admin-metric-value">{analytics?.totalProducts || 0}</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Catalog items approved</div>
        </div>

        <div className="admin-metric-card">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="admin-metric-title">Total Orders</span>
              <DollarSign size={20} color="#2e7d32" />
            </div>
            <div className="admin-metric-value" style={{ color: '#2e7d32' }}>{analytics?.totalOrders || 0}</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Completed transactions</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ background: 'var(--card-bg)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="admin-tabs-nav">
          <button onClick={() => setActiveTab('analytics')} className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
            Overview
          </button>
          <button onClick={() => setActiveTab('sellers')} className={`admin-tab-btn ${activeTab === 'sellers' ? 'active' : ''}`}>
            Vendor Applications ({pendingSellers.length})
          </button>
          <button onClick={() => setActiveTab('products')} className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}>
            Products Catalog ({allProducts.length}) {pendingProductsCount > 0 && <span style={{ color: '#c53030', fontSize: '0.75rem', fontWeight: 'bold' }}>({pendingProductsCount} pending)</span>}
          </button>
          <button onClick={() => setActiveTab('payouts')} className={`admin-tab-btn ${activeTab === 'payouts' ? 'active' : ''}`}>
            Payout Requests ({pendingPayouts.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}>
            User Oversight ({users.length})
          </button>
          <button onClick={() => setActiveTab('categories')} className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}>
            Categories Manager
          </button>
          <button onClick={() => setActiveTab('orders')} className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}>
            Orders & Refunds
          </button>
          <button onClick={() => setActiveTab('audit')} className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}>
            Audit Trail Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab 0: Overview/Analytics Summary */}
        {activeTab === 'analytics' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Platform Overview Summary</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Welcome back to your dashboard! Here is a summary of items requiring your immediate review:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'var(--nav-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
                  <Store size={18} color="#d97706" /> Vendor Approvals
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  There are currently <strong>{pendingSellers.length}</strong> seller application(s) pending verification checks.
                </p>
                <button onClick={() => setActiveTab('sellers')} className="admin-btn-action admin-btn-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.75rem' }}>
                  Go to Queue
                </button>
              </div>

              <div style={{ background: 'var(--nav-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
                  <Package size={18} color="var(--text-dark)" /> Catalog Listings
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  There are currently <strong>{pendingProductsCount}</strong> catalog items awaiting product quality approvals.
                </p>
                <button onClick={() => setActiveTab('products')} className="admin-btn-action admin-btn-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.75rem' }}>
                  Moderate Listings
                </button>
              </div>

              <div style={{ background: 'var(--nav-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dark)' }}>
                  <DollarSign size={18} color="#2e7d32" /> Payout Withdrawals
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  There are currently <strong>{pendingPayouts.length}</strong> withdrawal requests waiting bank transfer authorization.
                </p>
                <button onClick={() => setActiveTab('payouts')} className="admin-btn-action admin-btn-secondary" style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.75rem' }}>
                  Review Payouts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Pending Sellers */}
        {activeTab === 'sellers' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Pending Vendor Applications</h3>
            {pendingSellers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--nav-light)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                No pending seller applications requiring approval.
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Store Name</th>
                      <th>Applicant Email</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSellers.map(s => (
                      <tr key={s.sellerId}>
                        <td style={{ fontWeight: '700' }}>{s.storeName}</td>
                        <td>{s.user?.email}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.storeDescription || 'N/A'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleApproveSeller(s.sellerId)} className="admin-btn-action admin-btn-approve" style={{ marginRight: '6px' }}>
                            Approve
                          </button>
                          <button onClick={() => handleRejectSeller(s.sellerId)} className="admin-btn-action admin-btn-reject">
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Products Catalog (Enhanced CRUD Panel) */}
        {activeTab === 'products' && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Products Catalog Control Panel</h3>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={productSearch} 
                  onChange={e => setProductSearch(e.target.value)} 
                  placeholder="Search products by name or brand..." 
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <div style={{ width: '180px' }}>
                <select 
                  value={productStatusFilter} 
                  onChange={e => setProductStatusFilter(e.target.value)}
                  style={{ height: '45px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--body-bg)', padding: '0 12px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>

              <div style={{ width: '200px' }}>
                <select 
                  value={productCategoryFilter} 
                  onChange={e => setProductCategoryFilter(e.target.value)}
                  style={{ height: '45px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--body-bg)', padding: '0 12px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--nav-light)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                No products found matching the search criteria.
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product details</th>
                      <th>Brand</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.productId}>
                        <td>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img src={p.imageUrl} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: 'var(--img-bg)', border: '1px solid var(--border-color)' }} />
                            <div>
                              <div style={{ fontWeight: '700' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Category: {p.category?.categoryName}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-dark)' }}>{p.brand}</td>
                        <td style={{ fontWeight: '600' }}>{p.stock}</td>
                        <td>
                          <div style={{ fontWeight: '700' }}>₹{p.price}</div>
                          {p.discountPrice && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.discountPrice}</div>
                          )}
                        </td>
                        <td>
                          <span className={`admin-badge ${
                            p.status === 'APPROVED' ? 'admin-badge-success' :
                            p.status === 'PENDING' ? 'admin-badge-warning' :
                            'admin-badge-danger'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {p.status === 'PENDING' && (
                              <button 
                                onClick={() => handleApproveProductDirect(p.productId)} 
                                className="admin-btn-action admin-btn-approve"
                                title="Quick Approve"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => openEditProduct(p)} 
                              className="admin-btn-action admin-btn-secondary"
                              title="Edit Product"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.productId)} 
                              className="admin-btn-action admin-btn-reject"
                              title="Delete Product"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pending Payouts */}
        {activeTab === 'payouts' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Pending Seller Withdrawal Requests</h3>
            {pendingPayouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--nav-light)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                No pending seller withdrawal requests.
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Seller Store</th>
                      <th>Requested Amount</th>
                      <th>Bank Details</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayouts.map(po => (
                      <tr key={po.id}>
                        <td style={{ fontWeight: '700' }}>{po.seller?.storeName}</td>
                        <td style={{ fontWeight: '800', color: '#2e7d32' }}>₹{po.amount}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{po.bankDetails}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleApprovePayout(po.id)} className="admin-btn-action admin-btn-approve">
                            Approve & Transfer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: User Control (Enhanced CRUD Panel) */}
        {activeTab === 'users' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Platform Users Oversight</h3>
            
            {/* User Search & Role Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={userSearch} 
                  onChange={e => setUserSearch(e.target.value)} 
                  placeholder="Search users by name, username, email..." 
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <div style={{ width: '180px' }}>
                <select 
                  value={userRoleFilter} 
                  onChange={e => setUserRoleFilter(e.target.value)}
                  style={{ height: '45px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--body-bg)', padding: '0 12px' }}
                >
                  <option value="">All Roles</option>
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_SELLER">Seller</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ROLE_USER">User</option>
                </select>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--nav-light)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                No users found.
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.userId}>
                        <td>
                          <div style={{ fontWeight: '700' }}>{u.fullName || 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ color: 'var(--text-dark)' }}>{u.username}</td>
                        <td>
                          <span className={`admin-badge ${u.role === 'ROLE_ADMIN' || u.role === 'ADMIN' ? 'admin-badge-danger' : u.role === 'ROLE_SELLER' ? 'admin-badge-warning' : 'admin-badge-info'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${u.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => openEditUser(u)} 
                              className="admin-btn-action admin-btn-secondary"
                              title="Edit User profile details"
                            >
                              <Edit size={14} style={{ marginRight: '2px' }} /> Edit
                            </button>
                            <button 
                              onClick={() => handleSetCommission(u.userId)} 
                              className="admin-btn-action admin-btn-secondary" 
                              title="Set custom commission"
                            >
                              Commission
                            </button>
                            <button onClick={() => handleSuspendUser(u.userId)} className="admin-btn-action admin-btn-secondary">
                              Suspend
                            </button>
                            <button onClick={() => handleBanUser(u.userId)} className="admin-btn-action admin-btn-reject">
                              Ban
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Categories Manager */}
        {activeTab === 'categories' && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
              
              {/* Category List */}
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Platform Categories</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Category Info</th>
                        <th>Slug</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(c => (
                        <tr key={c.categoryId}>
                          <td>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {c.imageUrl && (
                                <img src={c.imageUrl} alt={c.categoryName} style={{ width: '36px', height: '36px', objectFit: 'contain', background: 'var(--img-bg)', borderRadius: '4px' }} />
                              )}
                              <div style={{ fontWeight: '700' }}>{c.categoryName}</div>
                            </div>
                          </td>
                          <td><code>{c.slug || c.categoryName.toLowerCase()}</code></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.description || 'No description provided'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Create Category Form */}
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Create Category</h3>
                <form onSubmit={handleCreateCategory} className="admin-form-box">
                  {categorySuccess && (
                    <div style={{ background: '#e6fffa', color: '#234e52', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px', fontWeight: '600' }}>
                      {categorySuccess}
                    </div>
                  )}
                  {categoryError && (
                    <div style={{ background: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '12px', fontWeight: '600' }}>
                      {categoryError}
                    </div>
                  )}
                  
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category Name</label>
                    <input 
                      type="text" 
                      value={newCategoryName} 
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Duffels"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Description</label>
                    <textarea 
                      value={newCategoryDesc} 
                      onChange={e => setNewCategoryDesc(e.target.value)}
                      placeholder="Enter description..."
                      rows="3"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Image Path / URL</label>
                    <input 
                      type="text" 
                      value={newCategoryImg} 
                      onChange={e => setNewCategoryImg(e.target.value)}
                      placeholder="e.g. /uploads/travelbags/travel2.jpg"
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                    <PlusCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Create Category
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* Tab 6: Orders & Refunds */}
        {activeTab === 'orders' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Platform Orders Oversight</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.orderId}>
                      <td style={{ fontWeight: '700' }}>{o.orderId}</td>
                      <td>{o.user?.email || 'N/A'}</td>
                      <td style={{ fontWeight: '700' }}>₹{o.totalPrice}</td>
                      <td>
                        <span className={`admin-badge ${
                          o.status === 'DELIVERED' ? 'admin-badge-success' :
                          o.status === 'REFUNDED' || o.status === 'CANCELLED' ? 'admin-badge-danger' :
                          'admin-badge-warning'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {o.status !== 'REFUNDED' && o.status !== 'CANCELLED' && (
                          <button onClick={() => handleProcessRefund(o.orderId)} className="admin-btn-action admin-btn-reject">
                            Process Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Audit Logs */}
        {activeTab === 'audit' && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Platform Security Audit Trail</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Historical feed of system administrative operations and changes.
            </p>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--card-bg)', overflow: 'hidden' }}>
              {auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No platform audit logs recorded yet.
                </div>
              ) : (
                <div>
                  {auditLogs.map(log => (
                    <div key={log.id} className="audit-log-item">
                      <div className="audit-log-header">
                        <span className="audit-log-action-badge">{log.action}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> 
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)', marginTop: '4px' }}>
                        Admin: <strong>{log.adminEmail}</strong> performed action on target <strong>{log.targetType} ({log.targetId})</strong>.
                      </div>
                      {log.reason && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          background: 'var(--nav-light)', 
                          padding: '10px 14px', 
                          borderRadius: '6px', 
                          color: 'var(--text-muted)',
                          borderLeft: '3px solid var(--border-color)',
                          marginTop: '6px'
                        }}>
                          Reason: {log.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* User Edit Modal Overlay */}
      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px',
            padding: '30px', width: '480px', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-dark)' }}>Edit User Account</h3>
              <button onClick={() => setEditingUser(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUserUpdate}>
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name</label>
                <input 
                  type="text" 
                  value={userForm.fullName} 
                  onChange={e => setUserForm({...userForm, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Username</label>
                <input 
                  type="text" 
                  value={userForm.username} 
                  onChange={e => setUserForm({...userForm, username: e.target.value})}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email Address</label>
                <input 
                  type="email" 
                  value={userForm.email} 
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Phone Number</label>
                <input 
                  type="text" 
                  value={userForm.phoneNumber} 
                  onChange={e => setUserForm({...userForm, phoneNumber: e.target.value})}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">User Security Role</label>
                <select 
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                  style={{ width: '100%', height: '45px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--body-bg)', padding: '0 12px' }}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ROLE_USER">User (Standard)</option>
                  <option value="ROLE_SELLER">Seller</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Account Status</label>
                <select 
                  value={userForm.status}
                  onChange={e => setUserForm({...userForm, status: e.target.value})}
                  style={{ width: '100%', height: '45px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--body-bg)', padding: '0 12px' }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Profile Changes</button>
                <button type="button" onClick={() => setEditingUser(null)} className="admin-btn-action admin-btn-secondary" style={{ padding: '0 20px', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Edit Modal Overlay */}
      {editingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px',
            padding: '30px', width: '520px', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-dark)' }}>Edit Product Listing Parameters</h3>
              <button onClick={() => setEditingProduct(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProductUpdate}>
              <div className="admin-form-group">
                <label className="admin-form-label">Product Name</label>
                <input 
                  type="text" 
                  value={productForm.name} 
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Brand</label>
                <input 
                  type="text" 
                  value={productForm.brand} 
                  onChange={e => setProductForm({...productForm, brand: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (₹)</label>
                  <input 
                    type="number" step="0.01"
                    value={productForm.price} 
                    onChange={e => setProductForm({...productForm, price: e.target.value})}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Discount Price (₹)</label>
                  <input 
                    type="number" step="0.01"
                    value={productForm.discountPrice} 
                    onChange={e => setProductForm({...productForm, discountPrice: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock Quantity</label>
                  <input 
                    type="number"
                    value={productForm.stock} 
                    onChange={e => setProductForm({...productForm, stock: e.target.value})}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Listing Category</label>
                  <select 
                    value={productForm.categoryId}
                    onChange={e => setProductForm({...productForm, categoryId: e.target.value})}
                    style={{ width: '100%', height: '45px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--body-bg)', padding: '0 12px' }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Moderation Status</label>
                <select 
                  value={productForm.status}
                  onChange={e => setProductForm({...productForm, status: e.target.value})}
                  style={{ width: '100%', height: '45px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--body-bg)', padding: '0 12px' }}
                >
                  <option value="APPROVED">Approved (Live)</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="BANNED">Banned (Off-platform)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Catalog Changes</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="admin-btn-action admin-btn-secondary" style={{ padding: '0 20px', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
