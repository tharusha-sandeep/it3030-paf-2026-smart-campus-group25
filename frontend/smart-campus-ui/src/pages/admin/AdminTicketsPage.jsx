import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTickets, updateTicketStatus } from "../../api/ticketApi";

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: "", resolutionNotes: "", rejectionReason: "" });
  const navigate = useNavigate();

  useEffect(() => {
    getAllTickets().then(setTickets).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async () => {
    const updated = await updateTicketStatus(selected.id, statusUpdate);
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
    setSelected(null);
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>All Incident Tickets</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <thead style={{ background: "#f9fafb" }}>
          <tr>
            {["Title", "Reporter", "Category", "Priority", "Status", "Date", "Actions"].map((h) => (
              <th key={h} style={{ padding: "0.8rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#374151", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "0.8rem 1rem" }}>{t.title}</td>
              <td style={{ padding: "0.8rem 1rem" }}>{t.reporterName}</td>
              <td style={{ padding: "0.8rem 1rem" }}>{t.category}</td>
              <td style={{ padding: "0.8rem 1rem" }}>{t.priority}</td>
              <td style={{ padding: "0.8rem 1rem" }}><span style={{ fontWeight: 600 }}>{t.status}</span></td>
              <td style={{ padding: "0.8rem 1rem", fontSize: "0.8rem", color: "#9ca3af" }}>{new Date(t.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: "0.8rem 1rem" }}>
                <button onClick={() => { setSelected(t); setStatusUpdate({ status: t.status, resolutionNotes: "", rejectionReason: "" }); }}
                  style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem" }}>
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "2rem", width: 460 }}>
            <h2 style={{ marginTop: 0 }}>Update: {selected.title}</h2>
            <label style={{ fontWeight: 600 }}>Status</label>
            <select value={statusUpdate.status} onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
              style={{ display: "block", width: "100%", padding: "0.5rem", margin: "0.5rem 0 1rem", border: "1px solid #d1d5db", borderRadius: 8 }}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label style={{ fontWeight: 600 }}>Resolution Notes</label>
            <textarea value={statusUpdate.resolutionNotes} onChange={(e) => setStatusUpdate({ ...statusUpdate, resolutionNotes: e.target.value })}
              style={{ display: "block", width: "100%", padding: "0.5rem", margin: "0.5rem 0 1rem", border: "1px solid #d1d5db", borderRadius: 8, boxSizing: "border-box" }} />
            <label style={{ fontWeight: 600 }}>Rejection Reason (if rejected)</label>
            <input value={statusUpdate.rejectionReason} onChange={(e) => setStatusUpdate({ ...statusUpdate, rejectionReason: e.target.value })}
              style={{ display: "block", width: "100%", padding: "0.5rem", margin: "0.5rem 0 1rem", border: "1px solid #d1d5db", borderRadius: 8, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button onClick={() => setSelected(null)} style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleUpdate} style={{ padding: "0.5rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}