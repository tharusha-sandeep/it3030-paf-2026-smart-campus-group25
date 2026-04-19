import { useState, useEffect, useRef } from "react";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from "../../api/notificationApi";
import { useNavigate } from "react-router-dom";

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUnreadCount().then(setUnread);
    // Poll every 30 seconds
    const interval = setInterval(() => getUnreadCount().then(setUnread), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      getNotifications().then(setNotifications);
    }
  }, [open]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications(notifications.map((n) => n.id === notification.id ? { ...n, read: true } : n));
      setUnread((u) => Math.max(0, u - 1));
    }
    // Navigate to the relevant page
    if (notification.type === "TICKET_STATUS" || notification.type === "NEW_COMMENT") {
      navigate(`/tickets/${notification.referenceId}`);
    }
    setOpen(false);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div style={styles.wrapper} ref={panelRef}>
      <button onClick={() => setOpen(!open)} style={styles.bell}>
        🔔
        {unread > 0 && <span style={styles.badge}>{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} style={styles.markAllBtn}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p style={styles.empty}>No notifications</p>
          ) : (
            <div style={styles.list}>
              {notifications.map((n) => (
                <div key={n.id} onClick={() => handleClick(n)}
                  style={{ ...styles.item, background: n.read ? "#fff" : "#eff6ff" }}>
                  <p style={styles.message}>{n.message}</p>
                  <span style={styles.time}>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { position: "relative" },
  bell: { background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", position: "relative", padding: "0.25rem" },
  badge: { position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: "0.65rem", fontWeight: 700, borderRadius: "50%", minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" },
  panel: { position: "absolute", right: 0, top: "2.2rem", width: 340, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 1rem", borderBottom: "1px solid #f3f4f6" },
  panelTitle: { fontWeight: 700, fontSize: "0.95rem" },
  markAllBtn: { background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.8rem" },
  list: { maxHeight: 360, overflowY: "auto" },
  item: { padding: "0.8rem 1rem", borderBottom: "1px solid #f3f4f6", cursor: "pointer" },
  message: { margin: 0, fontSize: "0.87rem", color: "#111", lineHeight: 1.4 },
  time: { fontSize: "0.75rem", color: "#9ca3af" },
  empty: { padding: "1.5rem", textAlign: "center", color: "#9ca3af" },
};