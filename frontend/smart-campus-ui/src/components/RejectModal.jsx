import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";

const RejectModal = ({ booking, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Please provide a rejection reason");
    setSubmitting(true);
    try {
      await axiosInstance.put(`/api/bookings/${booking.id}/reject`, { rejectionReason: reason });
      toast.success("Booking rejected.");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject booking");
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "white", borderRadius: "14px", width: "420px", maxWidth: "95vw", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", backgroundColor: "#fef2f2" },
    title: { fontSize: "1rem", fontWeight: "700", color: "#b91c1c", margin: 0 },
    closeBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" },
    body: { padding: "1.5rem" },
    info: { fontSize: "0.875rem", color: "#475569", marginBottom: "1.25rem", lineHeight: 1.6 },
    label: { display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#374151", marginBottom: "5px" },
    textarea: { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", color: "#0f172a", resize: "vertical", minHeight: "100px" },
    footer: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", backgroundColor: "#f8fafc" },
    cancelBtn: { padding: "9px 20px", border: "1.5px solid #e2e8f0", borderRadius: "9px", backgroundColor: "white", color: "#475569", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" },
    rejectBtn: { padding: "9px 20px", border: "none", borderRadius: "9px", backgroundColor: "#ef4444", color: "white", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <p style={s.title}>Reject Booking</p>
          <button style={s.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={s.body}>
            <p style={s.info}>
              You are rejecting the booking by <strong>{booking.userName}</strong> for{" "}
              <strong>{booking.resourceName}</strong> on{" "}
              <strong>{booking.bookingDate}</strong>.
            </p>
            <label style={s.label}>Reason for Rejection <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea
              style={s.textarea}
              placeholder="e.g. Resource unavailable due to maintenance..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.rejectBtn} disabled={submitting}>
              {submitting ? <><Loader2 size={16} /> Rejecting...</> : "Confirm Reject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
