// ═══════════════════════════════════════════════════════════════════════════
// FILE: src/pages/NotificationsPage.jsx
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead, markAllAsRead } from "../api/notificationApi";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import { Bell, CheckCheck, Loader2, ChevronRight } from "lucide-react";

const TYPE_COLOR = {
  TICKET_STATUS: { color: "#0EA5E9", bg: "#E0F2FE", label: "Status Update" },
  NEW_COMMENT:   { color: "#8B5CF6", bg: "#EDE9FE", label: "New Comment" },
  BOOKING_APPROVED: { color: "#10B981", bg: "#D1FAE5", label: "Booking Approved" },
  BOOKING_REJECTED: { color: "#EF4444", bg: "#FEE2E2", label: "Booking Rejected" },
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(setNotifications).finally(() => setLoading(false));
  }, []);

  const handleClick = async (n) => {
    if (!n.read) {
      await markAsRead(n.id);
      setNotifications(notifications.map((x) => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.type === "TICKET_STATUS" || n.type === "NEW_COMMENT") {
      navigate(`/tickets/${n.referenceId}`);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: { height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "32px", maxWidth: "760px", margin: "0 auto", width: "100%" },
    item: (read) => ({
      display: "flex", gap: "16px", padding: "16px", borderRadius: "12px",
      border: "1px solid #E2E8F0", marginBottom: "12px", cursor: "pointer",
      backgroundColor: read ? "white" : "#F0F9FF",
      borderLeft: read ? "1px solid #E2E8F0" : "3px solid #0EA5E9",
      transition: "box-shadow 0.2s",
    }),
    dot: (read) => ({ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: read ? "#E2E8F0" : "#0EA5E9", marginTop: "5px", flexShrink: 0 }),
    typeBadge: (type) => {
      const t = TYPE_COLOR[type] || { color: "#64748B", bg: "#F1F5F9", label: type };
      return { fontSize: "11px", fontWeight: "700", color: t.color, backgroundColor: t.bg, padding: "2px 8px", borderRadius: "20px" };
    },
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="notifications" />
      <main style={s.main}>
        <header style={s.header}><ProfileDropdown /></header>

        <div style={s.content}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0F172A" }}>Notifications</h1>
              <p style={{ fontSize: "14px", color: "#64748B", marginTop: "4px" }}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={handleMarkAll}>
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px" }}><Loader2 size={40} className="animate-spin" color="#0EA5E9" /></div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #E2E8F0" }}>
              <Bell size={40} color="#E2E8F0" style={{ marginBottom: "16px" }} />
              <p style={{ fontWeight: "600", color: "#0F172A", marginBottom: "4px" }}>No notifications yet</p>
              <p style={{ color: "#64748B", fontSize: "14px" }}>You'll be notified about ticket updates and comments.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const typeInfo = TYPE_COLOR[n.type] || { label: n.type };
              return (
                <div
                  key={n.id}
                  style={s.item(n.read)}
                  onClick={() => handleClick(n)}
                  onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={s.dot(n.read)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={s.typeBadge(n.type)}>{typeInfo.label || n.type}</span>
                      <span style={{ fontSize: "12px", color: "#94A3B8" }}>{new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                  </div>
                  <ChevronRight size={16} color="#CBD5E1" style={{ flexShrink: 0, marginTop: "4px" }} />
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;