import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Plus, Search, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';

const emptyForm = { title: '', subtitle: '', image: null, clickUrl: '', emoji: '', color: '#f4f6fa', isActive: true };

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Fetch all banners for admin
    api.get('/banners?admin=true').then(res => setBanners(res.data)).catch(err => console.error(err));
  }, []);

  const filteredBanners = banners.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    (b.subtitle && b.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      clickUrl: banner.clickUrl || '',
      emoji: banner.emoji || '',
      color: banner.color || '#f4f6fa',
      isActive: banner.isActive
    });
    setEditingId(banner._id);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subtitle', form.subtitle);
    formData.append('clickUrl', form.clickUrl);
    formData.append('emoji', form.emoji);
    formData.append('color', form.color);
    formData.append('isActive', form.isActive);
    
    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    try {
      if (editingId) {
        const res = await api.put(`/banners/${editingId}`, formData);
        setBanners(prev => prev.map(b => b._id === editingId ? res.data : b));
      } else {
        const res = await api.post('/banners', formData);
        setBanners(prev => [res.data, ...prev]);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner. Please check the console.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner.');
    }
  };

  const toggleActive = async (banner) => {
    try {
      // Create a plain object for toggling isActive to bypass FormData if no image
      const res = await api.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b._id === banner._id ? res.data : b));
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };

  return (
    <Layout title="Banners">
      <div className="page-header">
        <div>
          <div className="page-title">Banners Management</div>
          <div className="page-subtitle">{banners.length} banners total</div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="filters-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Search className="search-icon" />
          <input 
            className="search-input" 
            placeholder="Search banners..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid-3">
        {filteredBanners.map(banner => (
          <div key={banner._id} className="cat-card" style={{ borderLeft: `6px solid ${banner.color || '#ddd'}` }}>
            <div className="cat-icon" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
              {banner.image ? (
                // Use the backend URL appropriately. Since Vite/React runs on a diff port, image URLs (like /uploads/...)
                // might need the backend base URL prepended if api.js doesn't handle it for naked img tags.
                // Assuming it works based on Categories.jsx
                <img src={banner.image.startsWith('http') ? banner.image : `http://localhost:5000${banner.image}`} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon style={{ margin: 'auto', color: '#ccc' }} size={32} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="cat-name">{banner.title} {banner.emoji}</div>
              <div className="cat-meta">{banner.subtitle}</div>
              <div style={{ marginTop: 6 }}>
                <span 
                  onClick={() => toggleActive(banner)}
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    backgroundColor: banner.isActive ? '#dcfce7' : '#fee2e2',
                    color: banner.isActive ? '#166534' : '#991b1b',
                    fontWeight: 600
                  }}
                >
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
                {banner.clickUrl && (
                  <span style={{ fontSize: '0.75rem', marginLeft: 8, color: '#666' }}>🔗 {banner.clickUrl}</span>
                )}
              </div>
            </div>
            <div className="cat-actions" style={{ flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => openEditModal(banner)}><Pencil size={14} /></button>
              <button className="btn btn-icon btn-danger btn-sm" onClick={() => handleDelete(banner._id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filteredBanners.length === 0 && (
          <div style={{ padding: 20, color: '#666', gridColumn: '1 / -1', textAlign: 'center' }}>
            No banners found. Add a banner to display it in the mobile app carousel.
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <span className="modal-title">{editingId ? 'Edit Banner' : 'Add Banner'}</span>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g., Grocery Sale" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <input className="form-input" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="e.g., Up to 50% Off" />
                </div>

                <div className="form-group">
                  <label className="form-label">Image *</label>
                  <input type="file" className="form-input" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} style={{ padding: '8px' }} />
                  {form.image && typeof form.image === 'string' && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Current image: {form.image.split('/').pop()}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Card Background Hex</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                      <input className="form-input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Emoji</label>
                    <input className="form-input" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="e.g., 🎉" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Link/Action Route</label>
                  <input className="form-input" value={form.clickUrl} onChange={e => setForm(f => ({ ...f, clickUrl: e.target.value }))} placeholder="e.g., /shop or categoryID" />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input 
                    type="checkbox" 
                    id="isActiveCheck"
                    checked={form.isActive} 
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} 
                  />
                  <label htmlFor="isActiveCheck" className="form-label" style={{ margin: 0 }}>Active (Visible in App)</label>
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Banners;
