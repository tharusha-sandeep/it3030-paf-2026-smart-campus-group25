import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";

const NAVY = "#1e3a5f";

const NewBookingModal = ({ onClose, onSuccess }) => {
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    resourceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: 1,
  });

  useEffect(() => {
    axiosInstance.get("/api/resources")
      .then(res => setResources(res.data.filter(r => r.status === "ACTIVE")))
      .catch(() => toast.error("Failed to load resources"))
      .finally(() => setLoadingResources(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resourceId) return toast.error("Please select a resource");
    if (form.startTime >= form.endTime) return toast.error("End time must be after start time");

    setSubmitting(true);
    try {
      await axiosInstance.post("/api/bookings", {
        resourceId: Number(form.resourceId),
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        attendees: Number(form.attendees),
      });
      toast.success("Booking request submitted!");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "white", borderRadius: "16px", width: "500px", maxWidth: "95vw", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", background: `linear-gradient(135deg, ${NAVY} 0%, #122a47 100%)` },
    title: { fontSize: "1.0625rem", fontWeight: "700", color: "white", margin: 0 },
    closeBtn: { background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px" },
    body: { padding: "1.5rem" },
    formGroup: { marginBottom: "1.125rem" },
    label: { display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#374151", marginBottom: "5px" },
    input: { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", color: "#0f172a" },
    select: { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", color: "#0f172a", backgroundColor: "white" },
    textarea: { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", color: "#0f172a", resize: "vertical", minHeight: "80px" },
    timeRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
    footer: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", backgroundColor: "#f8fafc" },
    cancelBtn: { padding: "9px 20px", border: "1.5px solid #e2e8f0", borderRadius: "9px", backgroundColor: "white", color: "#475569", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" },
    submitBtn: { padding: "9px 20px", border: "none", borderRadius: "9px", backgroundColor: NAVY, color: "white", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <p style={s.title}>New Booking Request</p>
          <button style={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.body}>
            <div style={s.formGroup}>
              <label style={s.label}>Resource</label>
              {loadingResources ? (
                <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Loading resources...</p>
              ) : (
                <select name="resourceId" value={form.resourceId} onChange={handleChange} style={s.select} required>
                  <option value="">— Select a resource —</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.location || "No location"})</option>
                  ))}
                </select>
              )}
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Booking Date</label>
              <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange}
                style={s.input} required min={new Date().toISOString().split("T")[0]} />
            </div>

            <div style={{ ...s.formGroup, ...s.timeRow }}>
              <div>
                <label style={s.label}>Start Time</label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} style={s.input} required />
              </div>
              <div>
                <label style={s.label}>End Time</label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} style={s.input} required />
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Purpose</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange}
                style={s.textarea} placeholder="Describe the purpose of this booking..." required />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Number of Attendees</label>
              <input type="number" name="attendees" value={form.attendees} onChange={handleChange}
                style={s.input} min="1" required />
            </div>
          </div>

          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Discard</button>
            <button type="submit" style={s.submitBtn} disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookingModal;
