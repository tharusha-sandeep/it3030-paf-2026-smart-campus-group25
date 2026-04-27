import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Ticket,
  Users,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Settings,
  HelpCircle
} from "lucide-react";

/**
 * Modern Linear-style Sidebar
 * - Dark Navy Background (#0F172A)
 * - Muted texts, white active items
 * - Sky blue left border for active state
 */
const Sidebar = ({ activeId }) => {
  const { user, logout } = useAuth();
  
  const isAdmin = user?.role === "ADMIN" || 
                  user?.role === "ROLE_ADMIN" || 
                  (user?.roles && user.roles.includes("ROLE_ADMIN"));

  const navItems = [
    { id: "dashboard", label: "Overview", path: isAdmin ? "/admin/dashboard" : "/dashboard", icon: LayoutDashboard },
    { id: "resources", label: "Resources", path: "/resources", icon: Package },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin-bookings", label: "Manage Bookings", path: "/admin/bookings", icon: ShieldCheck });
    navItems.push({ id: "users", label: "Users", path: "/admin/users", icon: Users });
  } else {
    navItems.push({ id: "bookings", label: "My Bookings", path: "/bookings", icon: CalendarDays });
    navItems.push({ id: "support", label: "Support Tickets", path: "/support", icon: Ticket });
  }

  const styles = {
    container: {
      width: "240px",
      minWidth: "240px",
      height: "100vh",
      backgroundColor: "#0F172A",
      color: "#94A3B8",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 100,
      borderRight: "1px solid #1E293B",
    },
    logoSection: {
      padding: "24px",
      marginBottom: "8px",
    },
    logoBox: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoCircle: {
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      backgroundColor: "#0EA5E9", // Sky blue
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
    },
    logoText: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: "-0.01em",
    },
    logoSub: {
      fontSize: "11px",
      color: "#64748B",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginTop: "2px",
    },
    navWrapper: {
      flex: 1,
      padding: "0 12px",
      overflowY: "auto",
    },
    groupLabel: {
      fontSize: "11px",
      fontWeight: "600",
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      padding: "24px 12px 10px",
    },
    navLink: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 12px",
      borderRadius: "6px",
      marginBottom: "4px",
      color: isActive ? "#FFFFFF" : "#94A3B8",
      backgroundColor: isActive ? "#1E293B" : "transparent",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: isActive ? "500" : "400",
      cursor: "pointer",
      position: "relative",
      transition: "all 0.15s ease",
    }),
    activeBorder: {
      position: "absolute",
      left: 0,
      top: "20%",
      bottom: "20%",
      width: "3px",
      backgroundColor: "#0EA5E9",
      borderRadius: "0 4px 4px 0",
    },
    bottomSection: {
      padding: "20px 12px 24px",
      borderTop: "1px solid #1E293B",
    },
    logoutBtn: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 12px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "transparent",
      color: "#94A3B8",
      fontSize: "14px",
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.15s ease",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoSection}>
        <div style={styles.logoBox}>
          <div style={styles.logoCircle}>S</div>
          <div>
            <div style={styles.logoText}>Smart Campus</div>
            <div style={styles.logoSub}>Operations Hub</div>
          </div>
        </div>
      </div>

      <div style={styles.navWrapper}>
        <div style={styles.groupLabel}>Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <NavLink 
              key={item.id} 
              to={item.path} 
              style={styles.navLink(isActive)}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#1E293B";
                  e.currentTarget.style.color = "#FFFFFF";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94A3B8";
                }
              }}
            >
              {isActive && <div style={styles.activeBorder} />}
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />}
            </NavLink>
          );
        })}

        <div style={styles.groupLabel}>System</div>
        <NavLink to="/settings" style={styles.navLink(activeId === "settings")}>
          {activeId === "settings" && <div style={styles.activeBorder} />}
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        
        {isAdmin ? (
          <NavLink to="/admin/support" style={styles.navLink(activeId === "admin-support")}>
            {activeId === "admin-support" && <div style={styles.activeBorder} />}
            <Ticket size={18} />
            <span>Support Inbox</span>
          </NavLink>
        ) : (
          <NavLink to="/support" style={styles.navLink(activeId === "support")}>
            {activeId === "support" && <div style={styles.activeBorder} />}
            <HelpCircle size={18} />
            <span>Support</span>
          </NavLink>
        )}
      </div>

      <div style={styles.bottomSection}>
        <button 
          onClick={logout} 
          style={styles.logoutBtn}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#EF4444";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#94A3B8";
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
