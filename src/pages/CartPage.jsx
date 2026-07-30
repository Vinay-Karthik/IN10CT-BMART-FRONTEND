import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { cartApi } from '../api/shopApi';
import { setCart } from '../store/slices/cartSlice';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

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
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', margin: '30px auto' }}>
      {/* Items List */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #ddd' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', borderBottom: '1px solid #eee', paddingBottom: '14px', marginBottom: '20px' }}>
          Shopping Cart ({items.length} items)
        </h1>

        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            
            <div style={{ flex: 1 }}>
              <Link to={`/products/${item.product.productId}`} style={{ fontWeight: '700', fontSize: '1rem', color: '#111' }}>
                {item.product.name}
              </Link>
              <div style={{ color: 'green', fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>In Stock</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#555' }}>Qty:</span>
                  <select
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    {[1, 2, 3, 4, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <button 
                  onClick={() => handleRemove(item.id)}
                  style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>₹{item.product.price} each</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #ddd', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Order Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
          <span>Subtotal:</span>
          <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ color: 'green', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' }}>
          ✓ Your order qualifies for FREE Delivery across India
        </div>

        <button 
          className="btn-amber" 
          onClick={() => navigate('/checkout')}
          style={{ padding: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          Proceed to Checkout <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
