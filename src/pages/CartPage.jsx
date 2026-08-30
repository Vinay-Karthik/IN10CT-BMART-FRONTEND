import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { cartApi } from '../api/shopApi';
import { setCart, updateQuantityLocal, removeFromCartLocal } from '../store/slices/cartSlice';
import { Trash2, ShoppingBag, ArrowRight, Truck, RotateCcw, ShieldCheck, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalAmount } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isAuthenticated) {
      cartApi.getCart().then(res => {
        const cartObj = res.data || res;
        if (cartObj) dispatch(setCart(cartObj));
      }).catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  const handleUpdateQuantity = (itemId, newQty) => {
    if (!itemId) return;
    if (newQty <= 0) {
      handleRemove(itemId);
      return;
    }

    if (!isAuthenticated) {
      dispatch(updateQuantityLocal({ itemId, quantity: newQty }));
      return;
    }

    // Optimistic update
    const updatedItems = items.map(i => (i.id || i.cartItemId) === itemId ? { ...i, quantity: newQty } : i);
    dispatch(setCart({ cartItems: updatedItems }));

    cartApi.updateQuantity(itemId, newQty).then(res => {
      const cartObj = res.data || res;
      if (cartObj) dispatch(setCart(cartObj));
    }).catch((err) => {
      console.error('Failed to update quantity:', err);
    });
  };

  const handleRemove = (itemId) => {
    if (!itemId) return;

    if (!isAuthenticated) {
      dispatch(removeFromCartLocal(itemId));
      return;
    }

    // Optimistic update
    const updatedItems = items.filter(i => (i.id || i.cartItemId) !== itemId);
    dispatch(setCart({ cartItems: updatedItems }));

    cartApi.removeItem(itemId).then(res => {
      const cartObj = res.data || res;
      if (cartObj) {
        dispatch(setCart(cartObj));
      }
    }).catch((err) => {
      console.error('Failed to remove item:', err);
    });
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ margin: '40px auto', textAlign: 'center', background: 'var(--card-bg)', padding: '60px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto' }} />
        <h2 style={{ marginTop: '16px' }}>Your B-MART Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px' }}>Explore our products to start adding items to your cart.</p>
        <Link to="/products" className="btn-primary" style={{ padding: '10px 28px', width: 'auto', display: 'inline-block' }}>Start Shopping</Link>
      </div>
    );
  }

  const totalProductsCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

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
              Your Cart ({items.length} items)
            </h1>

            {items.map(item => {
              const itemId = item.id || item.cartItemId;
              const product = item.product || item;
              const price = Number(product.price || 0);

              return (
                <div key={itemId} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '100px', background: 'var(--img-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/products/${product.productId}`} style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                      {product.name}
                    </Link>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>Brand: {product.brand || 'B-MART'}</div>
                    {product.stock != null && (
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', marginTop: '4px' }}>
                        {product.stock <= 0 ? (
                          <span style={{ color: '#cc0c39' }}>Out of Stock</span>
                        ) : product.stock <= 5 ? (
                          <span style={{ color: '#b12704' }}>Only {product.stock} left in stock</span>
                        ) : (
                          <span style={{ color: '#007600' }}>In Stock</span>
                        )}
                      </div>
                    )}
                    <div style={{ color: 'var(--text-dark)', fontWeight: '700', fontSize: '1.1rem', marginTop: '8px' }}>₹{price.toLocaleString('en-IN')}</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '14px' }}>
                      <div className="quantity-pill">
                        <button onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}><Minus size={12} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}><Plus size={12} /></button>
                      </div>

                      <button 
                        onClick={() => handleRemove(itemId)}
                        style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                      ₹{(price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Order Note */}
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
              <span>Subtotal ({totalProductsCount} items):</span>
              <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Shipping:</span>
              <span style={{ color: '#007600', fontWeight: '700' }}>Free</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '24px' }}>
              <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>Total:</span>
              <span style={{ fontWeight: '800', fontSize: '1.3rem' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <button 
              className="btn-amber" 
              onClick={handleProceedToCheckout}
              style={{ margin: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            {!isAuthenticated && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                You will be asked to sign in before finalizing payment.
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={18} color="var(--text-dark)" />
              <div style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                <div style={{ fontWeight: '700' }}>Free Shipping</div>
                <div style={{ color: 'var(--text-muted)' }}>On all orders</div>
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
