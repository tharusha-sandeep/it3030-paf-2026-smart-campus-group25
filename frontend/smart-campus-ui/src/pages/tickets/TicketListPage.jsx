import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../../api/ticketApi";
import Sidebar from "../../components/Sidebar";
import ProfileDropdown from "../../components/ProfileDropdown";
import {
  Plus, Search, Filter, Loader2, AlertCircle,
  Ticket, MapPin, Tag, ChevronRight, Clock
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

const TicketListPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    getMyTickets()
      .then(setTickets)
      .catch(() => setError("Failed to load tickets."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: {
      height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0",
      padding: "0 32px", display: "flex", alignItems: "center",
      justifyContent: "flex-end", position: "sticky", top: 0, zIndex: 50,
    },
    content: { padding: "32px", maxWidth: "1200px", margin: "0 auto", width: "100%" },
    pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
    title: { fontSize: "24px", fontWeight: "700", color: "#0F172A" },
    sub: { fontSize: "14px", color: "#64748B", marginTop: "4px" },
    filterBar: {
      backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px",
      padding: "16px", display: "flex", gap: "12px", marginBottom: "32px",
      alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    searchBox: {
      display: "flex", alignItems: "center", gap: "10px",
      backgroundColor: "#F1F5F9", padding: "10px 16px", borderRadius: "8px", flex: 1,
    },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" },
    card: {
      backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden",
      display: "flex", flexDirection: "column", cursor: "pointer",
      transition: "box-shadow 0.2s, transform 0.2s",
    },
    cardAccent: (status) => {
      const colors = { OPEN: "#0EA5E9", IN_PROGRESS: "#F59E0B", RESOLVED: "#10B981", CLOSED: "#94A3B8", REJECTED: "#EF4444" };
      return { height: "3px", backgroundColor: colors[status] || "#0EA5E9" };
    },
    cardBody: { padding: "20px", flex: 1 },
    cardFooter: {
      padding: "12px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFAFA",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    metaRow: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748B", marginBottom: "6px" },
    emptyState: { padding: "80px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #E2E8F0" },
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="tickets" />
      <main style={s.main}>
        <header style={s.header}>
          <ProfileDropdown />
        </header>

        <div style={s.content}>
          <div style={s.pageHeader}>
            <div>
              <h1 style={s.title}>Incident Tickets</h1>
              <p style={s.sub}>Track and manage your reported issues.</p>
            </div>
            <button className="btn-primary" onClick={() => navigate("/tickets/create")}>
              <Plus size={18} /> New Ticket
            </button>
          </div>

          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94A3B8" />
              <input
                style={{ border: "none", background: "none", outline: "none", fontSize: "14px", width: "100%" }}
                placeholder="Search by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={14} color="#64748B" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#374151", outline: "none", cursor: "pointer" }}
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "100px" }}>
              <Loader2 size={40} className="animate-spin" color="#0EA5E9" />
            </div>
          ) : error ? (
            <div style={s.emptyState}>
              <AlertCircle size={40} color="#EF4444" style={{ marginBottom: "16px" }} />
              <p style={{ fontWeight: "600", color: "#0F172A" }}>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎫</div>
              <p style={{ fontWeight: "600", color: "#0F172A", marginBottom: "4px" }}>No tickets found</p>
              <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "20px" }}>
                {search || statusFilter !== "ALL" ? "Try adjusting your filters." : "Report an issue to get started."}
              </p>
              {!search && statusFilter === "ALL" && (
                <button className="btn-primary" style={{ margin: "0 auto" }} onClick={() => navigate("/tickets/create")}>
                  Create First Ticket
                </button>
              )}
            </div>
          ) : (
            <div style={s.grid}>
              {filtered.map((t) => {
                const pColor = PRIORITY_COLOR[t.priority] || PRIORITY_COLOR.MEDIUM;
                return (
                  <div
                    key={t.id}
                    style={s.card}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={s.cardAccent(t.status)} />
                    <div style={s.cardBody}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {t.category}
                        </span>
                        <span className={STATUS_BADGE[t.status]}>{t.status.replace("_", " ")}</span>
                      </div>

                      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A", marginBottom: "12px", lineHeight: 1.4 }}>
                        {t.title}
                      </h3>

                      <div style={s.metaRow}><MapPin size={12} /> {t.location}</div>
                      <div style={s.metaRow}><Clock size={12} /> {new Date(t.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</div>
                    </div>

                    <div style={s.cardFooter}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: pColor.color, backgroundColor: pColor.bg, padding: "3px 10px", borderRadius: "20px" }}>
                        {t.priority}
                      </span>
                      <ChevronRight size={16} color="#94A3B8" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <button className="btn-primary" style={{ position: "fixed", bottom: "32px", right: "32px", width: "56px", height: "56px", borderRadius: "50%", padding: 0, justifyContent: "center", boxShadow: "0 10px 15px -3px rgba(14,165,233,0.4)", zIndex: 200, backgroundColor: "#0EA5E9" }}
        onClick={() => navigate("/tickets/create")}>
        <Plus size={24} />
      </button>
    </div>
  );
};

export default TicketListPage;
