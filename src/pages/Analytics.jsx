import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const WEEKLY = [
  { day: 'Mon', revenue: 12400, orders: 18 },
  { day: 'Tue', revenue: 9800,  orders: 14 },
  { day: 'Wed', revenue: 15200, orders: 22 },
  { day: 'Thu', revenue: 11000, orders: 16 },
  { day: 'Fri', revenue: 18500, orders: 27 },
  { day: 'Sat', revenue: 22100, orders: 32 },
  { day: 'Sun', revenue: 16800, orders: 24 },
];

const MONTHLY = [
  { month: 'Sep', revenue: 185000 },
  { month: 'Oct', revenue: 210000 },
  { month: 'Nov', revenue: 198000 },
  { month: 'Dec', revenue: 265000 },
  { month: 'Jan', revenue: 231000 },
  { month: 'Feb', revenue: 184320 },
];

const CATEGORY_PIE = [
  { name: 'Fruits & Veg', value: 28, color: '#22c55e' },
  { name: 'Dairy', value: 18, color: '#f59e0b' },
  { name: 'Beverages', value: 14, color: '#3b82f6' },
  { name: 'Snacks', value: 16, color: '#f97316' },
  { name: 'Household', value: 12, color: '#8b5cf6' },
  { name: 'Other', value: 12, color: '#64748b' },
];

const TOP_PRODUCTS = [
  { name: 'Amul Full Cream Milk', orders: 142, revenue: 9656 },
  { name: 'Fresh Bananas', orders: 118, revenue: 4602 },
  { name: "Lay's Classic Chips", orders: 97, revenue: 2910 },
  { name: 'Dark Chocolate Bar', orders: 86, revenue: 8514 },
  { name: 'Organic Honey', orders: 64, revenue: 22336 },
];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#f1f5f9', fontWeight: 700, fontSize: 13 }}>
            {p.name === 'revenue' ? fmt(p.value) : p.value + ' orders'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [view, setView] = useState('week');
  const chartData = view === 'week' ? WEEKLY : MONTHLY;
  const dataKey = view === 'week' ? 'day' : 'month';

  return (
    <Layout title="Analytics">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">Revenue and sales performance overview</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${view === 'week' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('week')}>7 Days</button>
          <button className={`btn btn-sm ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('month')}>6 Months</button>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Revenue Trend</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={dataKey} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Orders Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Daily Orders</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Sales by Category</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={CATEGORY_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {CATEGORY_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Top 5 Products by Orders</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((p, i) => (
                <tr key={p.name}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</td>
                  <td className="font-semibold">{p.name}</td>
                  <td>{p.orders}</td>
                  <td className="font-semibold" style={{ color: 'var(--accent-light)' }}>{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
