import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Search, Eye, X } from 'lucide-react';

const MOCK_ORDERS = [
  { _id: 'o001', customerName: 'Priya Sharma', customerEmail: 'priya@example.com', phone: '+91 9876501234', address: '42, Sector 18, Noida', totalAmount: 1249, status: 'Delivered', paymentMethod: 'UPI', items: [{ name: 'Fresh Bananas', price: 39, qty: 2 }, { name: 'Amul Milk', price: 68, qty: 2 }], createdAt: '2026-02-24T10:30:00.000Z' },
  { _id: 'o002', customerName: 'Rahul Mehta', customerEmail: 'rahul@example.com', phone: '+91 9876502345', address: '12, MG Road, Bengaluru', totalAmount: 689, status: 'Processing', paymentMethod: 'Cash on Delivery', items: [{ name: "Lay's Chips", price: 30, qty: 3 }], createdAt: '2026-02-24T09:00:00.000Z' },
  { _id: 'o003', customerName: 'Anjali Singh', customerEmail: 'anjali@example.com', phone: '+91 9876503456', address: '7, Andheri West, Mumbai', totalAmount: 2190, status: 'Shipped', paymentMethod: 'UPI', items: [{ name: 'Chicken Breast', price: 249, qty: 2 }], createdAt: '2026-02-23T15:00:00.000Z' },
  { _id: 'o004', customerName: 'Karan Patel', customerEmail: 'karan@example.com', phone: '+91 9876504567', address: '23, Connaught Place, New Delhi', totalAmount: 445, status: 'Pending', paymentMethod: 'Cash on Delivery', items: [{ name: 'Dark Chocolate Bar', price: 99, qty: 4 }], createdAt: '2026-02-23T12:00:00.000Z' },
  { _id: 'o005', customerName: 'Meera Reddy', customerEmail: 'meera@example.com', phone: '+91 9876505678', address: '55, Anna Nagar, Chennai', totalAmount: 879, status: 'Cancelled', paymentMethod: 'UPI', items: [{ name: 'Organic Honey', price: 349, qty: 1 }], createdAt: '2026-02-22T08:00:00.000Z' },
  { _id: 'o006', customerName: 'Arjun Verma', customerEmail: 'arjun@example.com', phone: '+91 9876506789', address: '8, Jubilee Hills, Hyderabad', totalAmount: 1590, status: 'Delivered', paymentMethod: 'UPI', items: [{ name: 'Greek Yogurt', price: 75, qty: 4 }], createdAt: '2026-02-21T14:00:00.000Z' },
];

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
);

const Orders = () => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    api.get('/orders?limit=50').then(r => setOrders(r.data.orders || [])).catch(() => {});
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o._id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status) => {
    try { await api.put(`/orders/${id}/status`, { status }); } catch {}
    setOrders(os => os.map(o => o._id === id ? { ...o, status } : o));
    if (detailOrder?._id === id) setDetailOrder(d => ({ ...d, status }));
  };

  return (
    <Layout title="Orders">
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">{orders.length} orders total</div>
        </div>
      </div>

      <div className="filters-row">
        <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
          <Search className="search-icon" />
          <input className="search-input" placeholder="Search by customer or order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm text-muted">{filtered.length} results</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-light)', fontSize: 12 }}>#{String(o._id).slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="font-semibold" style={{ fontSize: 13 }}>{o.customerName}</div>
                    <div className="text-xs text-muted">{o.customerEmail}</div>
                  </td>
                  <td className="font-semibold">{fmt(o.totalAmount)}</td>
                  <td className="text-sm text-muted">{o.paymentMethod}</td>
                  <td>
                    <select
                      className="filter-select"
                      value={o.status}
                      onChange={e => updateStatus(o._id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: 12 }}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="text-sm text-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setDetailOrder(o)} title="View details">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Order #{String(detailOrder._id).slice(-6).toUpperCase()}</span>
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setDetailOrder(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <StatusBadge status={detailOrder.status} />
                <span className="text-sm text-muted">{detailOrder.paymentMethod}</span>
              </div>
              <div>
                <div className="form-label">Customer</div>
                <div style={{ marginTop: 4 }}><strong>{detailOrder.customerName}</strong> · {detailOrder.customerEmail}</div>
                <div className="text-sm text-muted">{detailOrder.phone}</div>
              </div>
              <div>
                <div className="form-label">Delivery Address</div>
                <div className="text-sm" style={{ marginTop: 4 }}>{detailOrder.address}</div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Items</div>
                {detailOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm">{item.name} × {item.qty}</span>
                    <span className="text-sm font-semibold">{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0' }}>
                  <span className="font-bold">Total</span>
                  <span className="font-bold" style={{ color: 'var(--accent-light)', fontSize: 16 }}>{fmt(detailOrder.totalAmount)}</span>
                </div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Update Status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button key={s} className={`btn btn-sm ${detailOrder.status === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => updateStatus(detailOrder._id, s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
