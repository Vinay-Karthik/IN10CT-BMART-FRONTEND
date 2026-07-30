import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryBar() {
  return (
    <div className="amz-subnav">
      <Link to="/products" className="amz-subnav-link">All Products</Link>
      <Link to="/products?categoryId=1" className="amz-subnav-link">Backpacks</Link>
      <Link to="/products?categoryId=2" className="amz-subnav-link">Handbags & Totes</Link>
      <Link to="/products?categoryId=3" className="amz-subnav-link">Travel Bags & Trolleys</Link>
      <Link to="/products?categoryId=4" className="amz-subnav-link">Wallets & Clutches</Link>
      <span style={{ marginLeft: 'auto', color: '#febd69', fontSize: '0.85rem', fontWeight: '600' }}>
        Free Express Delivery Across India 🇮🇳
      </span>
    </div>
  );
}
