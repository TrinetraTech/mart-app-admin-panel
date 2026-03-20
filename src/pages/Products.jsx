import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { DataTable } from 'mantine-datatable';

const MOCK_CATS = [
  { _id: 'c1', name: 'Fruits & Vegetables' },
  { _id: 'c2', name: 'Dairy & Eggs' },
  { _id: 'c3', name: 'Bakery' },
  { _id: 'c4', name: 'Beverages' },
  { _id: 'c5', name: 'Snacks' },
];

const emptyForm = { name: '', price: '', mrp: '', stock: '', brand: '', unit: 'piece', description: '', image: null, category: '', isActive: true };

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(MOCK_CATS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lowStock, setLowStock] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortStatus, setSortStatus] = useState({ columnAccessor: 'createdAt', direction: 'desc' });
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetching(true);
      try {
        const query = new URLSearchParams({
          page,
          limit: pageSize,
          sortBy: sortStatus.columnAccessor,
          sortOrder: sortStatus.direction,
          status: statusFilter
        });
        if (search) query.append('search', search);
        if (lowStock) query.append('lowStock', 'true');

        const r = await api.get(`/products?${query.toString()}`);
        setProducts(r.data.products || []);
        setTotalRecords(r.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProducts();
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, [page, pageSize, sortStatus, search, statusFilter, lowStock]);

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, mrp: p.mrp, stock: p.stock, brand: p.brand, unit: p.unit || 'piece', description: p.description || '', image: p.image || '', category: p.category?._id || '', isActive: p.isActive });
    setEditing(p._id); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (Number(form.price) >= Number(form.mrp)) {
      alert('MRP must be strictly greater than Price.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', Number(form.price));
    formData.append('mrp', Number(form.mrp));
    formData.append('stock', Number(form.stock));
    formData.append('brand', form.brand);
    formData.append('unit', form.unit);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('isActive', form.isActive);
    
    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    if (editing) {
      try { const r = await api.put(`/products/${editing}`, formData); setProducts(ps => ps.map(p => p._id === editing ? r.data : p)); }
      catch (error) { console.error('Error updating product:', error); }
    } else {
      try { const r = await api.post('/products', formData); setProducts(ps => [...ps, r.data]); }
      catch (error) { console.error('Error adding product:', error); }
    }
    setModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); } catch {}
    setProducts(ps => ps.filter(p => p._id !== id));
  };

  const getDiscount = (p) => {
    if (typeof p.discount === 'number') return Math.round(p.discount);
    if (!p.mrp || p.mrp <= 0) return 0;
    return Math.round((1 - (p.price || 0) / p.mrp) * 100);
  };

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
        <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
            <Search className="search-icon" size={18} />
            <input className="search-input" placeholder="Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width: 140 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={lowStock} onChange={e => { setLowStock(e.target.checked); setPage(1); }} />
            Low Stock Only (&lt;50)
          </label>
        </div>
        <span className="text-sm text-muted">{totalRecords} results</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          minHeight={300}
          idAccessor="_id"
          fetching={isFetching}
          records={products}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={[10, 20, 50, 100]}
          onRecordsPerPageChange={(size) => { setPageSize(size); setPage(1); }}
          sortStatus={sortStatus}
          onSortStatusChange={(status) => { setSortStatus(status); setPage(1); }}
          columns={[
            {
              accessor: 'name',
              title: 'Product',
              sortable: true,
              render: (p) => {
                try {
                  return (
                    <div className="product-cell">
                      <img src={p.image || ''} alt={p.name || 'product'} className="product-img" onError={e => e.target.style.display='none'} />
                      <div>
                        <div className="font-semibold" style={{ fontSize: 13 }}>{p.name || 'Unknown'}</div>
                        <div className="text-xs text-muted">{p.brand || 'No Brand'}</div>
                      </div>
                    </div>
                  );
                } catch(e) { return <span>Error</span>; }
              }
            },
            {
              accessor: 'category',
              title: 'Category',
              render: (p) => {
                try { return <span className="text-sm text-muted">{p.category?.name || '—'}</span>; }
                catch(e) { return <span>Error</span>; }
              }
            },
            {
              accessor: 'price',
              title: 'Price',
              sortable: true,
              render: (p) => {
                try {
                  return (
                    <>
                      <div className="font-semibold">{fmt(p.price)}</div>
                      <div className="text-xs text-muted" style={{ textDecoration: 'line-through' }}>{fmt(p.mrp)}</div>
                    </>
                  );
                } catch(e) { return <span>Error</span>; }
              }
            },
            {
              accessor: 'discount',
              title: 'Discount',
              sortable: true,
              render: (p) => {
                try { return <span className="badge badge-active">{getDiscount(p)}% off</span>; }
                catch(e) { return <span>Error</span>; }
              }
            },
            {
              accessor: 'stock',
              title: 'Stock',
              sortable: true,
              render: (p) => {
                try { return <span className="text-sm" style={{ color: (p.stock || 0) < 50 ? 'var(--warning)' : 'var(--text-primary)' }}>{p.stock || 0}</span>; }
                catch(e) { return <span>Error</span>; }
              }
            },
            {
              accessor: 'isActive',
              title: 'Status',
              sortable: true,
              render: (p) => {
                try { return <span className={`badge ${(p.isActive ?? true) ? 'badge-active' : 'badge-inactive'}`}>{(p.isActive ?? true) ? 'Active' : 'Inactive'}</span>; }
                catch(e) { return <span>Error</span>; }
              }
            },
            {
              accessor: 'actions',
              title: 'Actions',
              render: (p) => {
                try {
                  return (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-icon btn-ghost btn-sm" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                      <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(p._id)}><Trash2 size={14} /></button>
                    </div>
                  );
                } catch(e) { return <span>Error</span>; }
              }
            }
          ]}
        />
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
                  <label className="form-label">Image</label>
                  <input type="file" className="form-input" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} style={{ padding: '8px' }} />
                  {form.image && typeof form.image === 'string' && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Current image: {form.image}</div>
                  )}
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
