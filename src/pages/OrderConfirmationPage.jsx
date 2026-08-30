import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { orderApi, paymentApi } from '../api/shopApi';
import { clearCartState } from '../store/slices/cartSlice';
import { CheckCircle2, Package, ShoppingBag, CreditCard, Banknote, ShieldCheck, Download, FileText } from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    orderApi.getOrderById(orderId).then((res) => {
      const orderObj = res.data || res;
      if (orderObj) {
        setOrder(orderObj);
        dispatch(clearCartState());
      }
    }).catch(err => console.error(err));

    paymentApi.getPaymentByOrderId(orderId).then((res) => {
      const payObj = res.data || res;
      if (payObj) {
        setPayment(payObj);
      }
    }).catch(() => {});
  }, [orderId, dispatch]);

  const paymentMode = payment?.paymentMode || order?.paymentMode || 'ONLINE';
  const paymentStatus = payment?.status || order?.paymentStatus || 'CONFIRMED';

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      {/* Steps Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <span style={{ color: 'var(--text-muted)' }}>01 Shopping Cart</span>
        <span style={{ color: 'var(--text-muted)' }}>02 Checkout Details</span>
        <span style={{ color: 'var(--text-dark)', borderBottom: '2px solid var(--text-dark)', paddingBottom: '18px', marginBottom: '-21px' }}>03 Order Complete</span>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--card-bg)', color: 'var(--text-dark)', padding: '40px 32px', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ background: 'rgba(46, 125, 50, 0.1)', width: '88px', height: '88px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={54} color="#2e7d32" />
        </div>

        <h1 style={{ color: 'var(--text-dark)', fontSize: '2.1rem', fontWeight: '800', margin: 0 }}>
          Order Confirmed & Placed!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '1.05rem' }}>
          Thank you for shopping with B-MART. Your order reference ID is <strong>#{orderId}</strong>.
        </p>

        {order && (
          <>
            <div style={{ background: 'var(--body-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', margin: '32px 0 20px 0', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Order & Payment Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block' }}>Order Status</span>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: '#2e7d32', display: 'inline-block', marginTop: '2px' }}>
                    {order.status}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block' }}>Payment Method</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: '700', color: 'var(--text-dark)' }}>
                    {paymentMode === 'COD' ? (
                      <>
                        <Banknote size={18} color="#2e7d32" />
                        <span>Cash on Delivery (COD)</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} color="#2563eb" />
                        <span>Razorpay Online Payment</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block' }}>Payment Status</span>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      background: paymentStatus === 'SUCCESS' || paymentStatus === 'CONFIRMED' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: paymentStatus === 'SUCCESS' || paymentStatus === 'CONFIRMED' ? '#2e7d32' : '#b45309',
                    }}
                  >
                    {paymentStatus === 'SUCCESS' ? 'PAID' : paymentMode === 'COD' ? 'PAY ON DELIVERY' : paymentStatus}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block' }}>Total Payable</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-dark)', display: 'block', marginTop: '2px' }}>
                    ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {payment?.razorpayPaymentId && (
                <div style={{ background: 'var(--img-bg)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#2563eb" />
                  <span>Razorpay Transaction Ref ID: <strong>{payment.razorpayPaymentId}</strong></span>
                </div>
              )}

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-dark)', display: 'block', marginBottom: '4px' }}>Shipping Address:</strong>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>{order.shippingAddress}</p>
              </div>
            </div>

            {/* Tax Invoice Download Banner */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '20px 24px', borderRadius: '16px', margin: '0 0 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '12px', borderRadius: '12px' }}>
                  <FileText size={28} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>Official Tax Invoice Available</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>Download or print your itemized tax invoice for record keeping.</div>
                </div>
              </div>

              <button
                onClick={() => setShowInvoice(true)}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                }}
              >
                <Download size={18} /> Download Tax Invoice (PDF)
              </button>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            to="/profile?tab=orders"
            className="btn-amber"
            style={{
              padding: '12px 24px',
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Package size={18} /> View My Orders
          </Link>
          <Link
            to="/products"
            className="btn-primary"
            style={{
              padding: '12px 24px',
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {showInvoice && order && (
        <InvoiceModal order={order} payment={payment} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}
