import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../api/ticketApi";

const CATEGORIES = ["ELECTRICAL", "PLUMBING", "IT_EQUIPMENT", "FURNITURE", "HVAC", "SECURITY", "CLEANING", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", location: "",
    category: "IT_EQUIPMENT", priority: "MEDIUM", contactDetails: "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) { setError("Maximum 3 files allowed"); return; }
    setFiles(selected);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      // Backend expects "ticket" part as JSON blob
      formData.append("ticket", new Blob([JSON.stringify(form)], { type: "application/json" }));
      files.forEach((f) => formData.append("files", f));
      await createTicket(formData);
      navigate("/tickets");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Report an Incident</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Title *</label>
        <input name="title" value={form.title} onChange={handleChange} required style={styles.input} placeholder="Brief description of the issue" />

        <label style={styles.label}>Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required style={{ ...styles.input, height: 100 }} placeholder="Detailed description..." />

        <label style={styles.label}>Location *</label>
        <input name="location" value={form.location} onChange={handleChange} required style={styles.input} placeholder="e.g. Lab 3, Block A" />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} style={styles.input}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Priority *</label>
            <select name="priority" value={form.priority} onChange={handleChange} style={styles.input}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <label style={styles.label}>Contact Details</label>
        <input name="contactDetails" value={form.contactDetails} onChange={handleChange} style={styles.input} placeholder="Phone or preferred contact" />

        <label style={styles.label}>Attachments (max 3 images)</label>
        <input type="file" accept="image/*" multiple onChange={handleFiles} style={styles.fileInput} />
        {files.length > 0 && <p style={styles.hint}>{files.length} file(s) selected</p>}

        <div style={styles.actions}>
          <button type="button" onClick={() => navigate("/tickets")} style={styles.cancelBtn}>Cancel</button>
          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 640, margin: "0 auto", padding: "2rem 1rem" },
  title: { fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" },
  form: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontWeight: 600, fontSize: "0.9rem", color: "#374151" },
  input: { width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "0.95rem", boxSizing: "border-box" },
  row: { display: "flex", gap: "1rem" },
  fileInput: { padding: "0.4rem 0" },
  hint: { color: "#6b7280", fontSize: "0.85rem", margin: 0 },
  error: { background: "#fee2e2", color: "#dc2626", padding: "0.75rem", borderRadius: 8, fontSize: "0.9rem" },
  actions: { display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "0.5rem" },
  cancelBtn: { padding: "0.6rem 1.2rem", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer" },
  submitBtn: { padding: "0.6rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
};