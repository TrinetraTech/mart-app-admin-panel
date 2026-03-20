import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

const empty = { name: '', image: null, description: '' };

const Categories = () => {
  const [categories, setCategories] = useState([]);
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
  const openEdit = (cat) => { setForm({ name: cat.name, image: cat.image, description: cat.description }); setEditing(cat._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    if (editing) {
      try { const r = await api.put(`/categories/${editing}`, formData); setCategories(cats => cats.map(c => c._id === editing ? r.data : c)); }
      catch (error) { console.error('Error updating:', error); }
    } else {
      try { const r = await api.post('/categories', formData); setCategories(cats => [...cats, r.data]); }
      catch (error) { console.error('Error adding:', error); }
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
            <div className="cat-icon" style={{ padding: 0, overflow: 'hidden' }}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ margin: 'auto', fontSize: '1.5rem' }}>🛒</span>
              )}
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
                <div className="form-group">
                  <label className="form-label">Image</label>
                  <input type="file" className="form-input" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} style={{ padding: '8px' }} />
                  {form.image && typeof form.image === 'string' && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Current image: {form.image}</div>
                  )}
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
