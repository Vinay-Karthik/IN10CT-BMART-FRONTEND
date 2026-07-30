import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, Store, ShoppingCart, DollarSign, MessageSquare, BarChart2, PlusCircle, ShieldCheck } from 'lucide-react';

export default function SellerDashboardLayout() {
  const location = useLocation();

  const navItems = [
    { label: 'Products', path: '/seller/products', icon: Package },
    { label: 'Store Settings', path: '/seller/store', icon: Store },
    { label: 'Orders', path: '/seller/orders', icon: ShoppingCart },
    { label: 'Earnings & Payouts', path: '/seller/earnings', icon: DollarSign },
    { label: 'Reviews & Messages', path: '/seller/reviews', icon: MessageSquare },
    { label: 'Analytics', path: '/seller/analytics', icon: BarChart2 }
  ];

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', margin: '30px auto' }}>
      {/* Sidebar */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #ddd', height: 'fit-content' }}>
        <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={28} color="#f08804" />
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>Seller Hub</div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>Vendor Management</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                  borderRadius: '10px', textDecoration: 'none',
                  background: isActive ? '#fff8e7' : 'transparent',
                  color: isActive ? '#f08804' : '#444',
                  fontWeight: isActive ? '700' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Panel Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
