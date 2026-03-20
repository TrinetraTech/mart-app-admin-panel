import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 8,
          padding: "10px 14px",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>
          {label}
        </p>
        {payload.map((p, i) => (
          <p
            key={i}
            style={{
              color: p.color || "#f1f5f9",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {p.name === "revenue" ? fmt(p.value) : p.value + " orders"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [view, setView] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/analytics/summary")
      .then((res) => {
        setData(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Analytics">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
            color: "var(--text-muted)",
            fontSize: 16,
          }}
        >
          Loading analytics…
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Analytics">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
            color: "#f87171",
            fontSize: 16,
          }}
        >
          {error}
        </div>
      </Layout>
    );
  }

  const chartData =
    view === "week"
      ? (data.weeklyRevenue || [])
      : (data.monthlyRevenue || []);
  const dataKey = view === "week" ? "day" : "month";
  const weeklyData = data.weeklyRevenue || [];
  const categoryData = data.categoryBreakdown || [];
  const topProductsData = data.topProducts || [];

  return (
    <Layout title="Analytics">
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div className="page-subtitle">
            Revenue and sales performance overview
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`btn btn-sm ${view === "week" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setView("week")}
          >
            7 Days
          </button>
          <button
            className={`btn btn-sm ${view === "month" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setView("month")}
          >
            6 Months
          </button>
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
            <XAxis
              dataKey={dataKey}
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#revGrad)"
              dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Orders Bar Chart — always shows weekly */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Daily Orders (Last 7 Days)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="orders"
                name="orders"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
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
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                paddingAngle={3}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
              />
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
              {topProductsData.map((p, i) => (
                <tr key={p.name}>
                  <td style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                    {i + 1}
                  </td>
                  <td className="font-semibold">{p.name}</td>
                  <td>{p.orders}</td>
                  <td
                    className="font-semibold"
                    style={{ color: "var(--accent-light)" }}
                  >
                    {fmt(p.revenue)}
                  </td>
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
