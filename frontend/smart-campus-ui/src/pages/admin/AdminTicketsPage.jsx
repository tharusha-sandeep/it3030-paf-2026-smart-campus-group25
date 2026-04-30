// ═══════════════════════════════════════════════════════════════════════════
// FILE 1: src/pages/admin/AdminTicketsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTickets, updateTicketStatus } from "../../api/ticketApi";
import Sidebar from "../../components/Sidebar";
import ProfileDropdown from "../../components/ProfileDropdown";
import { Loader2, Search, Filter, Shield, ChevronRight, X, AlertCircle } from "lucide-react";

const STATUS_BADGE = {
  OPEN:        "badge badge-pending",
  IN_PROGRESS: "badge badge-approved",
  RESOLVED:    "badge badge-active",
  CLOSED:      "badge badge-muted",
  REJECTED:    "badge badge-rejected",
};

const AdminTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "", resolutionNotes: "", rejectionReason: "", assigneeId: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = () => {
    getAllTickets().then(setTickets).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const filtered = tickets.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.reporterName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openModal = (t) => {
    setSelected(t);
    setForm({ status: t.status, resolutionNotes: t.resolutionNotes || "", rejectionReason: "", assigneeId: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateTicketStatus(selected.id, form);
      setSelected(null);
      fetchTickets();
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: { height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "32px" },
    filterBar: { backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
    th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" },
    td: { padding: "14px 16px", borderBottom: "1px solid #F1F5F9", fontSize: "14px", color: "#374151", verticalAlign: "middle" },
    modal: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modalBox: { backgroundColor: "white", borderRadius: "16px", width: "500px", maxWidth: "95vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden" },
    label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outlineColor: "#0EA5E9", boxSizing: "border-box" },
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="admin-tickets" />
      <main style={s.main}>
        <header style={s.header}><ProfileDropdown /></header>

        <div style={s.content}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>All Incident Tickets</h1>
              <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>Review and manage all reported incidents.</p>
            </div>
            <div style={{ fontSize: "13px", color: "#64748B", backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "8px 16px" }}>
              {filtered.length} tickets
            </div>
          </div>

          <div style={s.filterBar}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F1F5F9", padding: "10px 16px", borderRadius: "8px", flex: 1 }}>
              <Search size={16} color="#94A3B8" />
              <input style={{ border: "none", background: "none", outline: "none", fontSize: "14px", width: "100%" }} placeholder="Search by title or reporter..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={14} color="#64748B" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#374151", outline: "none" }}>
                <option value="ALL">All Status</option>
                {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px" }}><Loader2 size={40} className="animate-spin" color="#0EA5E9" /></div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Title", "Reporter", "Category", "Priority", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} style={{ cursor: "pointer" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={s.td}>
                      <span style={{ fontWeight: "600", color: "#0F172A" }}>{t.title}</span>
                    </td>
                    <td style={s.td}>{t.reporterName}</td>
                    <td style={s.td}><span style={{ fontSize: "12px", color: "#64748B" }}>{t.category?.replace("_", " ")}</span></td>
                    <td style={s.td}><span style={{ fontSize: "12px", fontWeight: "600" }}>{t.priority}</span></td>
                    <td style={s.td}><span className={STATUS_BADGE[t.status]}>{t.status.replace("_", " ")}</span></td>
                    <td style={{ ...s.td, color: "#94A3B8", fontSize: "12px" }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                          onClick={() => openModal(t)}>
                          <Shield size={12} /> Update
                        </button>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#0EA5E9", display: "flex", alignItems: "center" }}
                          onClick={() => navigate(`/tickets/${t.id}`)}>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {selected && (
        <div style={s.modal} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div style={s.modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Update: {selected.title}</h2>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }} onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={s.label}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={s.input}>
                    {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((st) => <option key={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Resolution Notes</label>
                  <textarea value={form.resolutionNotes} onChange={(e) => setForm({ ...form, resolutionNotes: e.target.value })}
                    style={{ ...s.input, minHeight: "80px", resize: "vertical" }} placeholder="What was done to resolve this?" />
                </div>
                {form.status === "REJECTED" && (
                  <div>
                    <label style={s.label}>Rejection Reason</label>
                    <input value={form.rejectionReason} onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })} style={s.input} placeholder="Reason for rejection" />
                  </div>
                )}
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", backgroundColor: "#F8FAFC", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketsPage;
