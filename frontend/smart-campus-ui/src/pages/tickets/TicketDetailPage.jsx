import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicketById, deleteTicket, updateTicketStatus } from "../../api/ticketApi";
import { useAuth } from "../../auth/AuthContext";
import Sidebar from "../../components/Sidebar";
import ProfileDropdown from "../../components/ProfileDropdown";
import CommentSection from "../../components/tickets/CommentSection";
import {
  ArrowLeft, Loader2, Trash2, MapPin, Tag,
  AlertTriangle, Phone, User, Clock, Shield, X
} from "lucide-react";

const STATUS_BADGE = {
  OPEN:        "badge badge-pending",
  IN_PROGRESS: "badge badge-approved",
  RESOLVED:    "badge badge-active",
  CLOSED:      "badge badge-muted",
  REJECTED:    "badge badge-rejected",
};

const PRIORITY_COLOR = {
  LOW:      { color: "#64748B", bg: "#F1F5F9" },
  MEDIUM:   { color: "#CA8A04", bg: "#FEF9C3" },
  HIGH:     { color: "#EA580C", bg: "#FFF7ED" },
  CRITICAL: { color: "#DC2626", bg: "#FEE2E2" },
};

const STATUS_BAR_COLOR = {
  OPEN: "#0EA5E9", IN_PROGRESS: "#F59E0B", RESOLVED: "#10B981", CLOSED: "#94A3B8", REJECTED: "#EF4444",
};

// Admin status update modal
const UpdateStatusModal = ({ ticket, onClose, onSuccess }) => {
  const [form, setForm] = useState({ status: ticket.status, resolutionNotes: ticket.resolutionNotes || "", rejectionReason: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateTicketStatus(ticket.id, form);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "white", borderRadius: "16px", width: "480px", maxWidth: "95vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F1F5F9" },
    body: { padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },
    footer: { padding: "16px 24px", borderTop: "1px solid #F1F5F9", backgroundColor: "#F8FAFC", display: "flex", gap: "12px", justifyContent: "flex-end" },
    label: { fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" },
    input: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outlineColor: "#0EA5E9", boxSizing: "border-box" },
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", margin: 0 }}>Update Ticket Status</h2>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }} onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={s.body}>
            <div>
              <label style={s.label}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={s.input}>
                {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Resolution Notes</label>
              <textarea value={form.resolutionNotes} onChange={(e) => setForm({ ...form, resolutionNotes: e.target.value })}
                style={{ ...s.input, minHeight: "80px", resize: "vertical" }} placeholder="Describe what was done..." />
            </div>
            {form.status === "REJECTED" && (
              <div>
                <label style={s.label}>Rejection Reason</label>
                <input value={form.rejectionReason} onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })} style={s.input} placeholder="Why is this being rejected?" />
              </div>
            )}
          </div>
          <div style={s.footer}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  const fetchTicket = () => {
    getTicketById(id).then(setTicket).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    await deleteTicket(id);
    navigate("/tickets");
  };

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: {
      height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0",
      padding: "0 32px", display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
    },
    content: { padding: "32px", maxWidth: "900px", margin: "0 auto", width: "100%" },
    card: { backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: "24px" },
    metaRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748B", marginBottom: "10px" },
    infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    infoBox: { backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "14px", border: "1px solid #F1F5F9" },
    infoLabel: { fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" },
    infoValue: { fontSize: "14px", fontWeight: "600", color: "#0F172A" },
  };

  if (loading) return (
    <div style={s.root}>
      <Sidebar activeId="tickets" />
      <main style={s.main}>
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Loader2 size={40} className="animate-spin" color="#0EA5E9" />
        </div>
      </main>
    </div>
  );

  if (!ticket) return null;

  const pColor = PRIORITY_COLOR[ticket.priority] || PRIORITY_COLOR.MEDIUM;

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
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {isAdmin && (
              <button className="btn-primary" style={{ backgroundColor: "#0F172A" }} onClick={() => setShowUpdateModal(true)}>
                <Shield size={16} /> Update Status
              </button>
            )}
            {ticket.reporterId === user?.id && (
              <button className="btn-secondary" style={{ borderColor: "#FEE2E2", color: "#EF4444" }} onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <ProfileDropdown />
          </div>
        </header>

        <div style={s.content}>
          {/* Main ticket card */}
          <div style={s.card}>
            <div style={{ height: "4px", backgroundColor: STATUS_BAR_COLOR[ticket.status] || "#0EA5E9" }} />
            <div style={{ padding: "24px" }}>
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {ticket.category?.replace("_", " ")}
                </span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: pColor.color, backgroundColor: pColor.bg, padding: "3px 10px", borderRadius: "20px" }}>
                    {ticket.priority}
                  </span>
                  <span className={STATUS_BADGE[ticket.status]}>{ticket.status.replace("_", " ")}</span>
                </div>
              </div>

              <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#0F172A", marginBottom: "16px" }}>{ticket.title}</h1>

              <div style={s.metaRow}><MapPin size={14} /> {ticket.location}</div>
              <div style={s.metaRow}><Clock size={14} /> Reported {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>
              {ticket.contactDetails && <div style={s.metaRow}><Phone size={14} /> {ticket.contactDetails}</div>}
              {ticket.assigneeName && <div style={s.metaRow}><User size={14} /> Assigned to {ticket.assigneeName}</div>}

              <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #F1F5F9" }}>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Description</p>
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.7, margin: 0 }}>{ticket.description}</p>
              </div>

              {/* Resolution notes */}
              {ticket.resolutionNotes && (
                <div style={{ padding: "16px", backgroundColor: "#F0FDF4", borderRadius: "8px", border: "1px solid #BBF7D0", marginBottom: "16px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>Resolution Notes</p>
                  <p style={{ fontSize: "14px", color: "#166534", margin: 0 }}>{ticket.resolutionNotes}</p>
                </div>
              )}

              {/* Rejection reason */}
              {ticket.rejectionReason && (
                <div style={{ padding: "16px", backgroundColor: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA", marginBottom: "16px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#991B1B", marginBottom: "6px" }}>Rejection Reason</p>
                  <p style={{ fontSize: "14px", color: "#991B1B", margin: 0 }}>{ticket.rejectionReason}</p>
                </div>
              )}

              {/* Attachments */}
              {ticket.attachments?.length > 0 && (
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Attachments</p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {ticket.attachments.map((path, i) => (
                      <img key={i} src={`http://localhost:8080/${path}`} alt={`attachment ${i + 1}`}
                        style={{ width: 160, height: 120, objectFit: "cover", borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <CommentSection ticketId={id} />
        </div>
      </main>

      {showUpdateModal && (
        <UpdateStatusModal
          ticket={ticket}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={() => { setShowUpdateModal(false); fetchTicket(); }}
        />
      )}
    </div>
  );
};

export default TicketDetailPage;
