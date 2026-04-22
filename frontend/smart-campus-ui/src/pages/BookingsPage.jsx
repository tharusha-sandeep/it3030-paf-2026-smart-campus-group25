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
  Clock, MapPin, Users, XCircle, CheckCircle2, Clock3, Filter, Search
} from "lucide-react";

/**
 * Redesigned BookingsPage
 * - Stripe-style filter bar
 * - Clean white cards with sky blue accents
 * - Defined status badges
 */
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
      setError("Failed to load reservations data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axiosInstance.put(`/api/bookings/${id}/cancel`);
      toast.success("Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed.");
    }
  };

  const styles = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: { height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "32px", maxWidth: "1200px", margin: "0 auto", width: "100%" },
    pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
    title: { fontSize: "24px", fontWeight: "700", color: "#0F172A" },
    sub: { fontSize: "14px", color: "#64748B", marginTop: "4px" },

    filterBar: {
      backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px",
      display: "flex", gap: "16px", marginBottom: "32px", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" },
    card: {
      backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", display: "flex", flexDirection: "column"
    },
    cardBody: { padding: "20px" },
    metaRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748B", marginBottom: "8px" },
    cardFooter: { 
      padding: "16px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFAFA",
      display: "flex", justifyContent: "flex-end", gap: "10px"
    },
    emptyState: { padding: "80px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #E2E8F0" }
  };

  const getStatusBadge = (status) => {
    const maps = {
      APPROVED: "badge-approved",
      PENDING: "badge-pending",
      REJECTED: "badge-rejected",
      CANCELLED: "badge-muted"
    };
    return `badge ${maps[status] || "badge-pending"}`;
  };

  return (
    <div style={styles.root}>
      <Sidebar activeId="bookings" />
      <main style={styles.main}>
        <header style={styles.header}>
          <ProfileDropdown />
        </header>
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <h1 style={styles.title}>Your Bookings</h1>
              <p style={styles.sub}>Central hub for all your confirmed and pending reservations.</p>
            </div>
            <button className="btn-primary" onClick={() => setShowNewModal(true)}>
              <Plus size={18} /> New Request
            </button>
          </div>

          <div style={styles.filterBar}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#F1F5F9", padding: "10px 16px", borderRadius: "8px", flex: 1 }}>
              <Search size={18} color="#94A3B8" />
              <input style={{ border: "none", background: "none", outline: "none", fontSize: "14px", width: "100%" }} placeholder="Filter by resource or purpose..." />
            </div>
            <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}><Filter size={14} /> Filter Status</button>
          </div>

          {loading ? (
             <div style={{ textAlign: "center", padding: "100px" }}><Loader2 size={40} className="animate-spin" color="#0EA5E9" /></div>
          ) : error ? (
            <div style={styles.emptyState}>
               <AlertCircle size={40} color="#EF4444" style={{ marginBottom: "16px" }} />
               <p style={{ fontWeight: "600", color: "#0F172A" }}>{error}</p>
               <button className="btn-secondary" onClick={fetchBookings} style={{ marginTop: "16px" }}>Retry Connection</button>
            </div>
          ) : bookings.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>📅</div>
              <p style={{ fontWeight: "600", color: "#0F172A", marginBottom: "4px" }}>No reservations found</p>
              <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "20px" }}>You haven't made any resource requests yet.</p>
              <button className="btn-primary" style={{ margin: "0 auto" }} onClick={() => setShowNewModal(true)}>Start Booking</button>
            </div>
          ) : (
            <div style={styles.grid}>
              {bookings.map(b => (
                <div key={b.id} style={styles.card}>
                  <div style={styles.cardBody}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#94A3B8" }}>#{b.id}</span>
                      <span className={getStatusBadge(b.status)}>{b.status.toLowerCase()}</span>
                    </div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", marginBottom: "12px" }}>{b.resourceName}</h3>
                    <div style={{ marginBottom: "16px", fontSize: "13px", color: "#475569", fontStyle: "italic", lineHeight: 1.4 }}>
                      "{b.purpose?.length > 80 ? b.purpose.substring(0, 77) + "..." : b.purpose}"
                    </div>
                    <div>
                      <div style={styles.metaRow}><CalendarDays size={14} /> {new Date(b.bookingDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</div>
                      <div style={styles.metaRow}><Clock size={14} /> {b.startTime} - {b.endTime}</div>
                      {b.resourceLocation && <div style={styles.metaRow}><MapPin size={14} /> {b.resourceLocation}</div>}
                      <div style={styles.metaRow}><Users size={14} /> {b.attendees} pax</div>
                    </div>
                  </div>

                  {b.status === "REJECTED" && b.rejectionReason && (
                    <div style={{ margin: "0 20px 20px", padding: "12px", backgroundColor: "#FEF2F2", borderRadius: "8px", borderLeft: "4px solid #EF4444", fontSize: "12px", color: "#991B1B" }}>
                       <span style={{ fontWeight: "700" }}>Admin Note:</span> {b.rejectionReason}
                    </div>
                  )}

                  {(b.status === "PENDING" || b.status === "APPROVED") && (
                    <div style={styles.cardFooter}>
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", borderColor: "#FEE2E2", color: "#EF4444" }} onClick={() => handleCancel(b.id)}>
                        Cancel Reservation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
