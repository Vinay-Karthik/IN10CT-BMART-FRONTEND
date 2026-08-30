import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, ShieldCheck, CheckCircle2, Lock, X } from 'lucide-react';

export default function RazorpayModal({ orderData, amount, user, onSuccess, onClose }) {
  const [activeTab, setActiveTab] = useState('upi'); // upi, card, netbanking
  const [upiId, setUpiId] = useState(user?.email ? `${user.email.split('@')[0]}@upi` : 'customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  // Processing & Coin Animation States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0); // 0: Connecting, 1: Verifying, 2: Success

  const formatAmount = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleStartPayment = (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    setProcessStage(0);

    // Stage 1: Verifying with Bank (after 1.1s)
    setTimeout(() => {
      setProcessStage(1);
    }, 1100);

    // Stage 2: Success Coin flip into checkmark (after 2.3s)
    setTimeout(() => {
      setProcessStage(2);
    }, 2300);

    // Trigger Success Callback (after 3.1s)
    setTimeout(() => {
      const generatedPaymentId = `pay_rzp_${Date.now()}`;
      onSuccess({
        razorpayPaymentId: generatedPaymentId,
        razorpayOrderId: orderData?.razorpayOrderId || `order_rzp_${Date.now()}`,
        razorpaySignature: `rzp_test_sig_${Date.now()}`,
        targetOrderId: orderData?.orderId,
      });
    }, 3100);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '450px',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        animation: 'fadeIn 0.2s ease-out',
        position: 'relative'
      }}>
        {/* Test Mode Ribbon Tag */}
        <div style={{
          position: 'absolute',
          top: '14px',
          right: '-32px',
          background: '#ef4444',
          color: '#ffffff',
          fontSize: '0.65rem',
          fontWeight: '900',
          padding: '4px 36px',
          transform: 'rotate(45deg)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          letterSpacing: '1px',
          zIndex: 10
        }}>
          TEST MODE
        </div>

        {/* Razorpay Brand Header */}
        <div style={{
          background: '#0c2340',
          color: '#ffffff',
          padding: '22px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#0284c7',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '1.2rem',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
            }}>
              ₹
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.2px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Razorpay</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Gateway</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>
                Order #{orderData?.orderId || 'B-MART'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', paddingRight: '16px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Payable</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#38bdf8' }}>₹{formatAmount(amount)}</div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', background: '#ffffff', color: '#0f172a' }}>

          {/* IF PROCESSING: SHOW THE 🪙 COIN MOVEMENT ANIMATION */}
          {isProcessing ? (
            <div style={{ padding: '20px 10px', textAlign: 'center' }}>
              {/* 🪙 3D COIN ANIMATION CONTAINER */}
              <div className="rzp-coin-container">
                {processStage === 2 ? (
                  <>
                    <div className="rzp-coin-pulse-success" />
                    <div className="rzp-success-badge">
                      <CheckCircle2 size={56} color="#ffffff" strokeWidth={2.5} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rzp-coin-pulse-ring" />
                    <div className="rzp-coin-3d">
                      🪙
                    </div>
                  </>
                )}
              </div>

              {/* Status Message Progression */}
              <div style={{ marginTop: '24px' }}>
                {processStage === 0 && (
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                      Initiating Razorpay Payment...
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Connecting securely to bank gateway</p>
                  </div>
                )}
                {processStage === 1 && (
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0284c7', marginBottom: '6px' }}>
                      Authorizing Transaction...
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Verifying 256-bit encrypted credentials</p>
                  </div>
                )}
                {processStage === 2 && (
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#16a34a', marginBottom: '6px', animation: 'fadeIn 0.3s ease-out' }}>
                      Payment Successful! 🎉
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Redirecting to order confirmation page...</p>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                <Lock size={12} color="#0284c7" />
                <span>Protected by Razorpay PCI-DSS Security</span>
              </div>
            </div>
          ) : (
            /* PAYMENT OPTIONS FORM */
            <div>
              {/* Payment Method Selector Tabs */}
              <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '4px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'upi' ? '#ffffff' : 'transparent',
                    color: activeTab === 'upi' ? '#0284c7' : '#64748b',
                    fontWeight: activeTab === 'upi' ? '800' : '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'upi' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <Smartphone size={16} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'card' ? '#ffffff' : 'transparent',
                    color: activeTab === 'card' ? '#0284c7' : '#64748b',
                    fontWeight: activeTab === 'card' ? '800' : '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'card' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <CreditCard size={16} />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'netbanking' ? '#ffffff' : 'transparent',
                    color: activeTab === 'netbanking' ? '#0284c7' : '#64748b',
                    fontWeight: activeTab === 'netbanking' ? '800' : '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'netbanking' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <Building2 size={16} />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* TAB 1: UPI PAYMENT */}
              {activeTab === 'upi' && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Select Instant UPI App
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                      {['Google Pay ⚡', 'PhonePe 💜', 'Paytm 💙'].map((app, idx) => (
                        <div
                          key={idx}
                          onClick={() => setUpiId(`customer${idx + 1}@upi`)}
                          style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '10px 6px',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            background: '#f8fafc',
                            color: '#0f172a'
                          }}
                        >
                          {app}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Or Enter VPA / Virtual Payment Address
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {activeTab === 'card' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#0f172a',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#0f172a',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {activeTab === 'netbanking' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Select Indian Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Pay Action Button */}
              <button
                type="button"
                onClick={handleStartPayment}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '15px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s, boxShadow 0.15s'
                }}
              >
                <ShieldCheck size={20} />
                <span>Pay ₹{formatAmount(amount)} via Razorpay</span>
              </button>

              {/* Security Seal */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '0.72rem', color: '#94a3b8' }}>
                <Lock size={12} />
                <span>256-Bit SSL Encrypted Razorpay Checkout</span>
              </div>
            </div>
          )}

          {/* Close Button */}
          {!isProcessing && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 12
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
