import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryIdParam = searchParams.get('categoryId') || '';
  const queryParam = searchParams.get('query') || '';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    productApi.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const params = {
      page,
      size: 20,
      sortBy,
      sortDir,
      query: queryParam || undefined,
      categoryId: categoryIdParam ? parseInt(categoryIdParam, 10) : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      brand: selectedBrand || undefined,
    };

    productApi.getProducts(params).then(res => {
      if (res.success && res.data) {
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryIdParam, queryParam, sortBy, sortDir]);

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    const newParams = {};
    if (newCatId) newParams.categoryId = newCatId;
    if (queryParam) newParams.query = queryParam;
    setSearchParams(newParams);
    setPage(0);
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleClearFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrand('');
    setSearchParams({});
    setPage(0);
  };

  const getCategoryTitle = () => {
    if (queryParam) return `Search Results for "${queryParam}"`;
    if (!categoryIdParam) return 'All Products';
    const found = categories.find(c => String(c.categoryId) === String(categoryIdParam));
    return found ? `${found.categoryName} Catalog` : 'Category Products';
  };

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px', margin: '30px auto' }}>
      {/* Sidebar Filter Panel */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #ddd', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', pb: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={18} color="#f08804" /> Filters
          </h3>
          <button onClick={handleClearFilter} style={{ background: 'none', border: 'none', color: '#007185', fontSize: '0.8rem', cursor: 'pointer' }}>Clear All</button>
        </div>

        <form onSubmit={handleApplyFilter}>
          {/* Category Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Category</label>
            <select
              value={categoryIdParam}
              onChange={handleCategoryChange}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '700', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Price Range (₹)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: '50%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '50%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-amber" style={{ width: '100%', padding: '10px' }}>Apply Filter</button>
        </form>
      </div>

      {/* Main Catalog View */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #ddd' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
            {getCategoryTitle()}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Sort by:</label>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
              }}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Featured & Top Rated</option>
              <option value="productId-asc">New Arrivals</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ background: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>
            <h3>No products found matching your criteria</h3>
            <p style={{ color: '#666', marginTop: '8px' }}>Try clearing filters or changing search keywords.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '30px' }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ccc', background: page === 0 ? '#eee' : 'white', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                style={{
                  width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #ccc',
                  background: page === idx ? '#131921' : 'white',
                  color: page === idx ? 'white' : '#333',
                  fontWeight: '700', cursor: 'pointer'
                }}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ccc', background: page >= totalPages - 1 ? '#eee' : 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
