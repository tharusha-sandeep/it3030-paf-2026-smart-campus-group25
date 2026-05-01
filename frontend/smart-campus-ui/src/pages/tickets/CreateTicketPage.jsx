import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, getResources } from "../../api/ticketApi";
import Sidebar from "../../components/Sidebar";
import ProfileDropdown from "../../components/ProfileDropdown";
import {
  ArrowLeft, Loader2, Upload, X,
  FileText, MapPin, Tag, AlertTriangle, Phone, Package
} from "lucide-react";

const CATEGORIES = ["ELECTRICAL", "PLUMBING", "IT_EQUIPMENT", "FURNITURE", "HVAC", "SECURITY", "CLEANING", "OTHER"];
const PRIORITIES = [
  { value: "LOW",      label: "Low" },
  { value: "MEDIUM",   label: "Medium" },
  { value: "HIGH",     label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (form) => {
  const errors = {};

  if (!form.title.trim())
    errors.title = "Title is required.";
  else if (form.title.trim().length < 5)
    errors.title = "Title must be at least 5 characters.";
  else if (form.title.trim().length > 100)
    errors.title = "Title must be under 100 characters.";

  if (!form.description.trim())
    errors.description = "Description is required.";
  else if (form.description.trim().length < 10)
    errors.description = "Description must be at least 10 characters.";

  if (!form.location.trim())
    errors.location = "Location is required.";

  if (form.contactDetails.trim()) {
    const digitsOnly = form.contactDetails.replace(/\D/g, "");
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/;
    if (!phoneRegex.test(form.contactDetails.trim())) {
      errors.contactDetails = "Enter a valid phone number. Only digits, +, -, spaces and () allowed.";
    } else if (digitsOnly.length < 7) {
      errors.contactDetails = `Too short — phone number needs at least 7 digits (you entered ${digitsOnly.length}).`;
    } else if (digitsOnly.length > 15) {
      errors.contactDetails = `Too long — phone number can have at most 15 digits (you entered ${digitsOnly.length}).`;
    }
  }

  return errors;
};

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", location: "",
    category: "IT_EQUIPMENT", priority: "MEDIUM",
    contactDetails: "", resourceId: "",
  });
  const [files, setFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    getResources().then(setResources).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: value });
      setFieldErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setFieldErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  // Block non-phone characters at the keyboard level
  const handlePhoneKeyDown = (e) => {
    const passthrough = [
      "Backspace", "Delete", "Tab", "Enter",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End", "c", "v", "a", "x", // allow ctrl+c/v/a/x
    ];
    const allowedChar = /^[0-9+\-\s().\/]$/;
    if (!passthrough.includes(e.key) && !allowedChar.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length + files.length > 3) {
      setSubmitError("Maximum 3 attachments allowed.");
      return;
    }
    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setSubmitError(`"${file.name}" is not an image file.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }
    }
    setFiles([...files, ...selected]);
    setSubmitError("");
  };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, description: true, location: true, contactDetails: true });
    const errs = validate(form);
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      setSubmitError("Please fix the highlighted errors before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = { ...form };
      if (!payload.resourceId) delete payload.resourceId;
      const formData = new FormData();
      formData.append("ticket", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      files.forEach((f) => formData.append("files", f));
      await createTicket(formData);
      navigate("/tickets");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit ticket. Please try again.");
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
    input: (hasErr) => ({
      width: "100%", padding: "10px 14px", borderRadius: "8px", fontSize: "14px",
      color: "#0F172A", outlineColor: hasErr ? "#EF4444" : "#0EA5E9", boxSizing: "border-box",
      border: `1px solid ${hasErr ? "#FCA5A5" : "#E2E8F0"}`,
      backgroundColor: hasErr ? "#FFF8F8" : "white",
      transition: "border-color 0.2s",
    }),
    textarea: (hasErr) => ({
      width: "100%", padding: "10px 14px", borderRadius: "8px", fontSize: "14px",
      color: "#0F172A", outlineColor: hasErr ? "#EF4444" : "#0EA5E9",
      minHeight: "110px", resize: "vertical", boxSizing: "border-box",
      border: `1px solid ${hasErr ? "#FCA5A5" : "#E2E8F0"}`,
      backgroundColor: hasErr ? "#FFF8F8" : "white",
      transition: "border-color 0.2s",
    }),
    select: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", color: "#0F172A", outlineColor: "#0EA5E9", boxSizing: "border-box", cursor: "pointer" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    fieldError: { fontSize: "12px", color: "#DC2626", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" },
    submitError: { backgroundColor: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: "8px", padding: "12px 16px", color: "#DC2626", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" },
    hint: { fontSize: "12px", color: "#94A3B8", marginTop: "4px" },
    uploadZone: { border: "2px dashed #E2E8F0", borderRadius: "8px", padding: "24px", textAlign: "center", cursor: "pointer", backgroundColor: "#FAFAFA", transition: "border-color 0.2s, background-color 0.2s" },
    fileTag: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", backgroundColor: "#F1F5F9", borderRadius: "8px", fontSize: "13px", color: "#374151" },
  };

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p style={s.fieldError}><AlertTriangle size={12} /> {fieldErrors[name]}</p>
    ) : null;

  return (
    <div style={s.root}>
      <Sidebar activeId="tickets" />
      <main style={s.main}>
        <header style={s.header}>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}
            onClick={() => navigate("/tickets")}>
            <ArrowLeft size={16} /> Back to Tickets
          </button>
          <ProfileDropdown />
        </header>

        <div style={s.content}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>Report an Incident</h1>
            <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>Describe the issue and we'll get someone on it.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <p style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", margin: 0 }}>Incident Details</p>
              </div>

              <div style={s.cardBody}>
                {submitError && (
                  <div style={s.submitError}>
                    <AlertTriangle size={16} /> {submitError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label style={s.label}><FileText size={14} /> Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} onBlur={handleBlur}
                    style={s.input(!!fieldErrors.title)} placeholder="Brief description of the issue" maxLength={100} />
                  <FieldError name="title" />
                  <p style={s.hint}>{form.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label style={s.label}><FileText size={14} /> Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} onBlur={handleBlur}
                    style={s.textarea(!!fieldErrors.description)} placeholder="Provide as much detail as possible..." />
                  <FieldError name="description" />
                </div>

                {/* Location */}
                <div>
                  <label style={s.label}><MapPin size={14} /> Location *</label>
                  <input name="location" value={form.location} onChange={handleChange} onBlur={handleBlur}
                    style={s.input(!!fieldErrors.location)} placeholder="e.g. Lab 3, Block A, 2nd Floor" />
                  <FieldError name="location" />
                </div>

                {/* Category + Priority */}
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

                {/* Linked Resource */}
                {resources.length > 0 && (
                  <div>
                    <label style={s.label}><Package size={14} /> Linked Resource (optional)</label>
                    <select name="resourceId" value={form.resourceId}
                      onChange={(e) => setForm({ ...form, resourceId: e.target.value })} style={s.select}>
                      <option value="">-- Select a resource (optional) --</option>
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — {r.location} ({r.type?.replace("_", " ")})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Contact Phone */}
                <div>
                  <label style={s.label}><Phone size={14} /> Contact Phone Number (optional)</label>
                  <input
                    name="contactDetails"
                    value={form.contactDetails}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handlePhoneKeyDown}
                    style={s.input(!!fieldErrors.contactDetails)}
                    placeholder="e.g. +94771234567 or 0771234567"
                    type="tel"
                    inputMode="tel"
                    maxLength={16}
                  />
                  <FieldError name="contactDetails" />
                  {!fieldErrors.contactDetails && (
                    <p style={s.hint}>Digits, +, -, spaces and () only · 7–15 digits</p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label style={s.label}><Upload size={14} /> Attachments (max 3 images)</label>
                  <label style={s.uploadZone}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = "#0EA5E9"; e.currentTarget.style.backgroundColor = "#F0F9FF"; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.backgroundColor = "#FAFAFA"; }}>
                    <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
                    <Upload size={24} color="#94A3B8" style={{ marginBottom: "8px" }} />
                    <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Click to upload or drag and drop</p>
                    <p style={{ fontSize: "12px", color: "#94A3B8", margin: "4px 0 0" }}>PNG, JPG · max 5MB each · max 3 files</p>
                  </label>

                  {files.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                      {files.map((f, i) => (
                        <div key={i} style={s.fileTag}>
                          <FileText size={14} color="#0EA5E9" />
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                          <span style={{ fontSize: "11px", color: "#94A3B8", marginRight: "8px" }}>
                            {(f.size / 1024).toFixed(0)} KB
                          </span>
                          <button type="button" onClick={() => removeFile(i)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 0, display: "flex" }}>
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
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                    : "Submit Ticket"}
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
