import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Ticket,
  Users,
  LogOut,
  ShieldCheck
} from "lucide-react";

const NAVY = "#1e3a5f";
const NAVY_DARK = "#122a47";

const Sidebar = ({ activeId }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: isAdmin ? "/admin/dashboard" : "/dashboard" },
    { id: "resources", label: "Resources", icon: Package, path: "/resources" },
    { id: "bookings",  label: "Bookings",  icon: CalendarDays, path: "/bookings" },
    { id: "tickets",   label: "Tickets",   icon: Ticket, path: "/tickets" },
  ];

  if (isAdmin) {
    navItems.push({ id: "users", label: "Users", icon: Users, path: "/users" });
  }

  const s = {
    sidebar: {
      width: "220px",
      minWidth: "220px",
      backgroundColor: "white",
      borderRight: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      zIndex: 100,
    },
    sidebarBrand: {
      padding: "1.25rem 1rem",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    brandIconBox: {
      width: "34px",
      height: "34px",
      borderRadius: "9px",
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    brandTitle: {
      fontSize: "0.8rem",
      fontWeight: "700",
      color: "#0f172a",
      lineHeight: 1.2,
    },
    brandSub: {
      fontSize: "0.625rem",
      color: "#94a3b8",
    },
    navSection: {
      flex: 1,
      padding: "1rem 0.5rem",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "9px 12px",
      borderRadius: "9px",
      cursor: "pointer",
      backgroundColor: active ? NAVY : "transparent",
      color: active ? "white" : "#475569",
      fontSize: "0.875rem",
      fontWeight: active ? "600" : "500",
      border: "none",
      width: "100%",
      textAlign: "left",
      transition: "all 0.2s",
    }),
    sidebarBottom: {
      padding: "0.75rem 0.5rem 1.25rem",
      borderTop: "1px solid #f1f5f9",
    },
    logoutBtn: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "9px 12px",
      borderRadius: "9px",
      cursor: "pointer",
      color: "#ef4444",
      fontSize: "0.875rem",
      fontWeight: "600",
      border: "none",
      backgroundColor: "#fef2f2",
      width: "100%",
      textAlign: "left",
      transition: "all 0.2s",
    },
  };

  return (
    <aside style={s.sidebar}>
      <div style={s.sidebarBrand}>
        <div style={s.brandIconBox}>
          <ShieldCheck size={18} color="white" />
        </div>
        <div style={s.brandText}>
          <div style={s.brandTitle}>Smart Campus Hub</div>
          <div style={s.brandSub}>Operations Platform</div>
        </div>
      </div>

      <nav style={s.navSection}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              style={s.navItem(active)}
              onClick={() => navigate(item.path)}
              onMouseOver={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              onMouseOut={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={s.sidebarBottom}>
        <button 
          style={s.logoutBtn} 
          onClick={handleLogout}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
