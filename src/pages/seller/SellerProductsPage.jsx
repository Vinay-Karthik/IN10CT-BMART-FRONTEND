import React, { useEffect, useState } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { categoryApi } from '../../api/shopApi';
import { Plus, Edit2, Trash2, Tag, RefreshCw, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState('');
  const [stock, setStock] = useState('50');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    sellerApi.getSellerProducts(statusFilter)
      .then(res => {
        if (res.success) setProducts(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  useEffect(() => {
    categoryApi.getAllCategories().then(res => {
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) setCategoryId(res.data[0].categoryId);
      }
    });
  }, []);

  const handleCreateProduct = (e) => {
    e.preventDefault();
    setFormMsg('');
    setFormError('');
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      brand: brand.trim() || undefined,
      tags: tags.trim() || undefined,
      stock: parseInt(stock, 10),
      categoryId: parseInt(categoryId, 10),
      imageUrl: imageUrl.trim()
    };

    sellerApi.createProduct(payload)
      .then(res => {
        if (res.success) {
          setFormMsg('Product created successfully and submitted for admin review!');
          setName('');
          setDescription('');
          setPrice('');
          setDiscountPrice('');
          setImageUrl('');
          setShowAddModal(false);
          fetchProducts();
        } else {
          setFormError(res.message);
        }
      })
      .catch(err => setFormError(err?.message || 'Error creating product'))
      .finally(() => setSubmitting(false));
  };

  const handleUpdateStock = (productId, currentStock) => {
    const newStock = prompt('Enter new stock quantity:', currentStock);
    if (newStock !== null && !isNaN(newStock)) {
      sellerApi.updateStock(productId, parseInt(newStock, 10))
        .then(() => fetchProducts());
    }
  };

  const handleUpdatePrice = (productId, currentPrice) => {
    const newPrice = prompt('Enter new price (₹):', currentPrice);
    if (newPrice !== null && !isNaN(newPrice)) {
      sellerApi.updatePrice(productId, { price: parseFloat(newPrice) })
        .then(() => fetchProducts());
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      sellerApi.deleteProduct(productId)
        .then(() => fetchProducts());
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span style={{ background: '#e6fffa', color: '#234e52', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Approved</span>;
      case 'PENDING':
        return <span style={{ background: '#feebc8', color: '#744210', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Pending Review</span>;
      case 'REJECTED':
        return <span style={{ background: '#fff5f5', color: '#9b2c2c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={14} /> Rejected</span>;
      case 'BANNED':
        return <span style={{ background: '#718096', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={14} /> Banned</span>;
      default:
        return <span style={{ background: '#edf2f7', color: '#4a5568', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>{status}</span>;
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Your Products</h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>Manage your inventory, prices, and listings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-amber"
          style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
        {['', 'APPROVED', 'PENDING', 'REJECTED', 'BANNED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid #ddd',
              background: statusFilter === st ? '#131921' : '#f7f7f7',
              color: statusFilter === st ? 'white' : '#333',
              fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer'
            }}
          >
            {st === '' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {/* Product List Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><RefreshCw size={24} className="spin" /> Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#fafafa', borderRadius: '12px' }}>
          No products found under status "{statusFilter || 'All'}". Click "Add New Product" to list an item.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Product</th>
              <th style={{ padding: '12px' }}>Price</th>
              <th style={{ padding: '12px' }}>Stock</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={p.imageUrl} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} />
                  <div>
                    <div style={{ fontWeight: '700' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Category: {p.category?.categoryName} | Brand: {p.brand}</div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: '700' }}>₹{p.price}</div>
                  {p.discountPrice && <div style={{ fontSize: '0.75rem', color: '#2e7d32' }}>Discount: ₹{p.discountPrice}</div>}
                  <button onClick={() => handleUpdatePrice(p.productId, p.price)} style={{ background: 'none', border: 'none', color: '#007185', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                    Edit Price
                  </button>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontWeight: '700', color: p.stock < 10 ? '#c53030' : '#2d3748' }}>{p.stock} units</span>
                  <button onClick={() => handleUpdateStock(p.productId, p.stock)} style={{ display: 'block', background: 'none', border: 'none', color: '#007185', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                    Edit Stock
                  </button>
                </td>
                <td style={{ padding: '12px' }}>{getStatusBadge(p.status)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button onClick={() => handleDeleteProduct(p.productId)} style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>List New Seller Product</h3>

            {formMsg && <div style={{ background: '#f0fff4', color: '#276749', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>{formMsg}</div>}
            {formError && <div style={{ background: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>{formError}</div>}

            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Product Title</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Leather Laptop Backpack 30L" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Regular Price (₹)</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="1499.00" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Discount Price (₹ Optional)</label>
                  <input type="number" step="0.01" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="1299.00" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Initial Stock</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} required min="0" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Image URL</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required placeholder="/uploads/backpacks/my_bag.jpg or image link" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed product specifications..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', justify: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'none' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn-amber" style={{ padding: '8px 20px' }}>
                  {submitting ? 'Submitting...' : 'Submit Product for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
