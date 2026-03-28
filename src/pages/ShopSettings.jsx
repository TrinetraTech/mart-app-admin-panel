import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Save, CheckCircle, AlertCircle, Loader, MapPin } from 'lucide-react';

// Fix default Leaflet marker icons (broken in bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Inner component: listens for clicks and moves the marker
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const DEFAULT_CENTER = [20.5937, 78.9629]; // India centre
const DEFAULT_ZOOM   = 5;

const ShopSettings = () => {
  const [form, setForm] = useState({
    shopName: '',
    freeRadiusKm: 5,
    chargePerKm: 10,
  });
  const [marker, setMarker]     = useState(null); // { lat, lng }
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom]   = useState(DEFAULT_ZOOM);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get('/shop-settings')
      .then(res => {
        const s = res.data;
        setForm({
          shopName:     s.shopName     || '',
          freeRadiusKm: s.freeRadiusKm ?? 5,
          chargePerKm:  s.chargePerKm  ?? 10,
        });
        if (s.lat != null && s.lng != null) {
          setMarker({ lat: s.lat, lng: s.lng });
          setMapCenter([s.lat, s.lng]);
          setMapZoom(14);
        }
      })
      .catch(err => { if (err.response?.status !== 404) showToast('error', 'Could not load settings.'); })
      .finally(() => setLoading(false));
  }, []);

  const handleLocationSelect = useCallback((lat, lng) => {
    setMarker({ lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) });
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!marker) {
      showToast('error', 'Please click on the map to set your shop location.');
      return;
    }
    setSaving(true);
    try {
      await api.put('/shop-settings', {
        shopName:     form.shopName,
        lat:          marker.lat,
        lng:          marker.lng,
        freeRadiusKm: parseFloat(form.freeRadiusKm),
        chargePerKm:  parseFloat(form.chargePerKm),
      });
      showToast('success', 'Shop delivery settings saved!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const freeR   = parseFloat(form.freeRadiusKm) || 0;
  const rate    = parseFloat(form.chargePerKm)  || 0;
  const exCharge = Math.round(3 * rate);

  return (
    <Layout title="Shop Settings">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: 10, padding: '12px 18px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          fontWeight: 600, fontSize: '0.9rem',
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Shop & Delivery Settings</div>
          <div className="page-subtitle">Pin your shop on the map and configure delivery charges</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 32, color: '#666' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

            {/* ── LEFT: Map + Shop Name ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Shop Name */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">🏪 Shop Name</label>
                  <input
                    className="form-input"
                    value={form.shopName}
                    onChange={set('shopName')}
                    placeholder="e.g. Spermart Main Store"
                  />
                </div>
              </div>

              {/* Map */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                  padding: '14px 20px',
                  background: marker ? '#f0fdf4' : '#fff7ed',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <MapPin size={16} style={{ color: marker ? '#16a34a' : '#ea580c' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>
                      {marker ? '📍 Shop location set' : '👆 Click on the map to pin your shop'}
                    </div>
                    {marker && (
                      <div style={{ fontSize: '0.78rem', color: '#555', marginTop: 2 }}>
                        {marker.lat}, {marker.lng} —{' '}
                        <a
                          href={`https://www.google.com/maps?q=${marker.lat},${marker.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#6c63ff', textDecoration: 'none', fontWeight: 600 }}
                        >
                          Verify on Google Maps ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: 420, width: '100%', cursor: 'crosshair' }}
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                  {marker && <Marker position={[marker.lat, marker.lng]} />}
                </MapContainer>
              </div>
            </div>

            {/* ── RIGHT: Delivery Settings + Preview ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Delivery pricing */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', marginBottom: 16 }}>
                  🚴 Delivery Charges
                </div>
                <div className="form-group">
                  <label className="form-label">Free Delivery Radius (km)</label>
                  <input
                    className="form-input"
                    type="number" min="0" step="0.5"
                    value={form.freeRadiusKm}
                    onChange={set('freeRadiusKm')}
                  />
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
                    Customers within this distance get free delivery
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Charge per km (₹)</label>
                  <input
                    className="form-input"
                    type="number" min="0" step="1"
                    value={form.chargePerKm}
                    onChange={set('chargePerKm')}
                  />
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
                    Applied for every km beyond the free radius
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, color: '#1a1a2e' }}>
                  📱 Charge Preview
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600, marginBottom: 3 }}>
                      WITHIN {freeR} km
                    </div>
                    <div style={{ fontWeight: 700, color: '#166534' }}>🎉 Free Delivery</div>
                  </div>
                  <div style={{ background: '#fff7ed', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600, marginBottom: 3 }}>
                      {freeR + 3} km AWAY (example)
                    </div>
                    <div style={{ fontWeight: 700, color: '#c2410c' }}>🚴 ₹{exCharge} Delivery</div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>3 km × ₹{rate}/km</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#aaa', lineHeight: 1.5 }}>
                  Formula: (distance − {freeR}km) × ₹{rate}
                </div>
              </div>

              {/* Save */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !marker}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {saving
                  ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                  : <><Save size={15} /> Save Settings</>
                }
              </button>
              {!marker && (
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#f97316', marginTop: -8 }}>
                  ⚠️ Pin a location on the map first
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </Layout>
  );
};

export default ShopSettings;
