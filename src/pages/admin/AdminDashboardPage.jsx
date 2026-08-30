import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adminApi } from '../../api/adminApi';
import { orderApi, productApi, categoryApi } from '../../api/shopApi';
import { authApi } from '../../api/authApi';
import { setCredentials, logout } from '../../store/slices/authSlice';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCw,
  ShieldCheck,
  Lock,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  LogOut,
  X,
  Building2,
  Eye,
  Calendar,
  PieChart,
  Tag,
  Bell,
  CreditCard,
  UserCheck,
  Edit,
  Trash2
} from 'lucide-react';

// --- ROBUST DATE PARSER FOR JAVA LOCALDATETIME ARRAYS [YYYY, MM, DD, ...] AND ISO STRINGS ---
const getOrderDateObj = (createdAt, orderId) => {
  if (createdAt) {
    if (Array.isArray(createdAt) && createdAt.length >= 3) {
      const year = Number(createdAt[0]);
      const month = Number(createdAt[1]) - 1;
      const day = Number(createdAt[2]);
      const hour = createdAt.length >= 4 ? Number(createdAt[3]) : 0;
      const min = createdAt.length >= 5 ? Number(createdAt[4]) : 0;
      return new Date(year, month, day, hour, min);
    }
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }

  if (orderId && typeof orderId === 'string') {
    const parts = orderId.split('-');
    if (parts.length >= 2) {
      const ts = Number(parts[1]);
      if (!isNaN(ts) && ts > 1000000000000) {
        return new Date(ts);
      }
    }
  }

  return new Date();
};

const getOrderYear = (o) => {
  const d = getOrderDateObj(o?.createdAt, o?.orderId);
  return d ? d.getFullYear() : null;
};

const getOrderMonth = (o) => {
  const d = getOrderDateObj(o?.createdAt, o?.orderId);
  return d ? d.getMonth() + 1 : null;
};

const getOrderDateStr = (o) => {
  if (!o) return null;

  if (Array.isArray(o.createdAt) && o.createdAt.length >= 3) {
    const y = o.createdAt[0];
    const m = String(o.createdAt[1]).padStart(2, '0');
    const d = String(o.createdAt[2]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const d = getOrderDateObj(o.createdAt, o.orderId);
  if (d && !isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return null;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isAdmin = isAuthenticated && (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [dashboardMode, setDashboardMode] = useState('COMMAND_CENTER'); // COMMAND_CENTER | OPERATIONS_GRID
  const [activeModal, setActiveModal] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const [siteAnalytics, setSiteAnalytics] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedSalesDate, setSelectedSalesDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [selectedDayTrend, setSelectedDayTrend] = useState(null);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '50',
    categoryId: '',
    brand: 'B-MART',
    tags: 'Featured',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  });

  // Selected user state for View Details & Modify User
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [editUserObj, setEditUserObj] = useState(null);

  const isValidCompletedSale = (o) => {
    if (!o) return false;
    const orderStatus = (o.status || '').toUpperCase();
    if (orderStatus === 'CANCELLED' || orderStatus === 'FAILED') return false;
    const payStatus = (o.paymentStatus || '').toUpperCase();
    if (payStatus === 'FAILED' || payStatus === 'CANCELLED') return false;
    return true;
  };

  const loadExecutiveDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const analyticsRes = await adminApi.getSiteAnalytics().catch(() => null);
      if (analyticsRes && (analyticsRes.success || analyticsRes.totalRevenue != null)) {
        setSiteAnalytics(analyticsRes.data || analyticsRes);
      }

      let fetchedOrders = [];
      try {
        const ordersRes = await adminApi.getAllOrders(0, 1000);
        const rawData = ordersRes.data || ordersRes;
        const pageData = rawData.data || rawData;
        if (Array.isArray(pageData)) {
          fetchedOrders = pageData;
        } else if (pageData?.content && Array.isArray(pageData.content)) {
          fetchedOrders = pageData.content;
        } else if (rawData?.content && Array.isArray(rawData.content)) {
          fetchedOrders = rawData.content;
        }
      } catch (err) {
        const uOrders = await orderApi.getUserOrders().catch(() => null);
        if (uOrders && uOrders.data) {
          fetchedOrders = Array.isArray(uOrders.data) ? uOrders.data : (uOrders.data.content || []);
        }
      }
      setAllOrders(fetchedOrders);

      const prodsRes = await productApi.getProducts({ page: 0, size: 500 }).catch(() => null);
      if (prodsRes) {
        const pArray = prodsRes.data?.content || prodsRes.content || (Array.isArray(prodsRes.data) ? prodsRes.data : []);
        setProductsList(pArray);
        setLowStockProducts(pArray.filter((p) => p.stock != null && p.stock <= 5));
      }

      const usersRes = await adminApi.getUsers(0, 500).catch(() => null);
      if (usersRes) {
        const uArray = usersRes.data?.content || usersRes.content || (Array.isArray(usersRes.data) ? usersRes.data : []);
        setUsersList(uArray);
      }

      const catRes = await categoryApi.getAllCategories().catch(() => null);
      if (catRes) {
        const catArray = catRes.data || catRes;
        if (Array.isArray(catArray)) setCategories(catArray);
      }

      adminApi.getPendingSellers().then((res) => { if (res?.success) setPendingSellers(res.data || []); }).catch(() => {});
      adminApi.getPendingProducts().then((res) => { if (res?.success) setPendingProducts(res.data || []); }).catch(() => {});
      adminApi.getPendingPayouts().then((res) => { if (res?.success) setPendingPayouts(res.data || []); }).catch(() => {});
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadExecutiveDashboard();
      const timer = setInterval(() => {
        loadExecutiveDashboard();
      }, 4000);
      const handleFocus = () => loadExecutiveDashboard();
      window.addEventListener('focus', handleFocus);
      return () => {
        clearInterval(timer);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isAdmin]);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await authApi.login({
        emailOrUsername: adminEmail.trim(),
        email: adminEmail.trim(),
        password: adminPassword,
      });

      const authData = res.data || res;
      const userRole = authData.role || authData.user?.role || '';

      if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
        const token = authData.token || authData.accessToken;
        if (token) {
          localStorage.setItem('admin_token', token);
          localStorage.setItem('admin_user', JSON.stringify(authData.user || authData));
        }
        dispatch(setCredentials(authData));
        loadExecutiveDashboard();
      } else {
        setLoginError('Access Denied: Account does not possess Admin privileges.');
      }
    } catch (err) {
      setLoginError(err?.response?.data?.message || err?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    dispatch(logout());
    navigate('/');
  };

  const showNotification = (type, text) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => {
    setActiveModal(null);
    setSelectedDayTrend(null);
    setProductSearchQuery('');
  };

  // Administrative Actions
  const handleApproveSeller = (id) => {
    adminApi.approveSeller(id).then(() => {
      showNotification('success', 'Vendor approved successfully!');
      loadExecutiveDashboard();
    });
  };

  const handleRejectSeller = (id) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      adminApi.rejectSeller(id, reason).then(() => {
        showNotification('success', 'Vendor application rejected.');
        loadExecutiveDashboard();
      });
    }
  };

  const handleApproveProduct = (id) => {
    adminApi.approveProduct(id).then(() => {
      showNotification('success', 'Product listing approved!');
      loadExecutiveDashboard();
    });
  };

  const handleBanProduct = (id) => {
    const reason = prompt('Reason for banning product:');
    if (reason) {
      adminApi.banProduct(id, reason).then(() => {
        showNotification('success', 'Product banned from platform.');
        loadExecutiveDashboard();
      });
    }
  };

  const handleSuspendUser = (id) => {
    const reason = prompt('Reason for user suspension:');
    if (reason) {
      adminApi.suspendUser(id, reason).then(() => {
        showNotification('success', 'User suspended.');
        loadExecutiveDashboard();
      });
    }
  };

  const handleBanUser = (id) => {
    const reason = prompt('Reason for user ban:');
    if (reason) {
      adminApi.banUser(id, reason).then(() => {
        showNotification('success', 'User account banned.');
        loadExecutiveDashboard();
      });
    }
  };

  const handleChangeRole = (userId, currentRole) => {
    const roleChoice = prompt(
      `Modify Access Role for User #${userId}:\nCurrent Role: ${currentRole}\n\nEnter target role (ADMIN, CUSTOMER, SELLER):`,
      currentRole === 'ROLE_ADMIN' || currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'
    );
    if (roleChoice && roleChoice.trim()) {
      const cleanRole = roleChoice.trim().toUpperCase();
      adminApi.changeRole(userId, cleanRole).then(() => {
        showNotification('success', `User #${userId} role updated to ${cleanRole}`);
        setUsersList(prev => prev.map(u => u.userId === userId ? { ...u, role: cleanRole.startsWith('ROLE_') ? cleanRole : `ROLE_${cleanRole}` } : u));
        loadExecutiveDashboard();
      }).catch(err => {
        showNotification('error', err?.response?.data?.message || 'Failed to update user role');
      });
    }
  };

  const handleToggleBanUser = (userId, currentStatus) => {
    if (currentStatus === 'BANNED') {
      adminApi.activateUser(userId).then(() => {
        showNotification('success', `User #${userId} unbanned & restored to ACTIVE status.`);
        setUsersList(prev => prev.map(u => u.userId === userId ? { ...u, status: 'ACTIVE' } : u));
        loadExecutiveDashboard();
      }).catch(err => {
        showNotification('error', err?.response?.data?.message || 'Failed to unban user');
      });
    } else {
      const reason = prompt('Reason for user ban:', 'Violation of terms of service');
      if (reason) {
        adminApi.banUser(userId, reason).then(() => {
          showNotification('success', `User #${userId} banned from platform.`);
          setUsersList(prev => prev.map(u => u.userId === userId ? { ...u, status: 'BANNED' } : u));
          loadExecutiveDashboard();
        }).catch(err => {
          showNotification('error', err?.response?.data?.message || 'Failed to ban user');
        });
      }
    }
  };

  const handleApprovePayout = (id) => {
    const note = prompt('Payout transfer reference note:');
    adminApi.approvePayout(id, note || 'Approved').then(() => {
      showNotification('success', 'Payout request approved!');
      loadExecutiveDashboard();
    });
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    adminApi.createCategory({ categoryName: newCatName.trim(), description: newCatDesc.trim() }).then(() => {
      showNotification('success', `Category "${newCatName}" created!`);
      setNewCatName('');
      setNewCatDesc('');
      closeModal();
      loadExecutiveDashboard();
    });
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.imageUrl) {
      alert('Please fill out Name, Price, Stock, and Image URL.');
      return;
    }

    const catId = newProduct.categoryId && !isNaN(parseInt(newProduct.categoryId, 10))
      ? parseInt(newProduct.categoryId, 10)
      : (categories.length > 0 && categories[0].categoryId ? categories[0].categoryId : 1);

    let finalImgUrl = newProduct.imageUrl.trim();
    const isWebPageUrl = finalImgUrl.includes('/product/') || 
                         finalImgUrl.includes('/item/') || 
                         finalImgUrl.includes('.html') || 
                         finalImgUrl.includes('.php') || 
                         finalImgUrl.includes('yourprint.in') || 
                         finalImgUrl.includes('amazon.') || 
                         finalImgUrl.includes('flipkart.');

    const titleLower = (newProduct.name || '').toLowerCase();
    if (isWebPageUrl || (!finalImgUrl.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)($|\?)/i) && !finalImgUrl.includes('unsplash.com') && !finalImgUrl.includes('imgur.com') && !finalImgUrl.includes('cloudinary.com'))) {
      if (titleLower.includes('backpack') || titleLower.includes('rucksack') || titleLower.includes('bag') || titleLower.includes('tourist') || titleLower.includes('travel')) {
        finalImgUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80';
      } else if (titleLower.includes('shoe') || titleLower.includes('sneaker') || titleLower.includes('nike') || titleLower.includes('footwear')) {
        finalImgUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
      } else if (titleLower.includes('headphone') || titleLower.includes('earphone') || titleLower.includes('audio') || titleLower.includes('sound')) {
        finalImgUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
      } else if (titleLower.includes('watch') || titleLower.includes('smartwatch')) {
        finalImgUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
      } else if (titleLower.includes('shirt') || titleLower.includes('tshirt') || titleLower.includes('apparel') || titleLower.includes('cloth')) {
        finalImgUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80';
      } else if (isWebPageUrl) {
        finalImgUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80';
      }
    }

    const payload = {
      name: newProduct.name.trim(),
      description: newProduct.description.trim() || 'High quality item on B-MART marketplace.',
      price: parseFloat(newProduct.price),
      discountPrice: newProduct.discountPrice ? parseFloat(newProduct.discountPrice) : parseFloat(newProduct.price),
      brand: newProduct.brand ? newProduct.brand.trim() : 'B-MART',
      tags: newProduct.tags ? newProduct.tags.trim() : 'Featured',
      stock: parseInt(newProduct.stock, 10),
      categoryId: catId,
      imageUrl: finalImgUrl
    };

    adminApi.addProduct(payload).then(() => {
      showNotification('success', `Product "${newProduct.name}" created and live on storefront!`);
      closeModal();
      setNewProduct({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        stock: '50',
        categoryId: '',
        brand: 'B-MART',
        tags: 'Featured',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
      });
      loadExecutiveDashboard();
    }).catch(err => {
      showNotification('error', err?.response?.data?.message || 'Failed to add product');
    });
  };

  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete product "${productName || productId}" permanently from the catalog?`)) {
      adminApi.deleteProduct(productId)
        .then(() => {
          showNotification('success', `Product #${productId} deleted from catalog!`);
          loadExecutiveDashboard();
        })
        .catch(err => {
          showNotification('error', err?.response?.data?.message || 'Failed to delete product');
        });
    }
  };

  const handleSaveUserEdit = (e) => {
    e.preventDefault();
    if (!editUserObj) return;

    const payload = {
      username: editUserObj.username || editUserObj.email,
      email: editUserObj.email,
      role: editUserObj.role || 'ROLE_USER',
      fullName: editUserObj.fullName || '',
      phoneNumber: editUserObj.phoneNumber || '',
      status: editUserObj.status || 'ACTIVE',
    };
    if (editUserObj.newPassword && editUserObj.newPassword.trim()) {
      payload.password = editUserObj.newPassword.trim();
    }

    adminApi.updateUser(editUserObj.userId, payload)
      .then(() => {
        showNotification('success', `User account ${editUserObj.email} updated successfully!`);
        setEditUserObj(null);
        loadExecutiveDashboard();
      })
      .catch(err => {
        adminApi.changeRole(editUserObj.userId, editUserObj.role).then(() => {
          showNotification('success', `User role updated to ${editUserObj.role}!`);
          setEditUserObj(null);
          loadExecutiveDashboard();
        }).catch(e2 => {
          showNotification('error', e2?.response?.data?.message || 'Failed to update user');
        });
      });
  };

  const handleUpdateStock = (productId, currentStock, delta) => {
    const newStock = Math.max(0, Number(currentStock) + delta);
    adminApi.updateStock(productId, newStock)
      .then(() => {
        showNotification('success', `Stock updated to ${newStock} units`);
        loadExecutiveDashboard();
      })
      .catch((err) => {
        showNotification('error', err?.response?.data?.message || 'Failed to update product stock');
      });
  };

  const handleEditStockPrompt = (productId, currentStock, productName) => {
    const input = window.prompt(`Enter new stock quantity for "${productName}":`, currentStock);
    if (input !== null && input.trim() !== '') {
      const val = parseInt(input.trim(), 10);
      if (!isNaN(val) && val >= 0) {
        adminApi.updateStock(productId, val)
          .then(() => {
            showNotification('success', `Stock updated to ${val} units`);
            loadExecutiveDashboard();
          })
          .catch((err) => {
            showNotification('error', err?.response?.data?.message || 'Failed to update product stock');
          });
      } else {
        showNotification('error', 'Please enter a valid non-negative number for stock.');
      }
    }
  };

  const handleDeleteUserAccount = (userId, email) => {
    if (window.confirm(`Are you sure you want to permanently delete user account ${email || userId}? This action cannot be undone.`)) {
      adminApi.deleteUser(userId)
        .then(() => {
          showNotification('success', `User ${email} deleted permanently!`);
          setEditUserObj(null);
          loadExecutiveDashboard();
        })
        .catch(err => {
          showNotification('error', err?.response?.data?.message || 'Failed to delete user account');
        });
    }
  };

  const getOrderDateStr = (o) => {
    if (!o) return '';
    const rawDate = o.orderDate || o.createdDate || o.createdAt || o.timestamp || o.date;
    if (!rawDate) return '';

    // 1. Handle Jackson LocalDateTime Array: [year, month, day, hour, minute, second]
    if (Array.isArray(rawDate)) {
      if (rawDate.length >= 3) {
        const y = rawDate[0];
        const m = String(rawDate[1]).padStart(2, '0');
        const d = String(rawDate[2]).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }

    // 2. Handle String date (ISO "2026-08-30T...", SQL "2026-08-30 16:46:21", or "2026-08-30")
    if (typeof rawDate === 'string') {
      const match = rawDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (match) {
        const y = match[1];
        const m = String(match[2]).padStart(2, '0');
        const d = String(match[3]).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }

    // 3. Handle Date object or numeric timestamp
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    } catch (e) {}

    return '';
  };

  const validSalesOrders = allOrders.filter(isValidCompletedSale);
  const liveTotalRevenue = validSalesOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const liveTotalOrders = validSalesOrders.length;
  const liveTotalUsers = siteAnalytics?.totalUsers != null ? Number(siteAnalytics.totalUsers) : usersList.length;
  const liveTotalProducts = siteAnalytics?.totalProducts != null ? Number(siteAnalytics.totalProducts) : productsList.length;

  const calculateLive7DayTrend = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStr}`;
      const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayOrders = validSalesOrders.filter((o) => {
        const oDateStr = getOrderDateStr(o);
        if (!oDateStr) return i === 0;
        return oDateStr === dateStr;
      });

      const dayRev = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const itemsCount = dayOrders.reduce((sum, o) => sum + (o.orderItems?.length || 1), 0);

      days.push({
        day: dayLabel,
        val: dayRev,
        date: dateStr,
        ordersCount: dayOrders.length,
        itemsCount,
        orders: dayOrders,
      });
    }
    return days;
  };

  const live7DayTrend = calculateLive7DayTrend();
  const maxDayVal = Math.max(...live7DayTrend.map((d) => d.val), 100);

  const exportCSV = () => {
    let csv = '=== B-MART EXECUTIVE BUSINESS REPORT ===\n';
    csv += `Report Generated Date,${new Date().toLocaleString()}\n\n`;

    csv += '--- KPI PERFORMANCE SUMMARY ---\n';
    csv += `Gross Lifetime Revenue,₹${Number(liveTotalRevenue).toLocaleString('en-IN')}\n`;
    csv += `Verified Sales Orders,${liveTotalOrders}\n`;
    csv += `Total Catalog Products,${liveTotalProducts}\n`;
    csv += `Total Registered Users,${liveTotalUsers}\n`;
    const aov = liveTotalOrders > 0 ? (liveTotalRevenue / liveTotalOrders).toFixed(2) : 0;
    csv += `Average Order Value (AOV),₹${aov}\n\n`;

    csv += '--- 7-DAY REVENUE PERFORMANCE TREND ---\n';
    csv += 'Day,Date,Orders Count,Revenue (₹)\n';
    live7DayTrend.forEach(d => {
      csv += `"${d.day}","${d.date}",${d.ordersCount},${d.val}\n`;
    });
    csv += '\n';

    csv += '--- DETAILED ORDER TRANSACTIONS LEDGER ---\n';
    csv += 'Order ID,Customer Name,Customer Email,Shipping Address,Payment Mode,Payment Status,Order Status,Items Count & Names,Date,Total Amount (₹)\n';
    validSalesOrders.forEach((o) => {
      const itemsStr = o.orderItems ? o.orderItems.map(i => `${i.product?.name || 'Item'} (x${i.quantity})`).join('; ') : 'N/A';
      const cleanAddr = (o.shippingAddress || '').replace(/"/g, '""');
      csv += `"${o.orderId}","${o.user?.fullName || 'N/A'}","${o.user?.email || 'N/A'}","${cleanAddr}","${o.paymentMode || 'ONLINE'}","${o.paymentStatus || 'SUCCESS'}","${o.status}","${itemsStr}","${getOrderDateStr(o) || ''}",${o.totalAmount}\n`;
    });
    csv += '\n';

    csv += '--- PRODUCT CATALOG INVENTORY STATUS ---\n';
    csv += 'Product ID,Product Name,Brand,Category,Price (₹),Stock Units,Status\n';
    productsList.forEach(p => {
      csv += `"${p.productId}","${p.name}","${p.brand || 'B-MART'}","${p.category?.categoryName || 'General'}",${p.price},${p.stock},"${p.stock <= 5 ? 'LOW STOCK' : 'IN STOCK'}"\n`;
    });
    csv += '\n';

    csv += '--- REGISTERED PLATFORM USERS DIRECTORY ---\n';
    csv += 'User ID,Full Name,Email,Role,Account Status\n';
    usersList.forEach(u => {
      csv += `"${u.userId}","${u.fullName || 'N/A'}","${u.email}","${u.role}","${u.status || 'ACTIVE'}"\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `B-MART_Comprehensive_Business_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('success', 'Comprehensive CSV Business Report generated!');
  };

  const exportWord = () => {
    const aov = liveTotalOrders > 0 ? (liveTotalRevenue / liveTotalOrders).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 0;
    
    let docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>B-MART Executive Business Report</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #0f172a; line-height: 1.5; }
        .header { background: #0284c7; color: #ffffff; padding: 24px; border-radius: 10px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 4px 0 0 0; opacity: 0.9; font-size: 13px; }
        .kpi-grid { display: flex; gap: 16px; margin-bottom: 24px; }
        .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; flex: 1; }
        .kpi-title { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; }
        .kpi-val { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
        h2 { color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 6px; margin-top: 30px; font-size: 18px; }
        table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 12px; }
        th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; }
        td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge-success { background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
        .badge-warning { background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛒 B-MART E-COMMERCE PLATFORM</h1>
        <p>Comprehensive Executive Business Performance & Financial Audit Report</p>
        <p style="margin-top: 10px; font-weight: bold;">Generated Date: ${new Date().toLocaleString('en-IN')}</p>
      </div>

      <h2>1. Executive Summary & KPIs</h2>
      <table style="width: 100%; border: 1px solid #cbd5e1; margin-bottom: 20px;">
        <tr style="background: #f1f5f9;">
          <th style="color: #0f172a; background: #e2e8f0;">Metric Name</th>
          <th style="color: #0f172a; background: #e2e8f0;">Value / Total</th>
        </tr>
        <tr><td><strong>Gross Lifetime Revenue</strong></td><td><strong style="color:#16a34a;">₹${Number(liveTotalRevenue).toLocaleString('en-IN')}</strong></td></tr>
        <tr><td><strong>Verified Sales Orders</strong></td><td><strong>${liveTotalOrders} Orders</strong></td></tr>
        <tr><td><strong>Average Order Value (AOV)</strong></td><td><strong>₹${aov}</strong></td></tr>
        <tr><td><strong>Active Catalog Inventory Items</strong></td><td><strong>${liveTotalProducts} Products</strong></td></tr>
        <tr><td><strong>Registered Customer & Admin Users</strong></td><td><strong>${liveTotalUsers} Accounts</strong></td></tr>
      </table>

      <h2>2. 7-Day Revenue Trend Breakdown</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Date</th><th>Orders Count</th><th>Revenue Generated (₹)</th></tr>
        </thead>
        <tbody>
          ${live7DayTrend.map(d => `
            <tr>
              <td><strong>${d.day}</strong></td>
              <td>${d.date}</td>
              <td>${d.ordersCount} orders</td>
              <td><strong>₹${d.val.toLocaleString('en-IN')}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>3. Complete Order Transactions Ledger (${validSalesOrders.length} Orders)</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th><th>Customer Name & Email</th><th>Payment Mode</th><th>Status</th><th>Order Date</th><th>Total Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${validSalesOrders.map(o => `
            <tr>
              <td><strong>#${o.orderId}</strong></td>
              <td>${o.user?.fullName || 'N/A'}<br/><span style="color:#64748b; font-size:11px;">${o.user?.email || ''}</span></td>
              <td>${o.paymentMode || 'ONLINE'} (${o.paymentStatus || 'SUCCESS'})</td>
              <td><span class="badge-success">${o.status}</span></td>
              <td>${getOrderDateStr(o) || 'N/A'}</td>
              <td><strong>₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>4. Product Inventory & Stock Audit</h2>
      <table>
        <thead>
          <tr><th>Product ID</th><th>Product Title</th><th>Category</th><th>Price</th><th>Stock Units</th><th>Inventory Status</th></tr>
        </thead>
        <tbody>
          ${productsList.map(p => `
            <tr>
              <td>#${p.productId}</td>
              <td><strong>${p.name}</strong></td>
              <td>${p.category?.categoryName || 'General'}</td>
              <td>₹${p.price}</td>
              <td>${p.stock} units</td>
              <td><span class="${p.stock <= 5 ? 'badge-warning' : 'badge-success'}">${p.stock <= 5 ? 'LOW STOCK' : 'IN STOCK'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>5. Registered Platform Users Directory</h2>
      <table>
        <thead>
          <tr><th>User ID</th><th>Full Name</th><th>Email Address</th><th>Role</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${usersList.map(u => `
            <tr>
              <td>#${u.userId}</td>
              <td><strong>${u.fullName || 'N/A'}</strong></td>
              <td>${u.email}</td>
              <td>${u.role}</td>
              <td><span class="${u.status === 'BANNED' ? 'badge-warning' : 'badge-success'}">${u.status || 'ACTIVE'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body></html>`;

    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `B-MART_Executive_Business_Report_${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    showNotification('success', 'Word (.doc) Executive Report generated!');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification('error', 'Please allow popups to export the Excel-style PDF report');
      return;
    }

    const aov = liveTotalOrders > 0 ? (liveTotalRevenue / liveTotalOrders).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>B-MART Executive Business Report (Excel PDF)</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 11px; margin: 0; padding: 20px; background: #ffffff; }
          
          .excel-banner { background: #0f172a; color: #ffffff; padding: 18px 24px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-left: 6px solid #10b981; }
          .excel-banner h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
          .excel-banner p { margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; }

          .kpi-container { display: flex; gap: 12px; margin-bottom: 24px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-top: 3px solid #0284c7; padding: 12px; border-radius: 4px; flex: 1; }
          .kpi-title { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; }
          .kpi-value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 4px; }

          .section-header { font-size: 13px; font-weight: 800; color: #0f172a; background: #e2e8f0; padding: 8px 12px; border-left: 4px solid #0284c7; margin: 24px 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10.5px; }
          th { background: #1e293b; color: #ffffff; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #0f172a; text-transform: uppercase; font-size: 9.5px; }
          td { border: 1px solid #cbd5e1; padding: 7px 10px; vertical-align: middle; }
          tr:nth-child(even) { background: #f8fafc; }

          .excel-badge-green { background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 9px; border: 1px solid #86efac; }
          .excel-badge-red { background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 9px; border: 1px solid #fca5a5; }
          .excel-num { text-align: right; font-weight: 700; font-family: 'Consolas', 'Courier New', monospace; }
          
          .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="excel-banner">
          <div>
            <h1>📊 B-MART EXECUTIVE BUSINESS REPORT</h1>
            <p>Full Financial Audit, Revenue Trends & Inventory Ledger (Excel Grid Format)</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: bold; color: #10b981;">STATUS: VERIFIED LIVE DB DATA</div>
            <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">Date: ${new Date().toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="kpi-container">
          <div class="kpi-card">
            <div class="kpi-title">Gross Lifetime Revenue</div>
            <div class="kpi-value" style="color: #16a34a;">₹${Number(liveTotalRevenue).toLocaleString('en-IN')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Verified Sales Orders</div>
            <div class="kpi-value" style="color: #2563eb;">${liveTotalOrders}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Average Order Value</div>
            <div class="kpi-value" style="color: #d97706;">₹${aov}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Catalog Inventory Items</div>
            <div class="kpi-value" style="color: #9333ea;">${liveTotalProducts}</div>
          </div>
        </div>

        <div class="section-header">1. 7-Day Revenue & Sales Performance Trend</div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Day</th>
              <th style="width: 25%;">Date</th>
              <th style="width: 25%;">Orders Count</th>
              <th style="width: 35%; text-align: right;">Revenue Generated (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${live7DayTrend.map(d => `
              <tr>
                <td><strong>${d.day}</strong></td>
                <td>${d.date}</td>
                <td>${d.ordersCount} orders</td>
                <td class="excel-num">₹${d.val.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-header">2. Complete Order Transactions Ledger (${validSalesOrders.length} Orders)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 18%;">Order ID</th>
              <th style="width: 25%;">Customer Name & Email</th>
              <th style="width: 15%;">Payment Mode</th>
              <th style="width: 12%;">Status</th>
              <th style="width: 15%;">Order Date</th>
              <th style="width: 15%; text-align: right;">Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${validSalesOrders.map(o => `
              <tr>
                <td><strong>#${o.orderId}</strong></td>
                <td>${o.user?.fullName || 'N/A'}<br/><span style="color:#64748b; font-size:9.5px;">${o.user?.email || ''}</span></td>
                <td>${o.paymentMode || 'ONLINE'} (${o.paymentStatus || 'SUCCESS'})</td>
                <td><span class="excel-badge-green">${o.status}</span></td>
                <td>${getOrderDateStr(o) || 'N/A'}</td>
                <td class="excel-num">₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-header">3. Product Catalog & Inventory Stock Audit (${productsList.length} Items)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 12%;">Product ID</th>
              <th style="width: 38%;">Product Title</th>
              <th style="width: 20%;">Category</th>
              <th style="width: 15%; text-align: right;">Price (₹)</th>
              <th style="width: 15%;">Stock Status</th>
            </tr>
          </thead>
          <tbody>
            ${productsList.map(p => `
              <tr>
                <td>#${p.productId}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category?.categoryName || 'General'}</td>
                <td class="excel-num">₹${p.price}</td>
                <td><span class="${p.stock <= 5 ? 'excel-badge-red' : 'excel-badge-green'}">${p.stock} units (${p.stock <= 5 ? 'LOW STOCK' : 'IN STOCK'})</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-header">4. Registered Platform Users Directory (${usersList.length} Accounts)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 12%;">User ID</th>
              <th style="width: 28%;">Full Name</th>
              <th style="width: 35%;">Email Address</th>
              <th style="width: 15%;">Role</th>
              <th style="width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${usersList.map(u => `
              <tr>
                <td>#${u.userId}</td>
                <td><strong>${u.fullName || 'N/A'}</strong></td>
                <td>${u.email}</td>
                <td><strong>${u.role}</strong></td>
                <td><span class="${u.status === 'BANNED' ? 'excel-badge-red' : 'excel-badge-green'}">${u.status || 'ACTIVE'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          B-MART E-Commerce Administrative Systems • Executive Confidential Audit Report
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showNotification('success', 'Excel-Style PDF Report generated! Print/Save dialog opened.');
  };

  const kpiCardStyle = {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  };

  const serviceCardStyle = {
    background: '#ffffff',
    padding: '22px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px',
  };

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <div style={{ background: '#ffffff', width: '100%', maxWidth: '420px', padding: '36px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ background: '#0284c7', width: '56px', height: '56px', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '1.8rem', marginBottom: '12px' }}>
              B
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a' }}>Admin Portal Access</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Sign in to manage platform operations</p>
          </div>

          {loginError && (
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.85rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Admin Email / Username</label>
              <input
                type="text"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@bmart.com"
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Password</label>
              <input
                type={showAdminPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{ width: '100%', padding: '14px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' }}
            >
              {loginLoading ? 'Authenticating...' : 'Log In to Admin Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* --- PERFECT HEADER BANNER MATCHING EXACT IMAGE LAYOUT --- */}
        <div style={{
          background: '#0c2340',
          color: '#ffffff',
          padding: '20px 24px',
          borderRadius: '20px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 30px rgba(12, 35, 64, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              background: '#0284c7',
              padding: '8px 14px',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '1.35rem',
              color: '#ffffff',
              flexShrink: 0
            }}>
              B-MART
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', margin: 0, whiteSpace: 'nowrap' }}>
                  B-MART Admin Portal
                </h1>
                <span style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: '900',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}>
                  ADMIN AUTHENTICATED
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', margin: 0 }}>
                B-MART E-Commerce Administrative Operations & Verified Sales Analytics
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setDashboardMode('COMMAND_CENTER')}
              style={{
                background: dashboardMode === 'COMMAND_CENTER' ? '#0284c7' : 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <TrendingUp size={15} /> Analytics Overview
            </button>

            <button
              onClick={() => setDashboardMode('OPERATIONS_GRID')}
              style={{
                background: dashboardMode === 'OPERATIONS_GRID' ? '#0284c7' : 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Layers size={15} /> Operations Grid (8 Services)
            </button>

            <button
              onClick={loadExecutiveDashboard}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw size={15} className={loadingDashboard ? 'spin' : ''} /> Refresh Live Data
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 12px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <LogOut size={15} /> Logout Admin
            </button>
          </div>
        </div>

        {/* --- FEEDBACK NOTIFICATION --- */}
        {feedbackMsg && (
          <div style={{
            background: feedbackMsg.type === 'success' ? '#dcfce7' : '#fef2f2',
            color: feedbackMsg.type === 'success' ? '#15803d' : '#991b1b',
            border: `1px solid ${feedbackMsg.type === 'success' ? '#86efac' : '#fca5a5'}`,
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.88rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 size={18} />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* --- TOP 4 KPI METRICS CARDS ROW --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
          {/* KPI 1: GROSS REVENUE */}
          <div style={kpiCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                GROSS REVENUE (LIFETIME)
              </span>
              <div style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '50%', padding: '8px' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              ₹{Number(liveTotalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#16a34a', marginTop: '6px', fontWeight: '700' }}>
              <CheckCircle2 size={14} /> COD & Payment Success Only
            </div>
          </div>

          {/* KPI 2: VERIFIED SALES ORDERS */}
          <div style={kpiCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                VERIFIED SALES ORDERS
              </span>
              <div style={{ background: '#eff6ff', color: '#2563eb', borderRadius: '50%', padding: '8px' }}>
                <ShoppingCart size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {liveTotalOrders}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#2563eb', marginTop: '6px', fontWeight: '700' }}>
              <Package size={14} /> Excludes Pending Payments
            </div>
          </div>

          {/* KPI 3: CATALOG PRODUCTS & STOCKS */}
          <div
            onClick={() => openModal('CATALOG_STOCK_AUDIT')}
            style={{ ...kpiCardStyle, cursor: 'pointer', border: '1px solid #fde68a' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                CATALOG PRODUCTS & STOCKS 🔍
              </span>
              <div style={{ background: '#fef3c7', color: '#d97706', borderRadius: '50%', padding: '8px' }}>
                <Package size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {liveTotalProducts} Items
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#d97706', marginTop: '6px', fontWeight: '700' }}>
              <AlertCircle size={14} /> {lowStockProducts.length} low stock (≤5) • Click to Audit
            </div>
          </div>

          {/* KPI 4: REGISTERED CUSTOMERS */}
          <div style={kpiCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                REGISTERED CUSTOMERS
              </span>
              <div style={{ background: '#f3e8ff', color: '#9333ea', borderRadius: '50%', padding: '8px' }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {liveTotalUsers}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#9333ea', marginTop: '6px', fontWeight: '700' }}>
              <ShieldCheck size={14} /> Live DB Users Count
            </div>
          </div>
        </div>

        {/* --- VIEW MODE 1: COMMAND CENTER (PERFORMANCE TREND & REVENUE SHARE) --- */}
        {dashboardMode === 'COMMAND_CENTER' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
            {/* 7-DAY REVENUE PERFORMANCE BAR CHART */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Sales & Revenue Performance Trend</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time 7-Day Daily Revenue (COD & Paid Online Sales Only)</p>
                </div>

                {/* Export Reports Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={exportCSV} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileSpreadsheet size={14} /> CSV
                  </button>
                  <button onClick={exportPDF} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={14} /> Word (.doc)
                  </button>
                  <button onClick={exportPDF} style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Printer size={14} /> PDF
                  </button>
                </div>
              </div>

              {/* BAR CHART GRAPH DISPLAY */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', alignItems: 'end', height: '190px', paddingTop: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                {live7DayTrend.map((d, idx) => {
                  const barHeight = d.val > 0 ? Math.max(28, Math.round((d.val / maxDayVal) * 110)) : 12;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedSalesDate(d.date);
                        setSelectedDayTrend(d);
                        openModal('VERIFIED_SALES_MODAL');
                      }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '150px', cursor: 'pointer' }}
                      title={`Click to view ${d.ordersCount} verified sales on ${d.date}`}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                        ₹{d.val.toLocaleString('en-IN')}
                      </div>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '110px' }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${barHeight}px`,
                            background: d.val > 0 ? 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)' : '#bfdbfe',
                            borderRadius: '6px 6px 0 0',
                            transition: 'all 0.3s ease',
                            boxShadow: d.val > 0 ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginTop: '8px' }}>
                        {d.day}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '12px' }}>
                💡 Click any day bar to view verified sales products (excludes pending/failed payments).
              </div>
            </div>

            {/* CATEGORY REVENUE SHARE */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Category Revenue Share</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>Calculated from active catalog inventory</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    <span>General ({productsList.length} items)</span>
                    <span>₹{(productsList.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 1), 0)).toLocaleString('en-IN')} (100%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#2563eb', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW MODE 2: OPERATIONS GRID (8 ADMINISTRATIVE SERVICES) --- */}
        {dashboardMode === 'OPERATIONS_GRID' && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>Platform Operations Grid</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Select any of the 8 core administrative services to manage platform operations</p>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0284c7', background: '#e0f2fe', padding: '4px 12px', borderRadius: '12px' }}>
                8 Services Active
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* CARD 1: Add Product */}
              <div
                onClick={() => openModal('ADD_PRODUCT_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    Add Product
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Create and manage new product listings with validation
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: Product Management
                </div>
              </div>

              {/* CARD 2: Delete Product */}
              <div
                onClick={() => openModal('DELETE_PRODUCT_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    Delete Product
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Remove products from inventory system
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: Product Management
                </div>
              </div>

              {/* CARD 3: Modify User */}
              <div
                onClick={() => openModal('MODIFY_USER_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    Modify User
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Update user details and manage roles
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: User Management
                </div>
              </div>

              {/* CARD 4: View User Details */}
              <div
                onClick={() => openModal('VIEW_USER_DETAILS_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    View User Details
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Fetch and display details of a specific user
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: User Management
                </div>
              </div>

              {/* CARD 5: Monthly Business */}
              <div
                onClick={() => openModal('MONTHLY_BUSINESS_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    Monthly Business
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    View revenue metrics for specific months
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: Analytics
                </div>
              </div>

              {/* CARD 6: Day Business */}
              <div
                onClick={() => openModal('DAY_BUSINESS_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    Day Business
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Track daily revenue and transactions
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: Analytics
                </div>
              </div>

              {/* CARD 7: Yearly Business */}
              <div
                onClick={() => openModal('YEARLY_BUSINESS_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    Yearly Business
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Analyze annual revenue performance
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: Analytics
                </div>
              </div>

              {/* CARD 8: Overall Business */}
              <div
                onClick={() => openModal('OVERALL_BUSINESS_MODAL')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  minHeight: '160px'
                }}
              >
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: '#a5f3fc',
                    color: '#e11d48',
                    padding: '6px 24px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    Overall Business
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    View total revenue since inception
                  </p>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Team: Analytics
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL 1: VERIFIED SALES PRODUCTS MODAL --- */}
      {activeModal === 'VERIFIED_SALES_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '650px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} color="#2563eb" /> Verified Sales Products for {selectedSalesDate}
            </h3>

            {(() => {
              const dayOrders = validSalesOrders.filter((o) => getOrderDateStr(o) === selectedSalesDate);
              const dayRev = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

              return (
                <div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Verified Revenue for {selectedSalesDate}:</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#16a34a' }}>₹{dayRev.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Completed Orders:</span>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb' }}>{dayOrders.length} orders</div>
                    </div>
                  </div>

                  {dayOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.9rem' }}>
                      No verified completed orders found for this date.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {dayOrders.map((o) => (
                        <div key={o.orderId} style={{ border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>#{o.orderId}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Payment Mode: <strong style={{ color: o.paymentMode === 'COD' ? '#d97706' : '#0284c7' }}>{o.paymentMode || 'ONLINE'}</strong> | Status: <strong style={{ color: '#16a34a' }}>{o.status}</strong>
                            </div>
                          </div>
                          <div style={{ fontWeight: '900', fontSize: '1rem', color: '#0f172a' }}>
                            ₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL 2: CATALOG STOCK AUDIT --- */}
      {activeModal === 'CATALOG_STOCK_AUDIT' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="#d97706" /> Product Catalog & Inventory Stock Audit
            </h3>

            {/* SEARCH BAR AT TOP OF MODAL */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search catalog products by name, ID #, brand..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#f8fafc',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                }}
              />
              {productSearchQuery && (
                <button
                  onClick={() => setProductSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {(() => {
              const filteredList = productsList.filter((p) => {
                if (!productSearchQuery.trim()) return true;
                const q = productSearchQuery.toLowerCase().trim();
                const name = (p.name || '').toLowerCase();
                const brand = (p.brand || '').toLowerCase();
                const idStr = String(p.productId || '').toLowerCase();
                return name.includes(q) || brand.includes(q) || idStr.includes(q);
              });

              return (
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Product ({filteredList.length})</th>
                        <th style={{ padding: '10px' }}>Price</th>
                        <th style={{ padding: '10px' }}>Stock</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Stock Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.88rem' }}>
                            No catalog products match "{productSearchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((p) => (
                          <tr key={p.productId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px', fontWeight: '700' }}>{p.name}</td>
                            <td style={{ padding: '10px' }}>₹{p.price}</td>
                            <td style={{ padding: '10px', fontWeight: '800', color: p.stock <= 5 ? '#dc2626' : '#16a34a' }}>{p.stock} units</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ background: p.stock <= 5 ? '#fee2e2' : '#dcfce7', color: p.stock <= 5 ? '#991b1b' : '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                                {p.stock <= 5 ? 'LOW STOCK' : 'IN STOCK'}
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => handleUpdateStock(p.productId, p.stock, -1)}
                                  title="Decrease stock by 1 unit"
                                  style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(220,38,38,0.15)' }}
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleUpdateStock(p.productId, p.stock, 1)}
                                  title="Increase stock by 1 unit"
                                  style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(22,163,74,0.15)' }}
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => handleEditStockPrompt(p.productId, p.stock, p.name)}
                                  title="Set custom stock quantity"
                                  style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem' }}
                                >
                                  Edit Quantity
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL 3: PENDING SELLERS --- */}
      {activeModal === 'PENDING_SELLERS' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '700px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="#d97706" /> Pending Vendor Registration Applications ({pendingSellers.length})
            </h3>

            {pendingSellers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No pending vendor applications requiring approval.</div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {pendingSellers.map((s) => (
                  <div key={s.sellerId} style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{s.storeName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Email: {s.user?.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleApproveSeller(s.sellerId)} style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                        Approve Seller
                      </button>
                      <button onClick={() => handleRejectSeller(s.sellerId)} style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 4: PENDING PAYOUTS --- */}
      {activeModal === 'PENDING_PAYOUTS' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '700px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#16a34a" /> Pending Vendor Payout Requests ({pendingPayouts.length})
            </h3>

            {pendingPayouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No pending vendor payout requests.</div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {pendingPayouts.map((po) => (
                  <div key={po.id} style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{po.seller?.storeName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '800' }}>Amount: ₹{po.amount}</div>
                    </div>
                    <button onClick={() => handleApprovePayout(po.id)} style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                      Approve Payout
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 5: USER MANAGEMENT --- */}
      {activeModal === 'USER_MANAGEMENT' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '780px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={22} color="#9333ea" /> Modify User Accounts & Access Controls ({usersList.length})
            </h3>

            {/* SEARCH BAR AT TOP OF USER MANAGEMENT MODAL */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search user accounts by name, email, or role (ADMIN, CUSTOMER, SELLER)..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#f8fafc',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                }}
              />
              {productSearchQuery && (
                <button
                  onClick={() => setProductSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {(() => {
              const filteredUsers = usersList.filter((u) => {
                if (!productSearchQuery.trim()) return true;
                const q = productSearchQuery.toLowerCase().trim();
                const name = (u.fullName || u.username || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const role = (u.role || '').toLowerCase();
                const status = (u.status || '').toLowerCase();
                return name.includes(q) || email.includes(q) || role.includes(q) || status.includes(q);
              });

              return (
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>User Details</th>
                        <th style={{ padding: '10px' }}>Role</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.88rem' }}>
                            No registered users match "{productSearchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.userId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>{u.fullName || u.username || 'B-MART User'}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                background: u.role === 'ROLE_ADMIN' || u.role === 'ADMIN' ? '#e0e7ff' : u.role === 'ROLE_SELLER' || u.role === 'SELLER' ? '#fef3c7' : '#f1f5f9',
                                color: u.role === 'ROLE_ADMIN' || u.role === 'ADMIN' ? '#4338ca' : u.role === 'ROLE_SELLER' || u.role === 'SELLER' ? '#b45309' : '#475569',
                                padding: '3px 8px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: '800', textTransform: 'uppercase'
                              }}>
                                {u.role ? u.role.replace('ROLE_', '') : 'CUSTOMER'}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                background: u.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                                color: u.status === 'ACTIVE' ? '#15803d' : '#b91c1c',
                                padding: '3px 8px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: '800'
                              }}>
                                {u.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleChangeRole(u.userId, u.role)}
                                style={{ background: '#9333ea', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', marginRight: '6px', boxShadow: '0 2px 6px rgba(147, 51, 234, 0.25)' }}
                              >
                                Modify Role
                              </button>
                              <button
                                onClick={() => handleToggleBanUser(u.userId, u.status)}
                                style={{
                                  background: u.status === 'BANNED' ? '#dcfce7' : '#fee2e2',
                                  color: u.status === 'BANNED' ? '#15803d' : '#dc2626',
                                  border: u.status === 'BANNED' ? '1px solid #86efac' : '1px solid #fca5a5',
                                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem'
                                }}
                              >
                                {u.status === 'BANNED' ? 'Unban User' : 'Ban User'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL 6: CREATE CATEGORY --- */}
      {activeModal === 'CREATE_CATEGORY' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} color="#c026d3" /> Create E-Commerce Category
            </h3>

            <form onSubmit={handleCreateCategory}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Travel & Luggage"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Brief summary of items under this category..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', background: '#c026d3', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 7: ADD NEW PRODUCT MODAL --- */}
      {activeModal === 'ADD_PRODUCT_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '600px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={22} color="#0284c7" /> Add New Marketplace Product
            </h3>

            <form onSubmit={handleAddProductSubmit}>
              {/* Product Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Product Title / Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {/* Price & Discount Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="2999"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="50"
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Image URL *</label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />

                {/* Instant Live Image Preview */}
                {newProduct.imageUrl && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <img
                      src={newProduct.imageUrl}
                      alt="Preview"
                      style={{ width: '64px', height: '64px', objectFit: 'contain', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '4px' }}
                      onError={(e) => {
                        const text = (newProduct.name + ' ' + newProduct.imageUrl).toLowerCase();
                        let fallback = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80';
                        if (text.includes('backpack') || text.includes('rucksack') || text.includes('bag') || text.includes('tourist') || text.includes('travel')) {
                          fallback = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80';
                        } else if (text.includes('shoe') || text.includes('sneaker') || text.includes('nike') || text.includes('footwear')) {
                          fallback = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80';
                        } else if (text.includes('headphone') || text.includes('earphone') || text.includes('audio') || text.includes('sound')) {
                          fallback = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
                        } else if (text.includes('watch') || text.includes('smartwatch')) {
                          fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
                        } else if (text.includes('shirt') || text.includes('tshirt') || text.includes('apparel') || text.includes('cloth')) {
                          fallback = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80';
                        }
                        e.target.src = fallback;
                      }}
                    />
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.85rem' }}>Live Thumbnail Preview</strong>
                      {newProduct.imageUrl.includes('/product/') || newProduct.imageUrl.includes('yourprint') ? (
                        <span style={{ color: '#0284c7', fontWeight: '700' }}>
                          ✨ Webpage link detected! Auto-publishing with high-res product photo.
                        </span>
                      ) : (
                        'Image will display across Storefront Home, Catalog & Detail Pages.'
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Brand & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Brand / Manufacturer</label>
                  <input
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="B-MART"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Category</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Product Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Detailed features, specifications, and warranty info..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)' }}
              >
                Publish Product to Storefront
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 7B: DELETE PRODUCT MODAL --- */}
      {activeModal === 'DELETE_PRODUCT_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={22} color="#dc2626" /> Delete Products & Inventory Control
            </h3>

            {/* SEARCH BAR AT TOP OF MODAL */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search product by title, ID #, brand, or category..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  background: '#f8fafc',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                }}
              />
              {productSearchQuery && (
                <button
                  onClick={() => setProductSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {(() => {
              const filteredList = productsList.filter((p) => {
                if (!productSearchQuery.trim()) return true;
                const q = productSearchQuery.toLowerCase().trim();
                const name = (p.name || '').toLowerCase();
                const brand = (p.brand || '').toLowerCase();
                const idStr = String(p.productId || '').toLowerCase();
                const catName = (p.category?.categoryName || '').toLowerCase();
                return name.includes(q) || brand.includes(q) || idStr.includes(q) || catName.includes(q);
              });

              return (
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Product ({filteredList.length})</th>
                        <th style={{ padding: '10px' }}>Price</th>
                        <th style={{ padding: '10px' }}>Stock</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.88rem' }}>
                            No products match "{productSearchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((p) => (
                          <tr key={p.productId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={p.imageUrl} alt={p.name} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #cbd5e1' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'; }} />
                              <div>
                                <div style={{ fontWeight: '800', color: '#0f172a' }}>{p.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID #{p.productId} | {p.brand || 'B-MART'}</div>
                              </div>
                            </td>
                            <td style={{ padding: '10px', fontWeight: '700' }}>₹{p.price}</td>
                            <td style={{ padding: '10px', fontWeight: '800', color: p.stock <= 5 ? '#dc2626' : '#16a34a' }}>{p.stock} units</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteProduct(p.productId, p.name)}
                                style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={14} /> Delete Product
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL 8: MODIFY USER MODAL --- */}
      {activeModal === 'MODIFY_USER_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={22} color="#9333ea" /> Modify User Accounts & Access Controls
            </h3>

            {/* Rich User Modification Form */}
            {editUserObj && (
              <div style={{ background: '#faf5ff', border: '1px solid #c084fc', padding: '18px', borderRadius: '14px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#6b21a8', marginBottom: '14px' }}>
                  Modifying User: {editUserObj.email} (User ID #{editUserObj.userId})
                </h4>
                <form onSubmit={handleSaveUserEdit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#581c87', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</label>
                      <input
                        type="text"
                        value={editUserObj.fullName || ''}
                        onChange={(e) => setEditUserObj({ ...editUserObj, fullName: e.target.value })}
                        placeholder="John Doe"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#581c87', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
                      <input
                        type="email"
                        value={editUserObj.email || ''}
                        onChange={(e) => setEditUserObj({ ...editUserObj, email: e.target.value })}
                        required
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#581c87', textTransform: 'uppercase', marginBottom: '4px' }}>User Role</label>
                      <select
                        value={editUserObj.role || 'ROLE_USER'}
                        onChange={(e) => setEditUserObj({ ...editUserObj, role: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #a855f7', background: '#ffffff', fontWeight: '700', fontSize: '0.85rem' }}
                      >
                        <option value="ROLE_USER">ROLE_USER (Customer)</option>
                        <option value="ROLE_SELLER">ROLE_SELLER (Merchant)</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN (Administrator)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#581c87', textTransform: 'uppercase', marginBottom: '4px' }}>Account Status</label>
                      <select
                        value={editUserObj.status || 'ACTIVE'}
                        onChange={(e) => setEditUserObj({ ...editUserObj, status: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #a855f7', background: '#ffffff', fontWeight: '700', fontSize: '0.85rem' }}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="BANNED">BANNED</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#581c87', textTransform: 'uppercase', marginBottom: '4px' }}>Reset Password (Optional)</label>
                      <input
                        type="password"
                        placeholder="New Password"
                        value={editUserObj.newPassword || ''}
                        onChange={(e) => setEditUserObj({ ...editUserObj, newPassword: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                    <button type="button" onClick={() => handleDeleteUserAccount(editUserObj.userId, editUserObj.email)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 14px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Delete User Account
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setEditUserObj(null)} style={{ background: '#e9d5ff', color: '#6b21a8', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button type="submit" style={{ background: '#9333ea', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Save User Modifications
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>User Details</th>
                    <th style={{ padding: '10px' }}>Role</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.userId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{u.fullName || u.username || 'User'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: u.role === 'ROLE_ADMIN' ? '#dbeafe' : '#f1f5f9', color: u.role === 'ROLE_ADMIN' ? '#1d4ed8' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ background: u.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: u.status === 'ACTIVE' ? '#15803d' : '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button
                          onClick={() => setEditUserObj({ ...u })}
                          style={{ background: '#9333ea', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '6px', fontSize: '0.75rem', fontWeight: '800' }}
                        >
                          Modify Role
                        </button>
                        <button
                          onClick={() => handleBanUser(u.userId)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800' }}
                        >
                          Ban User
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 9: VIEW USER DETAILS MODAL --- */}
      {activeModal === 'VIEW_USER_DETAILS_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '700px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="#0284c7" /> Customer Account Inspection & Details
            </h3>

            {/* Select User Dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>Select Customer / User to View Details</label>
              <select
                onChange={(e) => {
                  const u = usersList.find((usr) => String(usr.userId) === e.target.value);
                  setSelectedUserDetail(u || null);
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff', fontWeight: '700' }}
              >
                <option value="">-- Choose User ({usersList.length} users registered) --</option>
                {usersList.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.fullName || u.username} ({u.email}) - {u.role}
                  </option>
                ))}
              </select>
            </div>

            {selectedUserDetail ? (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>{selectedUserDetail.fullName || selectedUserDetail.username || 'User Profile'}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedUserDetail.email}</p>
                  </div>
                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800' }}>
                    {selectedUserDetail.role}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>User ID</span>
                    <strong style={{ color: '#0f172a' }}>#{selectedUserDetail.userId}</strong>
                  </div>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Phone Number</span>
                    <strong style={{ color: '#0f172a' }}>{selectedUserDetail.phoneNumber || '+91 98765 43210'}</strong>
                  </div>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Account Status</span>
                    <strong style={{ color: selectedUserDetail.status === 'ACTIVE' ? '#16a34a' : '#dc2626' }}>{selectedUserDetail.status || 'ACTIVE'}</strong>
                  </div>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>KYC / Verification</span>
                    <strong style={{ color: '#2563eb' }}>Verified Platform User</strong>
                  </div>
                </div>

                {/* User Orders History Breakdown */}
                <h5 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>User Orders & Purchase Activity</h5>
                {(() => {
                  const userOrders = allOrders.filter(o => o.user?.email === selectedUserDetail.email || String(o.user?.userId) === String(selectedUserDetail.userId));
                  if (userOrders.length === 0) {
                    return <div style={{ fontSize: '0.8rem', color: '#64748b' }}>No orders placed yet by this user.</div>;
                  }
                  return (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {userOrders.map(o => (
                        <div key={o.orderId} style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                          <div>
                            <strong>Order #{o.orderId}</strong> - Status: <span style={{ color: '#16a34a', fontWeight: '700' }}>{o.status}</span>
                          </div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>
                            ₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.88rem' }}>
                Please choose a user from the dropdown above to inspect detailed profile metrics.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 10: MONTHLY BUSINESS MODAL --- */}
      {activeModal === 'MONTHLY_BUSINESS_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <TrendingUp size={22} color="#0284c7" /> Monthly Business & Revenue Performance
              </h3>
              {/* DOWNLOAD REPORT BUTTONS */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={exportCSV} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Excel / CSV
                </button>
                <button onClick={exportWord} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Word (.doc)
                </button>
                <button onClick={exportPDF} style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  PDF Report
                </button>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Current Month Revenue</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16a34a' }}>₹{Number(liveTotalRevenue).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Monthly Completed Orders</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#2563eb' }}>{liveTotalOrders} orders</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Avg. Order Value (AOV)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#d97706' }}>₹{liveTotalOrders > 0 ? Math.round(liveTotalRevenue / liveTotalOrders) : 0}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>Monthly Sales Transactions Summary</h4>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Order Ref</th>
                    <th style={{ padding: '8px 10px' }}>Payment Mode</th>
                    <th style={{ padding: '8px 10px' }}>Date</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {validSalesOrders.map(o => (
                    <tr key={o.orderId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontWeight: '800' }}>#{o.orderId}</td>
                      <td style={{ padding: '8px 10px' }}>{o.paymentMode || 'ONLINE'}</td>
                      <td style={{ padding: '8px 10px' }}>{getOrderDateStr(o)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: '#16a34a' }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 11: DAY BUSINESS MODAL --- */}
      {activeModal === 'DAY_BUSINESS_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <TrendingUp size={22} color="#16a34a" /> Daily Business & Daily Revenue Log
              </h3>
              {/* DOWNLOAD REPORT BUTTONS */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={exportCSV} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Excel / CSV
                </button>
                <button onClick={exportWord} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Word (.doc)
                </button>
                <button onClick={exportPDF} style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  PDF Report
                </button>
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Day</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Completed Orders</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Daily Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {live7DayTrend.map((d, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', fontWeight: '800', color: '#0f172a' }}>{d.day}</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{d.date}</td>
                      <td style={{ padding: '10px', fontWeight: '700', color: '#2563eb' }}>{d.ordersCount} orders</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: '900', color: '#16a34a' }}>₹{d.val.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 12: YEARLY BUSINESS MODAL --- */}
      {activeModal === 'YEARLY_BUSINESS_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <DollarSign size={22} color="#9333ea" /> Annual Business & Yearly Performance
              </h3>
              {/* DOWNLOAD REPORT BUTTONS */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={exportCSV} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Excel / CSV
                </button>
                <button onClick={exportWord} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Word (.doc)
                </button>
                <button onClick={exportPDF} style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  PDF Report
                </button>
              </div>
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: '800', textTransform: 'uppercase' }}>Financial Year 2026 Revenue</span>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#6b21a8' }}>₹{Number(liveTotalRevenue).toLocaleString('en-IN')}</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', margin: 0 }}>
                Aggregated from verified COD and Razorpay online payments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 13: OVERALL BUSINESS MODAL --- */}
      {activeModal === 'OVERALL_BUSINESS_MODAL' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', padding: '24px', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <ShieldCheck size={22} color="#0284c7" /> Overall Business Metrics Since Inception
              </h3>
              {/* DOWNLOAD REPORT BUTTONS */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={exportCSV} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Excel / CSV
                </button>
                <button onClick={exportWord} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  Word (.doc)
                </button>
                <button onClick={exportPDF} style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                  PDF Report
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Lifetime Gross Revenue</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#16a34a' }}>₹{Number(liveTotalRevenue).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Lifetime Completed Orders</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb' }}>{liveTotalOrders}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Active Catalog Products</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#d97706' }}>{liveTotalProducts} items</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Registered Users</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#9333ea' }}>{liveTotalUsers} users</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
