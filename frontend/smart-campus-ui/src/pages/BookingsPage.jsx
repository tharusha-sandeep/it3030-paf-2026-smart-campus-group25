import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import NewBookingModal from "../components/NewBookingModal";
import toast from "react-hot-toast";
import {
  CalendarDays, Plus, Loader2, AlertCircle, RefreshCw,
  Clock, MapPin, Users, XCircle, CheckCircle, Clock3
} from "lucide-react";

const NAVY = "#1e3a5f";
const NAVY_DARK = "#122a47";

// ── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  PENDING:   { label: "Pending",   bg: "#fef9c3", color: "#854d0e", icon: Clock3 },
  APPROVED:  { label: "Approved",  bg: "#dcfce7", color: "#166534", icon: CheckCircle },
  REJECTED:  { label: "Rejected",  bg: "#fef2f2", color: "#991b1b", icon: XCircle },
  CANCELLED: { label: "Cancelled", bg: "#f1f5f9", color: "#64748b", icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || STATUS.PENDING;
  const Icon = cfg.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: cfg.bg, color: cfg.color }}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const BookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/bookings/my");
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axiosInstance.put(`/api/bookings/${id}/cancel`);
      toast.success("Booking cancelled.");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa", fontFamily: "'Inter', sans-serif" },
    main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
    topNav: { backgroundColor: "white", padding: "0 1.5rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "flex-end", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "1.75rem" },
    pageHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" },
    titleWrap: {},
    pageTitle: { fontSize: "1.625rem", fontWeight: "800", color: "#0f172a", margin: 0 },
    pageSub: { fontSize: "0.875rem", color: "#64748b", margin: "4px 0 0 0" },
    newBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`, color: "white", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 10px rgba(30,58,95,0.25)" },

    // Cards grid
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" },
    card: { backgroundColor: "white", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", overflow: "hidden" },
    cardTop: { padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid #f8fafc" },
    cardRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" },
    resourceName: { fontSize: "1rem", fontWeight: "700", color: "#0f172a" },
    meta: { display: "flex", flexDirection: "column", gap: "5px", padding: "1rem 1.25rem" },
    metaItem: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "#475569" },
    cardFooter: { padding: "0.75rem 1.25rem", backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "8px" },
    cancelBtn: { padding: "6px 14px", border: "1px solid #fecaca", borderRadius: "8px", backgroundColor: "white", color: "#dc2626", fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer" },
    rejectionBox: { margin: "0 1.25rem 1rem", padding: "8px 12px", backgroundColor: "#fef2f2", borderRadius: "8px", fontSize: "0.8rem", color: "#991b1b", borderLeft: "3px solid #ef4444" },

    // States
    stateBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", textAlign: "center", color: "#64748b" },
  };

  const renderContent = () => {
    if (loading) return (
      <div style={s.stateBox}>
        <Loader2 size={36} color={NAVY} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "1rem" }}>Loading your bookings...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
    if (error) return (
      <div style={s.stateBox}>
        <AlertCircle size={40} color="#ef4444" />
        <p style={{ marginTop: "1rem" }}>{error}</p>
        <button onClick={fetchBookings} style={{ ...s.newBtn, marginTop: "1rem" }}><RefreshCw size={16} /> Retry</button>
      </div>
    );
    if (bookings.length === 0) return (
      <div style={s.stateBox}>
        <CalendarDays size={48} color="#94a3b8" />
        <p style={{ marginTop: "1rem", fontWeight: "600" }}>No bookings yet</p>
        <p style={{ fontSize: "0.875rem" }}>Click "New Booking" to reserve a campus resource.</p>
      </div>
    );

    return (
      <div style={s.grid}>
        {bookings.map(b => (
          <div key={b.id} style={s.card}>
            <div style={s.cardTop}>
              <div style={s.cardRow}>
                <span style={s.resourceName}>{b.resourceName}</span>
                <StatusBadge status={b.status} />
              </div>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#64748b" }}>#{b.id} · {b.purpose}</p>
            </div>

            <div style={s.meta}>
              <span style={s.metaItem}><CalendarDays size={14} /> {b.bookingDate}</span>
              <span style={s.metaItem}><Clock size={14} /> {b.startTime} – {b.endTime}</span>
              {b.resourceLocation && <span style={s.metaItem}><MapPin size={14} /> {b.resourceLocation}</span>}
              <span style={s.metaItem}><Users size={14} /> {b.attendees} attendee{b.attendees !== 1 ? "s" : ""}</span>
            </div>

            {b.status === "REJECTED" && b.rejectionReason && (
              <div style={s.rejectionBox}>Rejected: {b.rejectionReason}</div>
            )}

            {(b.status === "PENDING" || b.status === "APPROVED") && (
              <div style={s.cardFooter}>
                <button style={s.cancelBtn} onClick={() => handleCancel(b.id)}>Cancel Booking</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="bookings" />
      <main style={s.main}>
        <header style={s.topNav}>
          <ProfileDropdown />
        </header>
        <div style={s.content}>
          <div style={s.pageHeader}>
            <div style={s.titleWrap}>
              <h1 style={s.pageTitle}>My Bookings</h1>
              <p style={s.pageSub}>Track and manage your resource reservations</p>
            </div>
            <button style={s.newBtn} onClick={() => setShowNewModal(true)}>
              <Plus size={18} /> New Booking
            </button>
          </div>
          {renderContent()}
        </div>
      </main>

      {showNewModal && (
        <NewBookingModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => { setShowNewModal(false); fetchBookings(); }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
