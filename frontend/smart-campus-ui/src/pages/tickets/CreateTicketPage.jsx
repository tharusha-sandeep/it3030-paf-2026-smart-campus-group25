import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../api/ticketApi";
import Sidebar from "../../components/Sidebar";
import ProfileDropdown from "../../components/ProfileDropdown";
import {
  ArrowLeft, Loader2, Upload, X,
  FileText, MapPin, Tag, AlertTriangle, Phone
} from "lucide-react";

const CATEGORIES = ["ELECTRICAL", "PLUMBING", "IT_EQUIPMENT", "FURNITURE", "HVAC", "SECURITY", "CLEANING", "OTHER"];
const PRIORITIES = [
  { value: "LOW",      label: "Low",      color: "#64748B" },
  { value: "MEDIUM",   label: "Medium",   color: "#CA8A04" },
  { value: "HIGH",     label: "High",     color: "#EA580C" },
  { value: "CRITICAL", label: "Critical", color: "#DC2626" },
];

const CreateTicketPage = () => {
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
    if (selected.length + files.length > 3) { setError("Maximum 3 attachments allowed"); return; }
    setFiles([...files, ...selected]);
    setError("");
  };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("ticket", new Blob([JSON.stringify(form)], { type: "application/json" }));
      files.forEach((f) => formData.append("files", f));
      await createTicket(formData);
      navigate("/tickets");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: {
      height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0",
      padding: "0 32px", display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
    },
    content: { padding: "32px", maxWidth: "760px", margin: "0 auto", width: "100%" },
    card: { backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" },
    cardHeader: { padding: "24px", borderBottom: "1px solid #F1F5F9" },
    cardBody: { padding: "24px", display: "flex", flexDirection: "column", gap: "20px" },
    cardFooter: { padding: "16px 24px", borderTop: "1px solid #F1F5F9", backgroundColor: "#F8FAFC", display: "flex", justifyContent: "flex-end", gap: "12px" },
    label: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", color: "#0F172A", outlineColor: "#0EA5E9", boxSizing: "border-box" },
    textarea: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", color: "#0F172A", outlineColor: "#0EA5E9", minHeight: "110px", resize: "vertical", boxSizing: "border-box" },
    select: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", color: "#0F172A", outlineColor: "#0EA5E9", boxSizing: "border-box", cursor: "pointer" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    errorBox: { backgroundColor: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: "8px", padding: "12px 16px", color: "#DC2626", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" },
    uploadZone: {
      border: "2px dashed #E2E8F0", borderRadius: "8px", padding: "24px",
      textAlign: "center", cursor: "pointer", backgroundColor: "#FAFAFA",
      transition: "border-color 0.2s, background-color 0.2s",
    },
    fileTag: {
      display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
      backgroundColor: "#F1F5F9", borderRadius: "8px", fontSize: "13px", color: "#374151",
    },
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="tickets" />
      <main style={s.main}>
        <header style={s.header}>
          <button
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
            onClick={() => navigate("/tickets")}
          >
            <ArrowLeft size={16} /> Back to Tickets
          </button>
          <ProfileDropdown />
        </header>

        <div style={s.content}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>Report an Incident</h1>
            <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>Describe the issue and we'll get someone on it.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <p style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", margin: 0 }}>Incident Details</p>
              </div>

              <div style={s.cardBody}>
                {error && (
                  <div style={s.errorBox}>
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}

                <div>
                  <label style={s.label}><FileText size={14} /> Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} required style={s.input} placeholder="Brief description of the issue" />
                </div>

                <div>
                  <label style={s.label}><FileText size={14} /> Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required style={s.textarea} placeholder="Provide as much detail as possible..." />
                </div>

                <div>
                  <label style={s.label}><MapPin size={14} /> Location *</label>
                  <input name="location" value={form.location} onChange={handleChange} required style={s.input} placeholder="e.g. Lab 3, Block A, 2nd Floor" />
                </div>

                <div style={s.row}>
                  <div>
                    <label style={s.label}><Tag size={14} /> Category *</label>
                    <select name="category" value={form.category} onChange={handleChange} style={s.select}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}><AlertTriangle size={14} /> Priority *</label>
                    <select name="priority" value={form.priority} onChange={handleChange} style={s.select}>
                      {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={s.label}><Phone size={14} /> Contact Details</label>
                  <input name="contactDetails" value={form.contactDetails} onChange={handleChange} style={s.input} placeholder="Phone or email for follow-up" />
                </div>

                {/* File Upload */}
                <div>
                  <label style={s.label}><Upload size={14} /> Attachments (max 3 images)</label>
                  <label
                    style={s.uploadZone}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = "#0EA5E9"; e.currentTarget.style.backgroundColor = "#F0F9FF"; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.backgroundColor = "#FAFAFA"; }}
                  >
                    <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
                    <Upload size={24} color="#94A3B8" style={{ marginBottom: "8px" }} />
                    <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Click to upload or drag and drop</p>
                    <p style={{ fontSize: "12px", color: "#94A3B8", margin: "4px 0 0" }}>PNG, JPG up to 5MB each</p>
                  </label>

                  {files.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                      {files.map((f, i) => (
                        <div key={i} style={s.fileTag}>
                          <FileText size={14} color="#0EA5E9" />
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                          <button type="button" onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 0, display: "flex" }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={s.cardFooter}>
                <button type="button" className="btn-secondary" onClick={() => navigate("/tickets")}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Ticket"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateTicketPage;
