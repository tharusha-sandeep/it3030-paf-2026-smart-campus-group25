import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { X, Loader2, Calendar, Clock, Users, FileText } from "lucide-react";

/**
 * Redesigned NewBookingModal
 * - Pro-style clean layout
 * - Sky blue accents
 * - Modern inputs and typography
 */
const NewBookingModal = ({ onClose, onSuccess, preSelectedResourceId }) => {
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    resourceId: preSelectedResourceId || "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: 1,
  });

  useEffect(() => {
    axiosInstance.get("/api/resources")
      .then(res => setResources(res.data.filter(r => r.status === "ACTIVE")))
      .catch(() => toast.error("Resource fetch failed"))
      .finally(() => setLoadingResources(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resourceId) return toast.error("Asset selection required");
    if (form.startTime >= form.endTime) return toast.error("Invalid timeframe selected");

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
      toast.success("Reservation request queued");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Internal server error");
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "white", borderRadius: "16px", width: "520px", maxWidth: "95vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden", animation: "modalSlideUp 0.3s ease-out" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F1F5F9" },
    title: { fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: 0 },
    
    body: { padding: "24px" },
    label: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outlineColor: "#0EA5E9", color: "#0F172A", transition: "border 0.2s" },
    textarea: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outlineColor: "#0EA5E9", minHeight: "100px", resize: "none" },
    
    footer: { display: "flex", gap: "12px", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" },
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>New Reservation</h2>
          <button style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }} onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.body}>
            <div style={{ marginBottom: "20px" }}>
              <label style={styles.label}><Calendar size={14} /> Resource Selection</label>
              {loadingResources ? (
                <div style={{ padding: "10px", color: "#94A3B8" }}><Loader2 className="animate-spin" size={16} /></div>
              ) : (
                <select name="resourceId" value={form.resourceId} onChange={handleChange} style={styles.input} required>
                  <option value="">— Choose an asset —</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} @ {r.location || "TBD"}</option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={styles.label}><Calendar size={14} /> Date</label>
                  <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} style={styles.input} required min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <label style={styles.label}><Users size={14} /> Attendees</label>
                  <input type="number" name="attendees" value={form.attendees} onChange={handleChange} style={styles.input} min="1" required />
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={styles.label}><Clock size={14} /> Start Time</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} style={styles.input} required />
                </div>
                <div>
                  <label style={styles.label}><Clock size={14} /> End Time</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} style={styles.input} required />
                </div>
            </div>

            <div>
              <label style={styles.label}><FileText size={14} /> Purpose</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange} style={styles.textarea} placeholder="Summary of intended use..." required />
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" className="btn-secondary" onClick={onClose}>Discard</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : "Commit Schedule"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NewBookingModal;
