import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { cartApi } from '../api/shopApi';
import { setCart } from '../store/slices/cartSlice';
import { Trash2, ShoppingBag, ArrowRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isAuthenticated) {
      cartApi.getCart().then(res => {
        if (res.success && res.data) dispatch(setCart(res.data));
      });
    }
  }, [isAuthenticated, dispatch]);

  const handleUpdateQuantity = (itemId, newQty) => {
    cartApi.updateQuantity(itemId, newQty).then(res => {
      if (res.success && res.data) dispatch(setCart(res.data));
    });
  };

  const handleRemove = (itemId) => {
    cartApi.removeItem(itemId).then(res => {
      if (res.success && res.data) dispatch(setCart(res.data));
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center', background: 'white', padding: '60px', borderRadius: '16px' }}>
        <h2>Please Sign In to View Your Cart</h2>
        <p style={{ color: '#666', margin: '12px 0 20px' }}>Your B-MART shopping cart is waiting for you.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '10px 28px', width: 'auto', display: 'inline-block' }}>Sign In Now</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center', background: 'white', padding: '60px', borderRadius: '16px' }}>
        <ShoppingBag size={48} color="#999" />
        <h2 style={{ marginTop: '16px' }}>Your B-MART Cart is Empty</h2>
        <p style={{ color: '#666', margin: '8px 0 20px' }}>Explore our backpacks, handbags and travel bags to start shopping.</p>
        <Link to="/products" className="btn-primary" style={{ padding: '10px 28px', width: 'auto', display: 'inline-block' }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ margin: '40px auto' }}>
      {/* Steps Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.2px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <span style={{ color: 'var(--text-dark)', borderBottom: '2px solid var(--text-dark)', paddingBottom: '18px', marginBottom: '-21px' }}>01 Shopping Cart</span>
        <span style={{ color: 'var(--text-muted)' }}>02 Checkout Details</span>
        <span style={{ color: 'var(--text-muted)' }}>03 Order Complete</span>
      </div>

      <div className="split-layout">
        {/* Left Column: Items List & Notes */}
        <div>
        <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
            Your Cart
          </h1>

          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', background: 'var(--img-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={item.product.imageUrl} alt={item.product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/products/${item.product.productId}`} style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                  {item.product.name}
                </Link>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>Brand: {item.product.brand || 'B-MART'}</div>
                <div style={{ color: 'var(--text-dark)', fontWeight: '700', fontSize: '1.1rem', marginTop: '8px' }}>₹{Number(item.product.price).toLocaleString('en-IN')}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '14px' }}>
                  <div className="quantity-pill">
                    <button onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>

                  <button 
                    onClick={() => handleRemove(item.id)}
                    style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Order Note (Reference style) */}
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px' }}>
          <label style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Add Order Note</label>
          <textarea 
            placeholder="Write your note here..." 
            rows="3"
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'transparent', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Right Column: Order Summary & Trust Badges */}
      <div>
        <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Subtotal:</span>
            <span>₹{(totalAmount * 0.9).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Tax (10%):</span>
            <span>₹{(totalAmount * 0.1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '24px' }}>
            <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>Total:</span>
            <span style={{ fontWeight: '800', fontSize: '1.3rem' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <button 
            className="btn-amber" 
            onClick={() => navigate('/checkout')}
            style={{ margin: 0 }}
          >
            Proceed to Checkout
          </button>
        </div>

        {/* Trust Badges below Order Summary */}
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={18} color="var(--text-dark)" />
            <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
              <div style={{ fontWeight: '700' }}>Free Shipping</div>
              <div style={{ color: 'var(--text-muted)' }}>On orders over ₹499</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw size={18} color="var(--text-dark)" />
            <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
              <div style={{ fontWeight: '700' }}>Easy Returns</div>
              <div style={{ color: 'var(--text-muted)' }}>10-day return policy</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={18} color="var(--text-dark)" />
            <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
              <div style={{ fontWeight: '700' }}>Secure Checkout</div>
              <div style={{ color: 'var(--text-muted)' }}>100% secure checkout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
