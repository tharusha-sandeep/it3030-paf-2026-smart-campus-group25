import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import NewBookingModal from "../components/NewBookingModal";
import toast from "react-hot-toast";
import {
  CalendarDays, Plus, Loader2, AlertCircle,
  Clock, MapPin, Users, Filter, Search,
  Pencil, Trash2, X, FileText
} from "lucide-react";

// ── Inline Edit Modal ──────────────────────────────────────────────────────────
const EditBookingModal = ({ booking, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    bookingDate: booking.bookingDate || "",
    startTime:   booking.startTime   || "",
    endTime:     booking.endTime     || "",
    purpose:     booking.purpose     || "",
    attendees:   booking.attendees   || 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.startTime >= form.endTime) return toast.error("End time must be after start time");
    setSubmitting(true);
    try {
      await axiosInstance.put(`/api/bookings/${booking.id}`, {
        resourceId: booking.resourceId,
        bookingDate: form.bookingDate,
        startTime:   form.startTime,
        endTime:     form.endTime,
        purpose:     form.purpose,
        attendees:   Number(form.attendees),
      });
      toast.success("Booking updated successfully");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modal:   { backgroundColor: "white", borderRadius: "16px", width: "520px", maxWidth: "95vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden" },
    header:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F1F5F9" },
    body:    { padding: "24px" },
    label:   { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
    input:   { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outlineColor: "#0EA5E9", color: "#0F172A", boxSizing: "border-box" },
    textarea:{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outlineColor: "#0EA5E9", minHeight: "90px", resize: "none", boxSizing: "border-box" },
    footer:  { display: "flex", gap: "12px", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" },
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: 0 }}>Edit Reservation</h2>
          <button style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.body}>
            {/* Read-only resource name */}
            <div style={{ marginBottom: "20px", padding: "12px 14px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Resource (read-only)</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A" }}>{booking.resourceName}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={s.label}><CalendarDays size={14} /> Date</label>
                <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} style={s.input} required min={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label style={s.label}><Users size={14} /> Attendees</label>
                <input type="number" name="attendees" value={form.attendees} onChange={handleChange} style={s.input} min="1" required />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={s.label}><Clock size={14} /> Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} style={s.input} required />
              </div>
              <div>
                <label style={s.label}><Clock size={14} /> End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} style={s.input} required />
              </div>
            </div>

            <div>
              <label style={s.label}><FileText size={14} /> Purpose</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} style={s.textarea} placeholder="Describe the purpose..." required />
            </div>
          </div>

          <div style={s.footer}>
            <button type="button" className="btn-secondary" onClick={onClose}>Discard</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const BookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showNewModal, setShowNewModal]   = useState(false);
  const [editTarget, setEditTarget]       = useState(null);   // booking object to edit

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

  // Cancel (PENDING or APPROVED → CANCELLED)
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

  // Delete (hard-delete — PENDING or CANCELLED only)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/bookings/${id}`);
      toast.success("Booking deleted.");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
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
    cardBody: { padding: "20px", flex: 1 },
    metaRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748B", marginBottom: "8px" },
    cardFooter: {
      padding: "12px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFAFA",
      display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px"
    },
    emptyState: { padding: "80px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #E2E8F0" },

    // icon buttons
    iconBtn: (danger) => ({
      width: "32px", height: "32px",
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: "6px", cursor: "pointer",
      border: danger ? "1px solid #FEE2E2" : "1px solid #E2E8F0",
      backgroundColor: "transparent",
      color: danger ? "#EF4444" : "#64748B",
      transition: "all 0.15s",
    }),
  };

  const getStatusBadge = (status) => {
    const maps = {
      APPROVED:  "badge-approved",
      PENDING:   "badge-pending",
      REJECTED:  "badge-rejected",
      CANCELLED: "badge-muted",
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
            <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={14} /> Filter Status
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "100px" }}>
              <Loader2 size={40} className="animate-spin" color="#0EA5E9" />
            </div>
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
                    {/* Card header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#94A3B8" }}>#{b.id}</span>
                      <span className={getStatusBadge(b.status)}>{b.status.toLowerCase()}</span>
                    </div>

                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F172A", marginBottom: "12px" }}>{b.resourceName}</h3>

                    <div style={{ marginBottom: "16px", fontSize: "13px", color: "#475569", fontStyle: "italic", lineHeight: 1.4 }}>
                      "{b.purpose?.length > 80 ? b.purpose.substring(0, 77) + "..." : b.purpose}"
                    </div>

                    <div>
                      <div style={styles.metaRow}><CalendarDays size={14} /> {new Date(b.bookingDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</div>
                      <div style={styles.metaRow}><Clock size={14} /> {b.startTime} - {b.endTime}</div>
                      {b.resourceLocation && <div style={styles.metaRow}><MapPin size={14} /> {b.resourceLocation}</div>}
                      <div style={styles.metaRow}><Users size={14} /> {b.attendees} pax</div>
                    </div>
                  </div>

                  {/* Rejection note */}
                  {b.status === "REJECTED" && b.rejectionReason && (
                    <div style={{ margin: "0 20px 16px", padding: "12px", backgroundColor: "#FEF2F2", borderRadius: "8px", borderLeft: "4px solid #EF4444", fontSize: "12px", color: "#991B1B" }}>
                      <span style={{ fontWeight: "700" }}>Admin Note:</span> {b.rejectionReason}
                    </div>
                  )}

                  {/* ── Card Footer: action buttons ── */}
                  {(() => {
                    const showCancel = b.status === "PENDING" || b.status === "APPROVED";
                    const showEdit   = b.status === "PENDING";
                    const showDelete = b.status === "PENDING" || b.status === "CANCELLED";

                    if (!showCancel && !showEdit && !showDelete) return null;

                    return (
                      <div style={styles.cardFooter}>
                        {/* Left side: Edit + Delete icons */}
                        <div style={{ display: "flex", gap: "6px", marginRight: "auto" }}>
                          {showEdit && (
                            <button
                              style={styles.iconBtn(false)}
                              title="Edit booking"
                              onClick={() => setEditTarget(b)}
                              onMouseOver={e => { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#0F172A"; }}
                              onMouseOut={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748B"; }}
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {showDelete && (
                            <button
                              style={styles.iconBtn(true)}
                              title="Delete booking"
                              onClick={() => handleDelete(b.id)}
                              onMouseOver={e => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
                              onMouseOut={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Right side: Cancel text button */}
                        {showCancel && (
                          <button
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "12px", borderColor: "#FEE2E2", color: "#EF4444" }}
                            onClick={() => handleCancel(b.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Booking Modal */}
      {showNewModal && (
        <NewBookingModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => { setShowNewModal(false); fetchBookings(); }}
        />
      )}

      {/* Edit Booking Modal */}
      {editTarget && (
        <EditBookingModal
          booking={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); fetchBookings(); }}
        />
      )}
    </div>
  );
};

export default BookingsPage;
