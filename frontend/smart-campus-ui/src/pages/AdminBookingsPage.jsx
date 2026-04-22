import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import RejectModal from "../components/RejectModal";
import toast from "react-hot-toast";
import {
  CalendarDays, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, XCircle, Clock3, Filter, Clock, MapPin, Users, Search
} from "lucide-react";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterResource, setFilterResource] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.bookingDate = filterDate;
      if (filterResource) params.resourceId = filterResource;
      const res = await axiosInstance.get("/api/bookings", { params });
      setBookings(res.data);
    } catch {
      setError("Failed to fetch administrative records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axiosInstance.get("/api/resources").then(r => setResources(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchBookings(); }, [filterStatus, filterDate, filterResource]);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/api/bookings/${id}/approve`);
      toast.success("Request approved");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const getStatusBadge = (status) => {
    const maps = {
      APPROVED: "badge-approved",
      PENDING: "badge-pending",
      REJECTED: "badge-rejected",
      CANCELLED: "badge-muted"
    };
    return `badge ${maps[status] || "badge-pending"}`;
  };

  const styles = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: { height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" },
    pageHeader: { marginBottom: "32px" },
    title: { fontSize: "24px", fontWeight: "700", color: "#0F172A" },
    sub: { fontSize: "14px", color: "#64748B", marginTop: "4px" },

    filterBar: {
      backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px",
      display: "flex", gap: "16px", marginBottom: "32px", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    },
    select: {
      padding: "10px 16px", borderRadius: "8px", border: "1px solid #E2E8F0",
      backgroundColor: "white", fontSize: "13px", fontWeight: "500", color: "#334155", outline: "none"
    },

    tableContainer: {
      backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden"
    },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    th: { padding: "12px 24px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" },
    td: { padding: "16px 24px", borderBottom: "1px solid #F1F5F9", fontSize: "14px", color: "#374151", verticalAlign: "middle" },
    row: { transition: "background 0.15s" },
    
    emptyState: { padding: "80px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #E2E8F0" }
  };

  return (
    <div style={styles.root}>
      <Sidebar activeId="admin-bookings" />
      <main style={styles.main}>
        <header style={styles.header}>
          <ProfileDropdown />
        </header>

        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.title}>Administrative Review</h1>
            <p style={styles.sub}>Manage campus reservation requests and schedules.</p>
          </div>

          <div style={styles.filterBar}>
             <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F1F5F9", padding: "10px 16px", borderRadius: "8px", flex: 1 }}>
                <Search size={18} color="#94A3B8" />
                <input style={{ border: "none", background: "none", outline: "none", fontSize: "14px", width: "100%" }} placeholder="Filter entries..." />
             </div>
             <select style={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
             </select>
             <input type="date" style={styles.select} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
             <select style={styles.select} value={filterResource} onChange={e => setFilterResource(e.target.value)}>
                <option value="">Resource: All</option>
                {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
             </select>
             {(filterStatus || filterDate || filterResource) && (
               <button className="btn-secondary" style={{ padding: "10px 16px" }} onClick={() => { setFilterStatus(""); setFilterDate(""); setFilterResource(""); }}>Reset</button>
             )}
          </div>

          <div style={styles.tableContainer}>
            {loading ? (
              <div style={{ padding: "100px", textAlign: "center" }}><Loader2 size={40} className="animate-spin" color="#0EA5E9" /></div>
            ) : bookings.length === 0 ? (
              <div style={styles.emptyState}>No records found matching your criteria.</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Record</th>
                    <th style={styles.th}>Requester</th>
                    <th style={styles.th}>Asset</th>
                    <th style={styles.th}>Schedule</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={styles.row} onMouseOver={e => e.currentTarget.style.backgroundColor = "#F8FAFC"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td style={styles.td}><span style={{ color: "#94A3B8", fontWeight: "600", fontSize: "12px" }}>#{b.id}</span></td>
                      <td style={styles.td}><div style={{ fontWeight: "600", color: "#0F172A" }}>{b.userName}</div></td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: "600", color: "#0F172A" }}>{b.resourceName}</div>
                        {b.resourceLocation && <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}><MapPin size={12} /> {b.resourceLocation}</div>}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: "500", color: "#374151" }}>{new Date(b.bookingDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {b.startTime} - {b.endTime}</div>
                      </td>
                      <td style={styles.td}>
                        <span className={getStatusBadge(b.status)}>{b.status.toLowerCase()}</span>
                        {b.status === "REJECTED" && b.rejectionReason && (
                          <div style={{ fontSize: "11px", color: "#DC2626", marginTop: "4px", maxWidth: "150px" }}>{b.rejectionReason}</div>
                        )}
                      </td>
                      <td style={styles.td}>
                         {b.status === "PENDING" ? (
                           <div style={{ display: "flex", gap: "8px" }}>
                             <button onClick={() => handleApprove(b.id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: "#D1FAE5", color: "#065F46", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Approve</button>
                             <button onClick={() => setRejectTarget(b)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: "#FEE2E2", color: "#991B1B", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Reject</button>
                           </div>
                         ) : <span style={{ color: "#CBD5E1" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {rejectTarget && (
        <RejectModal
          booking={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={() => { setRejectTarget(null); fetchBookings(); }}
        />
      )}
    </div>
  );
};

export default AdminBookingsPage;
