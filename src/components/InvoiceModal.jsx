import React from 'react';
import { X, Printer, Download, ShieldCheck, FileText } from 'lucide-react';

export default function InvoiceModal({ order, payment, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `INV-${new Date(order.createdAt || Date.now()).getFullYear()}-${order.orderId}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const paymentMode = payment?.paymentMode || order?.paymentMode || 'ONLINE';
  const paymentStatus = payment?.status || order?.paymentStatus || 'CONFIRMED';
  const totalAmount = Number(order.totalAmount || 0);
  const subtotal = totalAmount / 1.18; // Assuming 18% GST included
  const taxAmount = totalAmount - subtotal;

  return (
    <div
      className="invoice-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          color: 'var(--text-dark, #111827)',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          borderRadius: '16px',
          border: '1px solid var(--border-color, #e5e7eb)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Header (Screen Only) */}
        <div
          className="no-print"
          style={{
            background: '#1e293b',
            color: 'white',
            padding: '16px 24px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="#38bdf8" />
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>Official Tax Invoice</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{invoiceNo}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Download size={16} /> Download / Print PDF
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div
          id="printable-invoice"
          style={{
            padding: '32px',
            overflowY: 'auto',
            background: 'white',
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header & Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#2563eb', margin: 0, letterSpacing: '-0.5px' }}>B-MART</h1>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '4px' }}>B-MART E-Commerce Pvt. Ltd.</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Outer Ring Road, Bellandur, Bengaluru, KA - 560103</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>GSTIN: 29AAACB3616F1Z5 | PAN: AAACB3616F</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Email: support@bmart.com | Phone: 1800-123-BMART</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800', display: 'inline-block', marginBottom: '8px' }}>
                TAX INVOICE
              </div>
              <div style={{ fontSize: '0.85rem', color: '#374151' }}><strong>Invoice #:</strong> {invoiceNo}</div>
              <div style={{ fontSize: '0.85rem', color: '#374151', marginTop: '2px' }}><strong>Date:</strong> {orderDate}</div>
              <div style={{ fontSize: '0.85rem', color: '#374151', marginTop: '2px' }}><strong>Order Ref ID:</strong> #{order.orderId}</div>
            </div>
          </div>

          {/* Billing & Shipping Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                Billed & Shipped To:
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{order.user?.fullName || order.user?.username || 'Customer'}</div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '2px' }}>{order.shippingAddress}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Email: {order.user?.email || 'N/A'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                Payment Summary:
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                <strong>Payment Method:</strong> {paymentMode === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                <strong>Status:</strong>{' '}
                <span style={{ color: paymentStatus === 'SUCCESS' || paymentStatus === 'CONFIRMED' ? '#16a34a' : '#d97706', fontWeight: '700' }}>
                  {paymentStatus}
                </span>
              </div>
              {payment?.razorpayPaymentId && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  <strong>Transaction Ref:</strong> {payment.razorpayPaymentId}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: 'white', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '10px 14px', borderRadius: '6px 0 0 0' }}>#</th>
                <th style={{ padding: '10px 14px' }}>Item Description</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.product?.name || 'Product'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Brand: {item.product?.brand || 'B-MART'}</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{Number(item.pricePerUnit || item.product?.price || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700' }}>₹{Number(item.totalPrice || (item.product?.price * item.quantity)).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <td style={{ padding: '12px 14px', color: '#64748b' }}>1</td>
                  <td style={{ padding: '12px 14px', fontWeight: '700' }}>Order #{order.orderId} Package</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700' }}>1</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{totalAmount.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700' }}>₹{totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Invoice Financial Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <div style={{ width: '280px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                <span>GST Tax (18%):</span>
                <span>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                <span>Shipping Charges:</span>
                <span style={{ color: '#16a34a', fontWeight: '700' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '10px', marginTop: '6px', fontSize: '1.05rem', fontWeight: '900', color: '#0f172a' }}>
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Terms & Authorization Stamp */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '400px' }}>
              <strong>Terms & Conditions:</strong>
              <div>• All items subject to 10-day return policy.</div>
              <div>• Computer generated tax invoice; signature not required.</div>
              <div>• Thank you for shopping with B-MART!</div>
            </div>

            <div style={{ textAlign: 'center', border: '1px dashed #cbd5e1', padding: '10px 20px', borderRadius: '8px', background: '#fafafa' }}>
              <ShieldCheck size={28} color="#2563eb" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1e3a8a', textTransform: 'uppercase' }}>B-MART Authorized</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Digitally Signed Invoice</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Screen Only) */}
        <div
          className="no-print"
          style={{
            background: 'var(--body-bg, #f8fafc)',
            borderTop: '1px solid var(--border-color, #e5e7eb)',
            padding: '16px 24px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
            💡 Tip: Click "Download / Print PDF" to save a copy as PDF or print.
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--text-dark, #1e293b)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
