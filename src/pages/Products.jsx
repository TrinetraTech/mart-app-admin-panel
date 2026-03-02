import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

const MOCK_CATS = [
  { _id: 'c1', name: 'Fruits & Vegetables' },
  { _id: 'c2', name: 'Dairy & Eggs' },
  { _id: 'c3', name: 'Bakery' },
  { _id: 'c4', name: 'Beverages' },
  { _id: 'c5', name: 'Snacks' },
];

const MOCK_PRODUCTS = [
  { _id: '1', name: 'Fresh Bananas', price: 39, mrp: 49, stock: 150, brand: 'Farm Fresh', category: { name: 'Fruits & Vegetables' }, rating: 4.5, isActive: true, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=80&q=80' },
  { _id: '2', name: 'Amul Full Cream Milk', price: 68, mrp: 72, stock: 200, brand: 'Amul', category: { name: 'Dairy & Eggs' }, rating: 4.8, isActive: true, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&q=80' },
  { _id: '3', name: 'Whole Wheat Bread', price: 45, mrp: 52, stock: 80, brand: 'Britannia', category: { name: 'Bakery' }, rating: 4.3, isActive: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&q=80' },
  { _id: '4', name: 'Tropicana Orange Juice', price: 99, mrp: 120, stock: 60, brand: 'Tropicana', category: { name: 'Beverages' }, rating: 4.5, isActive: true, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=80&q=80' },
  { _id: '5', name: "Lay's Classic Chips", price: 30, mrp: 35, stock: 300, brand: "Lay's", category: { name: 'Snacks' }, rating: 4.4, isActive: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=80&q=80' },
  { _id: '6', name: 'Dark Chocolate Bar', price: 99, mrp: 120, stock: 120, brand: 'Lindt', category: { name: 'Snacks' }, rating: 4.8, isActive: true, image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=80&q=80' },
  { _id: '7', name: 'Organic Honey', price: 349, mrp: 420, stock: 45, brand: 'Dabur', category: { name: 'Fruits & Vegetables' }, rating: 4.8, isActive: true, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&q=80' },
  { _id: '8', name: 'Chicken Breast', price: 249, mrp: 299, stock: 30, brand: 'Licious', category: { name: 'Dairy & Eggs' }, rating: 4.6, isActive: false, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=80&q=80' },
];

const emptyForm = { name: '', price: '', mrp: '', stock: '', brand: '', unit: 'piece', description: '', image: '', category: '', isActive: true };

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const Products = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [categories, setCategories] = useState(MOCK_CATS);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.get('/products?limit=50').then(r => setProducts(r.data.products || [])).catch(() => {});
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, mrp: p.mrp, stock: p.stock, brand: p.brand, unit: p.unit || 'piece', description: p.description || '', image: p.image || '', category: p.category?._id || '', isActive: p.isActive });
    setEditing(p._id); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), mrp: Number(form.mrp), stock: Number(form.stock) };
    if (editing) {
      try { const r = await api.put(`/products/${editing}`, payload); setProducts(ps => ps.map(p => p._id === editing ? r.data : p)); }
      catch { setProducts(ps => ps.map(p => p._id === editing ? { ...p, ...form } : p)); }
    } else {
      try { const r = await api.post('/products', payload); setProducts(ps => [...ps, r.data]); }
      catch { setProducts(ps => [...ps, { ...payload, _id: Date.now().toString(), category: { name: categories.find(c => c._id === form.category)?.name || '' } }]); }
    }
    setModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); } catch {}
    setProducts(ps => ps.filter(p => p._id !== id));
  };

  const discount = (p) => Math.round((1 - p.price / p.mrp) * 100);

  return (
    <Layout title="Products">
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">{products.length} products total</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="filters-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <Search className="search-icon" />
          <input className="search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-muted">{filtered.length} results</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="product-cell">
                      <img src={p.image} alt={p.name} className="product-img" onError={e => e.target.style.display='none'} />
                      <div>
                        <div className="font-semibold" style={{ fontSize: 13 }}>{p.name}</div>
                        <div className="text-xs text-muted">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{p.category?.name || '—'}</td>
                  <td>
                    <div className="font-semibold">{fmt(p.price)}</div>
                    <div className="text-xs text-muted" style={{ textDecoration: 'line-through' }}>{fmt(p.mrp)}</div>
                  </td>
                  <td><span className="badge badge-active">{discount(p)}% off</span></td>
                  <td className={p.stock < 50 ? 'text-sm' : 'text-sm'} style={{ color: p.stock < 50 ? 'var(--warning)' : 'var(--text-primary)' }}>{p.stock}</td>
                  <td><span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-icon btn-ghost btn-sm" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                      <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(p._id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</span>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP (₹) *</label>
                    <input type="number" className="form-input" value={form.mrp} onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-input" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input className="form-input" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. 500g, 1L" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="form-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <label htmlFor="isActive" className="form-label" style={{ margin: 0 }}>Active</label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
