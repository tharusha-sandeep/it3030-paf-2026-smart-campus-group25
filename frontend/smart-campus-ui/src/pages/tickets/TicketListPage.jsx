import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../../api/ticketApi";
import { useAuth } from "../../auth/AuthContext";

const STATUS_COLORS = {
  OPEN: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  RESOLVED: "#10b981",
  CLOSED: "#6b7280",
  REJECTED: "#ef4444",
};

const PRIORITY_COLORS = {
  LOW: "#6b7280",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMyTickets()
      .then(setTickets)
      .catch(() => setError("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.center}>Loading tickets...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Incident Tickets</h1>
        <button style={styles.btn} onClick={() => navigate("/tickets/create")}>
          + New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div style={styles.empty}>No tickets yet. Create one to report an issue.</div>
      ) : (
        <div style={styles.list}>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={styles.card}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div style={styles.cardTop}>
                <span style={styles.category}>{ticket.category}</span>
                <span style={{ ...styles.badge, background: STATUS_COLORS[ticket.status] }}>
                  {ticket.status}
                </span>
              </div>
              <h3 style={styles.cardTitle}>{ticket.title}</h3>
              <p style={styles.cardLocation}>📍 {ticket.location}</p>
              <div style={styles.cardBottom}>
                <span style={{ color: PRIORITY_COLORS[ticket.priority], fontWeight: 600 }}>
                  {ticket.priority} priority
                </span>
                <span style={styles.date}>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.75rem", fontWeight: 700, color: "#111" },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "0.6rem 1.2rem", cursor: "pointer", fontWeight: 600 },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.2rem", cursor: "pointer", transition: "box-shadow 0.2s" },
  cardTop: { display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" },
  category: { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 },
  badge: { color: "#fff", fontSize: "0.75rem", fontWeight: 600, padding: "2px 10px", borderRadius: 20 },
  cardTitle: { fontSize: "1.1rem", fontWeight: 600, color: "#111", margin: "0 0 0.3rem 0" },
  cardLocation: { color: "#6b7280", fontSize: "0.9rem", margin: "0 0 0.8rem 0" },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  date: { color: "#9ca3af", fontSize: "0.8rem" },
  center: { textAlign: "center", padding: "3rem", color: "#6b7280" },
  empty: { textAlign: "center", padding: "3rem", color: "#9ca3af", background: "#f9fafb", borderRadius: 12 },
};