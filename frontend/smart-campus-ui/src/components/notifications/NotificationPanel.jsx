

// ═══════════════════════════════════════════════════════════════════════════
// FILE: src/components/notifications/NotificationPanel.jsx
// (Updated to match Branch B style - dark navy dropdown)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from "../../api/notificationApi";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";

const NotificationPanelB = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUnreadCount().then(setUnread);
    const interval = setInterval(() => getUnreadCount().then(setUnread), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) getNotifications().then(setNotifications);
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n) => {
    if (!n.read) {
      await markAsRead(n.id);
      setNotifications(notifications.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.type === "TICKET_STATUS" || n.type === "NEW_COMMENT") navigate(`/tickets/${n.referenceId}`);
    setOpen(false);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", padding: "4px" }}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span style={{ position: "absolute", top: 0, right: 0, minWidth: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#EF4444", color: "white", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", padding: "0 2px" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "360px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1px solid #E2E8F0", zIndex: 200, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" }}>
            <span style={{ fontWeight: "700", fontSize: "14px", color: "#0F172A" }}>Notifications {unread > 0 && <span style={{ fontSize: "12px", color: "#0EA5E9" }}>({unread} new)</span>}</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#0EA5E9", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} onClick={() => handleClick(n)}
                  style={{ display: "flex", gap: "12px", padding: "12px 16px", cursor: "pointer", backgroundColor: n.read ? "white" : "#F0F9FF", borderBottom: "1px solid #F8FAFC", alignItems: "flex-start" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = n.read ? "#F8FAFC" : "#E0F2FE"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = n.read ? "white" : "#F0F9FF"}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: n.read ? "#E2E8F0" : "#0EA5E9", marginTop: "5px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: 1.5 }}>{n.message}</p>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>{new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <ChevronRight size={14} color="#CBD5E1" />
                </div>
              ))
            )}
          </div>

          <div style={{ padding: "10px 16px", borderTop: "1px solid #F1F5F9", textAlign: "center" }}>
            <button onClick={() => { navigate("/notifications"); setOpen(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#0EA5E9", fontSize: "13px", fontWeight: "600" }}>
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanelB;
