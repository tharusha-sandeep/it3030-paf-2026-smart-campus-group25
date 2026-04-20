import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import RejectModal from "../components/RejectModal";
import toast from "react-hot-toast";
import {
  CalendarDays, Loader2, AlertCircle, RefreshCw,
  CheckCircle, XCircle, Clock3, Filter, Clock, MapPin, Users
} from "lucide-react";

const NAVY = "#1e3a5f";
const NAVY_DARK = "#122a47";

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   bg: "#fef9c3", color: "#854d0e", icon: Clock3 },
  APPROVED:  { label: "Approved",  bg: "#dcfce7", color: "#166534", icon: CheckCircle },
  REJECTED:  { label: "Rejected",  bg: "#fef2f2", color: "#991b1b", icon: XCircle },
  CANCELLED: { label: "Cancelled", bg: "#f1f5f9", color: "#64748b", icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: cfg.bg, color: cfg.color }}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterResource, setFilterResource] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.bookingDate = filterDate;
      if (filterResource) params.resourceId = filterResource;
      const res = await axiosInstance.get("/api/bookings", { params });
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axiosInstance.get("/api/resources").then(r => setResources(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchBookings(); }, [filterStatus, filterDate, filterResource]);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/api/bookings/${id}/approve`);
      toast.success("Booking approved!");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve.");
    }
  };

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa", fontFamily: "'Inter', sans-serif" },
    main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
    topNav: { backgroundColor: "white", padding: "0 1.5rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "flex-end", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "1.75rem" },
    pageHeader: { marginBottom: "1.5rem" },
    pageTitle: { fontSize: "1.625rem", fontWeight: "800", color: "#0f172a", margin: 0 },
    pageSub: { fontSize: "0.875rem", color: "#64748b", margin: "4px 0 0 0" },

    // Filters
    filterBar: { display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center", backgroundColor: "white", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" },
    filterLabel: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", fontWeight: "600", color: "#475569" },
    select: { padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", color: "#0f172a", outline: "none", backgroundColor: "white", minWidth: "160px" },
    dateInput: { padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", color: "#0f172a", outline: "none" },
    clearBtn: { padding: "8px 16px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "0.8125rem", fontWeight: "600", color: "#64748b", backgroundColor: "white", cursor: "pointer" },

    // Table
    tableWrap: { backgroundColor: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "0.875rem 1.25rem", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #e2e8f0", textAlign: "left" },
    td: { padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", color: "#374151", fontSize: "0.875rem", verticalAlign: "middle" },
    strongText: { fontWeight: "600", color: "#0f172a", display: "block" },
    subText: { color: "#64748b", fontSize: "0.8rem" },
    approveBtn: { padding: "6px 14px", border: "none", borderRadius: "8px", backgroundColor: "#dcfce7", color: "#166534", fontSize: "0.8125rem", fontWeight: "700", cursor: "pointer", marginRight: "6px" },
    rejectBtn: { padding: "6px 14px", border: "none", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "0.8125rem", fontWeight: "700", cursor: "pointer" },
    rejectionNote: { fontSize: "0.75rem", color: "#991b1b", backgroundColor: "#fef2f2", padding: "3px 8px", borderRadius: "6px", display: "inline-block", marginTop: "4px" },

    stateBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", textAlign: "center", color: "#64748b" },
  };

  const renderTable = () => {
    if (loading) return (
      <div style={s.stateBox}>
        <Loader2 size={36} color={NAVY} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "1rem" }}>Loading bookings...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
    if (error) return (
      <div style={s.stateBox}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ marginTop: "1rem" }}>{error}</p>
        <button onClick={fetchBookings} style={{ padding: "9px 20px", border: "none", borderRadius: "9px", background: NAVY, color: "white", fontWeight: "600", cursor: "pointer", marginTop: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
    if (bookings.length === 0) return (
      <div style={s.stateBox}>
        <CalendarDays size={48} color="#94a3b8" />
        <p style={{ marginTop: "1rem", fontWeight: "600" }}>No bookings found</p>
        <p style={{ fontSize: "0.875rem" }}>Try adjusting the filters above.</p>
      </div>
    );

    return (
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>#</th>
            <th style={s.th}>User</th>
            <th style={s.th}>Resource</th>
            <th style={s.th}>Schedule</th>
            <th style={s.th}>Attendees</th>
            <th style={s.th}>Status</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} style={{ transition: "background 0.15s" }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
              onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
              <td style={s.td}><span style={{ color: "#94a3b8", fontWeight: "600" }}>#{b.id}</span></td>
              <td style={s.td}>
                <span style={s.strongText}>{b.userName}</span>
              </td>
              <td style={s.td}>
                <span style={s.strongText}>{b.resourceName}</span>
                {b.resourceLocation && <span style={s.subText}><MapPin size={11} style={{ display: "inline", marginRight: 3 }} />{b.resourceLocation}</span>}
              </td>
              <td style={s.td}>
                <span style={s.strongText}><CalendarDays size={12} style={{ display: "inline", marginRight: 4 }} />{b.bookingDate}</span>
                <span style={s.subText}><Clock size={11} style={{ display: "inline", marginRight: 3 }} />{b.startTime} – {b.endTime}</span>
              </td>
              <td style={s.td}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Users size={14} />{b.attendees}</span>
              </td>
              <td style={s.td}>
                <StatusBadge status={b.status} />
                {b.status === "REJECTED" && b.rejectionReason && (
                  <span style={s.rejectionNote}>{b.rejectionReason}</span>
                )}
              </td>
              <td style={s.td}>
                {b.status === "PENDING" && (
                  <>
                    <button style={s.approveBtn} onClick={() => handleApprove(b.id)}>Approve</button>
                    <button style={s.rejectBtn} onClick={() => setRejectTarget(b)}>Reject</button>
                  </>
                )}
                {b.status !== "PENDING" && <span style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="admin-bookings" />
      <main style={s.main}>
        <header style={s.topNav}><ProfileDropdown /></header>
        <div style={s.content}>
          <div style={s.pageHeader}>
            <h1 style={s.pageTitle}>Manage Bookings</h1>
            <p style={s.pageSub}>Review, approve, and reject campus resource booking requests</p>
          </div>

          {/* Filters */}
          <div style={s.filterBar}>
            <span style={s.filterLabel}><Filter size={14} /> Filters:</span>
            <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input type="date" style={s.dateInput} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <select style={s.select} value={filterResource} onChange={e => setFilterResource(e.target.value)}>
              <option value="">All Resources</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {(filterStatus || filterDate || filterResource) && (
              <button style={s.clearBtn} onClick={() => { setFilterStatus(""); setFilterDate(""); setFilterResource(""); }}>
                Clear Filters
              </button>
            )}
          </div>

          {/* Stats summary */}
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginBottom: "1rem" }}>
            {loading ? "..." : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""} found`}
          </p>

          <div style={s.tableWrap}>{renderTable()}</div>
        </div>
      </main>

      {rejectTarget && (
        <RejectModal
          booking={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={() => { setRejectTarget(null); fetchBookings(); }}
        />
      )}
    </div>
  );
};

export default AdminBookingsPage;
