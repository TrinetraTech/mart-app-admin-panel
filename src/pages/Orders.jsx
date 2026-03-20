import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { Search, Eye, X } from "lucide-react";
import { DataTable } from "mantine-datatable";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${(status || "").toLowerCase()}`}>
    {status || "—"}
  </span>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);

  // Server-side pagination & sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsFetching(true);
      try {
        const query = new URLSearchParams({
          page,
          limit: pageSize,
          sortBy: sortStatus.columnAccessor,
          sortOrder: sortStatus.direction,
        });
        if (search) query.append("search", search);
        if (statusFilter) query.append("status", statusFilter);

        const r = await api.get(`/orders?${query.toString()}`);
        setOrders(r.data.orders || []);
        setTotalRecords(r.data.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOrders();
  }, [page, pageSize, sortStatus, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
    } catch {}
    setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
    if (detailOrder?._id === id) setDetailOrder((d) => ({ ...d, status }));
  };

  return (
    <Layout title="Orders">
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">{totalRecords} orders total</div>
        </div>
      </div>

      <div className="filters-row">
        <div
          style={{ display: "flex", gap: 12, flex: 1, alignItems: "center" }}
        >
          <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
            <Search className="search-icon" size={18} />
            <input
              className="search-input"
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-muted">{totalRecords} results</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <DataTable
          minHeight={300}
          idAccessor="_id"
          fetching={isFetching}
          records={orders}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={[10, 20, 50, 100]}
          onRecordsPerPageChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          sortStatus={sortStatus}
          onSortStatusChange={(status) => {
            setSortStatus(status);
            setPage(1);
          }}
          columns={[
            {
              accessor: "_id",
              title: "Order ID",
              sortable: true,
              render: (o) => {
                try {
                  return (
                    <span
                      style={{
                        fontFamily: "monospace",
                        color: "var(--accent-light)",
                        fontSize: 12,
                      }}
                    >
                      #{String(o._id).slice(-6).toUpperCase()}
                    </span>
                  );
                } catch {
                  return <span>—</span>;
                }
              },
            },
            {
              accessor: "customerName",
              title: "Customer",
              sortable: true,
              render: (o) => {
                try {
                  return (
                    <div>
                      <div className="font-semibold" style={{ fontSize: 13 }}>
                        {o.customerName || "Unknown"}
                      </div>
                      <div className="text-xs text-muted">
                        {o.customerEmail || ""}
                      </div>
                    </div>
                  );
                } catch {
                  return <span>—</span>;
                }
              },
            },
            {
              accessor: "totalAmount",
              title: "Amount",
              sortable: true,
              render: (o) => {
                try {
                  return (
                    <span className="font-semibold">{fmt(o.totalAmount)}</span>
                  );
                } catch {
                  return <span>—</span>;
                }
              },
            },
            {
              accessor: "paymentMethod",
              title: "Payment",
              sortable: true,
              render: (o) => {
                try {
                  return (
                    <span className="text-sm text-muted">
                      {o.paymentMethod || "—"}
                    </span>
                  );
                } catch {
                  return <span>—</span>;
                }
              },
            },
            {
              accessor: "status",
              title: "Status",
              sortable: true,
              render: (o) => {
                try {
                  return <StatusBadge status={o.status || "Pending"} />;
                } catch {
                  return <span>—</span>;
                }
              },
            },
            {
              accessor: "createdAt",
              title: "Date",
              sortable: true,
              render: (o) => {
                try {
                  return (
                    <span className="text-sm text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  );
                } catch {
                  return <span>—</span>;
                }
              },
            },
            {
              accessor: "actions",
              title: "Actions",
              render: (o) => {
                try {
                  return (
                    <button
                      className="btn btn-icon btn-ghost btn-sm"
                      onClick={() => setDetailOrder(o)}
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                  );
                } catch {
                  return <span>—</span>;
                }
              },
            },
          ]}
        />
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                Order #{String(detailOrder._id).slice(-6).toUpperCase()}
              </span>
              <button
                className="btn btn-icon btn-ghost btn-sm"
                onClick={() => setDetailOrder(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <StatusBadge status={detailOrder.status} />
                <span className="text-sm text-muted">
                  {detailOrder.paymentMethod}
                </span>
              </div>
              <div>
                <div className="form-label">Customer</div>
                <div style={{ marginTop: 4 }}>
                  <strong>{detailOrder.customerName}</strong> ·{" "}
                  {detailOrder.customerEmail}
                </div>
                <div className="text-sm text-muted">{detailOrder.phone}</div>
              </div>
              <div>
                <div className="form-label">Delivery Address</div>
                <div className="text-sm" style={{ marginTop: 4 }}>
                  {detailOrder.address}
                </div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>
                  Items
                </div>
                {detailOrder.items?.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span className="text-sm">
                      {item.name} × {item.qty}
                    </span>
                    <span className="text-sm font-semibold">
                      {fmt(item.price * item.qty)}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0 0",
                  }}
                >
                  <span className="font-bold">Total</span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--accent-light)", fontSize: 16 }}
                  >
                    {fmt(detailOrder.totalAmount)}
                  </span>
                </div>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>
                  Update Status
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`btn btn-sm ${detailOrder.status === s ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => updateStatus(detailOrder._id, s)}
                    >
                      {s}
                    </button>
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
