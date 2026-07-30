import React, { useEffect, useState } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { DollarSign, Wallet, ArrowDownRight, RefreshCw, Clock } from 'lucide-react';

export default function SellerEarningsPage() {
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payout Form Modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [payoutMsg, setPayoutMsg] = useState('');
  const [payoutErr, setPayoutErr] = useState('');

  const fetchFinancials = () => {
    setLoading(true);
    sellerApi.getEarnings()
      .then(res => {
        if (res.success) setEarnings(res.data);
      });

    sellerApi.getPayouts()
      .then(res => {
        if (res.success) setPayouts(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const handleRequestPayout = (e) => {
    e.preventDefault();
    setPayoutMsg('');
    setPayoutErr('');

    sellerApi.requestPayout(parseFloat(amount), bankDetails)
      .then(res => {
        if (res.success) {
          setPayoutMsg('Payout request submitted successfully!');
          setAmount('');
          setBankDetails('');
          setShowPayoutModal(false);
          fetchFinancials();
        } else {
          setPayoutErr(res.message);
        }
      })
      .catch(err => setPayoutErr(err?.message || 'Error submitting payout request'));
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Earnings & Payouts</h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>View net sales, platform commission deductions, and request withdrawals.</p>
        </div>
        <button onClick={() => setShowPayoutModal(true)} className="btn-amber" style={{ padding: '10px 18px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={18} /> Request Payout
        </button>
      </div>

      {/* Financial Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#718096', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Gross Sales</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#2d3748' }}>₹{earnings?.grossSales || '0.00'}</div>
        </div>

        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#e53e3e', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Commission ({earnings?.commissionRate || '10%'})</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#c53030' }}>-₹{earnings?.totalCommissionDeducted || '0.00'}</div>
        </div>

        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#276749', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Net Earnings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#22543d' }}>₹{earnings?.netEarnings || '0.00'}</div>
        </div>

        <div style={{ background: '#fff8e7', border: '1px solid #feebc8', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#744210', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Available Balance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#d69e2e' }}>₹{earnings?.availableBalance || '0.00'}</div>
        </div>
      </div>

      {/* Payout History Table */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Payout Withdrawal History</h3>

      {payouts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#666', background: '#fafafa', borderRadius: '12px' }}>
          No payout withdrawal requests found.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Requested At</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Bank Details</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{new Date(p.requestedAt).toLocaleString()}</td>
                <td style={{ padding: '12px', fontWeight: '800', color: '#2e7d32' }}>₹{p.amount}</td>
                <td style={{ padding: '12px', fontSize: '0.8rem', color: '#666' }}>{p.bankDetails || 'Default Bank'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700',
                    background: p.status === 'APPROVED' ? '#e6fffa' : p.status === 'PENDING' ? '#feebc8' : '#fff5f5',
                    color: p.status === 'APPROVED' ? '#234e52' : p.status === 'PENDING' ? '#744210' : '#9b2c2c'
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '440px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>Request Payout Withdrawal</h3>

            {payoutErr && <div style={{ background: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>{payoutErr}</div>}

            <form onSubmit={handleRequestPayout}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  max={earnings?.availableBalance}
                  required
                  placeholder={`Max available: ₹${earnings?.availableBalance || 0}`}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Bank Account / UPI Details</label>
                <textarea
                  rows={3}
                  value={bankDetails}
                  onChange={e => setBankDetails(e.target.value)}
                  required
                  placeholder="Bank Name, Account Number, IFSC Code, or UPI ID"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowPayoutModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: 'none' }}>Cancel</button>
                <button type="submit" className="btn-amber" style={{ padding: '8px 20px' }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
