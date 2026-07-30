import React, { useEffect, useState } from 'react';
import { sellerApi } from '../../api/sellerApi';
import { BarChart2, TrendingUp, Package, DollarSign, Award } from 'lucide-react';

export default function SellerAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    sellerApi.getAnalyticsOverview().then(res => {
      if (res.success) setOverview(res.data);
    });

    sellerApi.getTopProducts().then(res => {
      if (res.success) setTopProducts(res.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #ddd' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Store Analytics & Metrics</h2>
      <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '24px' }}>Analyze sales performance, units sold, conversion rate, and best-selling products.</p>

      {/* Analytics Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#718096', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={16} color="#007185" /> Total Revenue
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#2d3748' }}>₹{overview?.totalRevenue || '0.00'}</div>
        </div>

        <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#718096', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={16} color="#f08804" /> Units Sold
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#2d3748' }}>{overview?.totalUnitsSold || 0}</div>
        </div>

        <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#718096', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={16} color="#2e7d32" /> Total Orders
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#2d3748' }}>{overview?.totalOrders || 0}</div>
        </div>

        <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
          <div style={{ color: '#718096', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} color="#805ad5" /> Conversion Rate
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: '#805ad5' }}>{overview?.conversionRate || '0.00%'}</div>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={20} color="#f08804" /> Top Selling Products
      </h3>

      {topProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#666', background: '#fafafa', borderRadius: '12px' }}>
          No top selling product analytics recorded yet.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Rank & Product</th>
              <th style={{ padding: '12px' }}>Units Sold</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Total Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((tp, idx) => (
              <tr key={tp.productId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', width: '24px', height: '24px', borderRadius: '50%', background: '#fff8e7', color: '#f08804', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    #{idx + 1}
                  </span>
                  <img src={tp.imageUrl} alt={tp.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                  <span style={{ fontWeight: '700' }}>{tp.name}</span>
                </td>
                <td style={{ padding: '12px', fontWeight: '700' }}>{tp.unitsSold} units</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '800', color: '#2e7d32' }}>₹{tp.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
