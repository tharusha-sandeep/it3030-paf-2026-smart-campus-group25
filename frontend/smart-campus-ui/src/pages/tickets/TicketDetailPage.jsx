import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTicketById, deleteTicket } from "../../api/ticketApi";
import { useAuth } from "../../auth/AuthContext";
import CommentSection from "../../components/tickets/CommentSection";

const STATUS_COLORS = { OPEN: "#3b82f6", IN_PROGRESS: "#f59e0b", RESOLVED: "#10b981", CLOSED: "#6b7280", REJECTED: "#ef4444" };

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTicketById(id).then(setTicket).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this ticket?")) return;
    await deleteTicket(id);
    navigate("/tickets");
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  if (!ticket) return <div style={{ padding: "2rem" }}>Ticket not found.</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/tickets")} style={styles.back}>← Back to Tickets</button>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <span style={styles.category}>{ticket.category}</span>
            <h1 style={styles.title}>{ticket.title}</h1>
          </div>
          <span style={{ ...styles.badge, background: STATUS_COLORS[ticket.status] }}>{ticket.status}</span>
        </div>

        <div style={styles.meta}>
          <span>📍 {ticket.location}</span>
          <span>⚡ {ticket.priority}</span>
          <span>🗓 {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>

        <p style={styles.description}>{ticket.description}</p>

        {ticket.contactDetails && (
          <p style={styles.contact}>📞 Contact: {ticket.contactDetails}</p>
        )}

        {ticket.assigneeName && (
          <p style={styles.assigned}>👷 Assigned to: {ticket.assigneeName}</p>
        )}

        {ticket.resolutionNotes && (
          <div style={styles.notes}>
            <strong>Resolution Notes:</strong>
            <p>{ticket.resolutionNotes}</p>
          </div>
        )}

        {ticket.rejectionReason && (
          <div style={{ ...styles.notes, background: "#fee2e2" }}>
            <strong>Rejection Reason:</strong>
            <p>{ticket.rejectionReason}</p>
          </div>
        )}

        {ticket.attachments?.length > 0 && (
          <div style={styles.attachments}>
            <strong>Attachments:</strong>
            <div style={styles.imageGrid}>
              {ticket.attachments.map((path, i) => (
                <img key={i} src={`http://localhost:8080/${path}`} alt={`attachment ${i + 1}`} style={styles.image} />
              ))}
            </div>
          </div>
        )}

        {ticket.reporterId === user?.id && (
          <button onClick={handleDelete} style={styles.deleteBtn}>Delete Ticket</button>
        )}
      </div>

      <CommentSection ticketId={id} />
    </div>
  );
}

const styles = {
  container: { maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" },
  back: { background: "none", border: "none", color: "#2563eb", cursor: "pointer", marginBottom: "1rem", fontWeight: 500 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  category: { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: "1.4rem", fontWeight: 700, margin: "0.3rem 0" },
  badge: { color: "#fff", fontSize: "0.8rem", fontWeight: 600, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap" },
  meta: { display: "flex", gap: "1rem", color: "#6b7280", fontSize: "0.9rem", margin: "1rem 0", flexWrap: "wrap" },
  description: { color: "#374151", lineHeight: 1.6, margin: "1rem 0" },
  contact: { color: "#374151", fontSize: "0.9rem" },
  assigned: { color: "#374151", fontSize: "0.9rem" },
  notes: { background: "#f0fdf4", borderRadius: 8, padding: "0.8rem", margin: "1rem 0" },
  attachments: { margin: "1rem 0" },
  imageGrid: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" },
  image: { width: 150, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" },
  deleteBtn: { background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer", marginTop: "1rem" },
};