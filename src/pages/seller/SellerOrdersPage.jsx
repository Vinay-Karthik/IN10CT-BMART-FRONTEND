import React, { useEffect, useState } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { ShoppingBag, FileText, RefreshCw, CheckCircle, Truck, PackageCheck, AlertCircle } from 'lucide-react';

export default function SellerOrdersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    sellerApi.getSellerOrders()
      .then(res => {
        if (res.success) setItems(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderItemId, currentStatus, newStatus) => {
    if (newStatus === currentStatus) return;
    sellerApi.updateOrderStatus(orderItemId, newStatus)
      .then(res => {
        if (res.success) {
          fetchOrders();
        }
      })
      .catch(err => alert(err?.message || 'Error updating order status'));
  };

  const handleFetchInvoice = (orderItemId) => {
    sellerApi.getInvoice(orderItemId)
      .then(res => {
        if (res.success) setInvoiceModalData(res.data);
      });
  };

  const handleInitiateReturn = (orderItemId) => {
    const reason = prompt('Enter reason for initiating return:');
    if (reason) {
      sellerApi.initiateReturn(orderItemId, reason)
        .then(res => {
          if (res.success) {
            alert('Return request submitted for admin review.');
            fetchOrders();
          }
        });
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Seller Order Management</h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>Fulfill items, manage status transitions, and print invoices.</p>
        </div>
        <button onClick={fetchOrders} className="btn-amber" style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading seller order items...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#fafafa', borderRadius: '12px' }}>
          No order items found for your products yet.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Item</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Quantity & Total</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.product?.imageUrl} alt={item.product?.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div>
                    <div style={{ fontWeight: '700' }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>Order #{item.order?.orderId}</div>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: '600' }}>{item.order?.user?.fullName || item.order?.user?.username}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{item.order?.shippingAddress}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: '700' }}>{item.quantity} x ₹{item.pricePerUnit}</div>
                  <div style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: '800' }}>Total: ₹{item.totalPrice}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, item.status, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontWeight: '700', fontSize: '0.8rem' }}
                  >
                    <option value="PLACED">PLACED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button onClick={() => handleFetchInvoice(item.id)} style={{ background: '#edf2f7', color: '#2d3748', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '6px' }}>
                    <FileText size={14} /> Invoice
                  </button>
                  <button onClick={() => handleInitiateReturn(item.id)} style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Invoice Modal */}
      {invoiceModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px' }}>
            <div style={{ borderBottom: '2px solid #131921', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>INVOICE #{invoiceModalData.invoiceNumber}</h3>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Vendor: {invoiceModalData.sellerStoreName}</div>
              </div>
              <ShoppingBag size={28} color="#f08804" />
            </div>

            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '16px' }}>
              <div><strong>Customer:</strong> {invoiceModalData.customerName} ({invoiceModalData.customerEmail})</div>
              <div><strong>Shipping Address:</strong> {invoiceModalData.shippingAddress}</div>
              <div style={{ marginTop: '10px', padding: '10px', background: '#fafafa', borderRadius: '8px' }}>
                <div><strong>Product:</strong> {invoiceModalData.productName}</div>
                <div><strong>Quantity:</strong> {invoiceModalData.quantity}</div>
                <div><strong>Price per Unit:</strong> ₹{invoiceModalData.pricePerUnit}</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#2e7d32', marginTop: '6px' }}>Total Billed: ₹{invoiceModalData.totalPrice}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => window.print()} className="btn-amber" style={{ padding: '8px 16px' }}>Print Invoice</button>
              <button onClick={() => setInvoiceModalData(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'none' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
