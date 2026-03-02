import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

const MOCK_CATS = [
  { _id: '1', name: 'Fruits & Vegetables', icon: '🥦', color: '#22c55e', description: 'Fresh produce' },
  { _id: '2', name: 'Dairy & Eggs', icon: '🥛', color: '#f59e0b', description: 'Milk and eggs' },
  { _id: '3', name: 'Bakery', icon: '🍞', color: '#d97706', description: 'Fresh bakery items' },
  { _id: '4', name: 'Beverages', icon: '🥤', color: '#3b82f6', description: 'Drinks and juices' },
  { _id: '5', name: 'Snacks', icon: '🍿', color: '#f97316', description: 'Chips and treats' },
  { _id: '6', name: 'Meat & Seafood', icon: '🥩', color: '#ef4444', description: 'Fresh meat' },
  { _id: '7', name: 'Frozen Foods', icon: '🧊', color: '#06b6d4', description: 'Frozen items' },
  { _id: '8', name: 'Personal Care', icon: '🧴', color: '#ec4899', description: 'Hygiene products' },
  { _id: '9', name: 'Household', icon: '🧹', color: '#8b5cf6', description: 'Cleaning products' },
  { _id: '10', name: 'Organic', icon: '🌿', color: '#16a34a', description: 'Organic produce' },
];

const empty = { name: '', icon: '🛒', color: '#6366f1', description: '' };

const Categories = () => {
  const [categories, setCategories] = useState(MOCK_CATS);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (cat) => { setForm({ name: cat.name, icon: cat.icon, color: cat.color, description: cat.description }); setEditing(cat._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editing) {
      try { const r = await api.put(`/categories/${editing}`, form); setCategories(cats => cats.map(c => c._id === editing ? r.data : c)); }
      catch { setCategories(cats => cats.map(c => c._id === editing ? { ...c, ...form } : c)); }
    } else {
      try { const r = await api.post('/categories', form); setCategories(cats => [...cats, r.data]); }
      catch { setCategories(cats => [...cats, { ...form, _id: Date.now().toString() }]); }
    }
    setModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); } catch {}
    setCategories(cats => cats.filter(c => c._id !== id));
  };

  return (
    <Layout title="Categories">
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-subtitle">{categories.length} categories total</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="filters-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Search className="search-icon" />
          <input className="search-input" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid-3">
        {filtered.map(cat => (
          <div key={cat._id} className="cat-card">
            <div className="cat-icon" style={{ background: `${cat.color}22` }}>
              {cat.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-meta">{cat.description}</div>
            </div>
            <div className="cat-actions">
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => openEdit(cat)}><Pencil size={14} /></button>
              <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(cat._id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</span>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Icon (emoji)</label>
                    <input className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input type="color" className="form-input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ padding: 4, height: 40 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Categories;
