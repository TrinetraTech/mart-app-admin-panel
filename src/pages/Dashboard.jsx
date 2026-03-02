import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { ShoppingCart, Package, Users, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';

// Fallback mock data used when backend is not available
const MOCK_STATS = {
  totalOrders: 247,
  totalProducts: 35,
  totalUsers: 1280,
  totalRevenue: 184320,
  weeklyRevenue: [
    { day: 'Mon', revenue: 12400 },
    { day: 'Tue', revenue: 9800 },
    { day: 'Wed', revenue: 15200 },
    { day: 'Thu', revenue: 11000 },
    { day: 'Fri', revenue: 18500 },
    { day: 'Sat', revenue: 22100 },
    { day: 'Sun', revenue: 16800 },
  ],
  ordersByStatus: [
    { _id: 'Delivered', count: 142 },
    { _id: 'Processing', count: 38 },
    { _id: 'Shipped', count: 27 },
    { _id: 'Pending', count: 24 },
    { _id: 'Cancelled', count: 16 },
  ],
};

const MOCK_ORDERS = [
  { _id: '001', customerName: 'Priya Sharma', totalAmount: 1249, status: 'Delivered', createdAt: new Date(Date.now() - 3600000) },
  { _id: '002', customerName: 'Rahul Mehta', totalAmount: 689, status: 'Processing', createdAt: new Date(Date.now() - 7200000) },
  { _id: '003', customerName: 'Anjali Singh', totalAmount: 2190, status: 'Shipped', createdAt: new Date(Date.now() - 10800000) },
  { _id: '004', customerName: 'Karan Patel', totalAmount: 445, status: 'Pending', createdAt: new Date(Date.now() - 14400000) },
  { _id: '005', customerName: 'Meera Reddy', totalAmount: 879, status: 'Delivered', createdAt: new Date(Date.now() - 18000000) },
];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const timeAgo = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#f1f5f9', fontWeight: 700 }}>{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(MOCK_STATS);
  const [recentOrders, setRecentOrders] = useState(MOCK_ORDERS);

  useEffect(() => {
    api.get('/analytics/summary').then(r => setStats(r.data)).catch(() => {});
    api.get('/orders?limit=5').then(r => setRecentOrders(r.data.orders || MOCK_ORDERS)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: TrendingUp, color: 'purple', trend: '+12.5%' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'blue', trend: '+8.2%' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'green', trend: '+3.1%' },
    { label: 'Customers', value: stats.totalUsers?.toLocaleString(), icon: Users, color: 'amber', trend: '+15.4%' },
  ];

  return (
    <Layout title="Dashboard">
      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className={`stat-icon ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-trend up">
                <ArrowUpRight size={12} style={{ display: 'inline' }} /> {card.trend} this month
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="charts-row">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue — Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.weeklyRevenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Orders by Status</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.ordersByStatus} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="_id" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                  {payload[0].value} orders
                </div>
              ) : null} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Orders</span>
          <Clock size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-light)' }}>#{String(order._id).slice(-6).toUpperCase()}</td>
                  <td>{order.customerName}</td>
                  <td className="font-semibold">{fmt(order.totalAmount)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-muted text-sm">{timeAgo(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
