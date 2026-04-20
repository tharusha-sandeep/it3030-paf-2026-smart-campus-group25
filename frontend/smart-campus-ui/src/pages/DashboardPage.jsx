import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Ticket,
  Bell,
  UserCircle,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ShieldCheck,
  Plus,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";

const NAVY = "#1a3a6b";
const NAVY_DARK = "#0f2447";


// ── Mock stat card data ───────────────────────────────────────────────────────
const STATS = [
  {
    color: "#3b82f6",
    bg: "#eff6ff",
    emoji: "📅",
    label: "UPCOMING BOOKINGS",
    value: "3",
    sub: "scheduled this week",
    badge: null,
  },
  {
    color: "#f97316",
    bg: "#fff7ed",
    emoji: "📦",
    label: "AVAILABLE RESOURCES",
    value: "18",
    sub: "items ready",
    badge: { text: "INVENTORY", color: "#f97316", bg: "#fff7ed" },
  },
  {
    color: "#ef4444",
    bg: "#fff1f2",
    emoji: "🔔",
    label: "SYSTEM ALERTS",
    value: "5",
    sub: "unread updates",
    badge: { text: "ACTION REQUIRED", color: "#fff", bg: "#ef4444" },
  },
];

const getDynamicStats = (resourceCount) => [
  {
    color: "#3b82f6",
    bg: "#eff6ff",
    emoji: "📅",
    label: "UPCOMING BOOKINGS",
    value: "3",
    sub: "scheduled this week",
    badge: null,
  },
  {
    color: "#f97316",
    bg: "#fff7ed",
    emoji: "📦",
    label: "AVAILABLE RESOURCES",
    value: resourceCount,
    sub: "items ready",
    badge: { text: "INVENTORY", color: "#f97316", bg: "#fff7ed" },
  },
  {
    color: "#ef4444",
    bg: "#fff1f2",
    emoji: "🔔",
    label: "SYSTEM ALERTS",
    value: "5",
    sub: "unread updates",
    badge: { text: "ACTION REQUIRED", color: "#fff", bg: "#ef4444" },
  },
];

// ── Mock booking data ─────────────────────────────────────────────────────────
const BOOKINGS = [
  {
    date: "Oct 24",
    title: "Advanced Physics Seminar",
    location: "Hall B, Engineering Wing",
    time: "09:00–11:30 AM",
    badge: "LECTURE THEATRE",
    badgeColor: "#3b82f6",
    badgeBg: "#eff6ff",
  },
  {
    date: "Oct 26",
    title: "IT Infrastructure Audit",
    location: "Data Center East",
    time: "02:00–04:00 PM",
    badge: "STAFF ONLY",
    badgeColor: "#6366f1",
    badgeBg: "#eef2ff",
  },
];

// ── Mock feed data ────────────────────────────────────────────────────────────
const FEED = [
  {
    dotColor: "#3b82f6",
    title: "HVAC Maintenance Completed",
    desc: "Science Block systems optimized",
    time: "2 hours ago",
  },
  {
    dotColor: "#ef4444",
    title: "New Booking Request",
    desc: "Dean's office requires Conference Hall A",
    time: "5 hours ago",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
  const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resourceCount, setResourceCount] = useState("...");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axiosInstance.get("/api/resources");
        setResourceCount(res.data.filter(r => r.status === 'ACTIVE').length.toString());
      } catch (err) {
        console.error("Failed to fetch available resources", err);
      }
    };
    fetchResources();
  }, []);

  const initials = user?.name ? user.name[0].toUpperCase() : "U";

  // ── Styles ──────────────────────────────────────────────────────────────────
  const layout = {
    root: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: "#f5f6fa",
    },

    // SIDEBAR
    sidebar: {
      width: "220px",
      minWidth: "220px",
      backgroundColor: "white",
      boxShadow: "2px 0 12px rgba(0,0,0,0.06)",
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
    brandText: {
      overflow: "hidden",
    },
    brandTitle: {
      fontSize: "0.8rem",
      fontWeight: "700",
      color: "#0f172a",
      whiteSpace: "nowrap",
      lineHeight: 1.2,
    },
    brandSub: {
      fontSize: "0.625rem",
      color: "#94a3b8",
      whiteSpace: "nowrap",
    },
    navSection: {
      flex: 1,
      padding: "1rem 0.5rem",
      overflowY: "auto",
    },
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "9px 12px",
      borderRadius: "9px",
      marginBottom: "2px",
      cursor: "pointer",
      backgroundColor: active ? NAVY : "transparent",
      color: active ? "white" : "#475569",
      fontSize: "0.875rem",
      fontWeight: active ? "600" : "400",
      border: "none",
      width: "100%",
      textAlign: "left",
      transition: "background-color 0.15s, color 0.15s",
    }),
    sidebarBottom: {
      padding: "0.75rem 0.5rem 1rem",
      borderTop: "1px solid #f1f5f9",
    },
    bottomBtn: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "9px 12px",
      borderRadius: "9px",
      marginBottom: "2px",
      cursor: "pointer",
      color: "#475569",
      fontSize: "0.875rem",
      fontWeight: "400",
      border: "none",
      backgroundColor: "transparent",
      width: "100%",
      textAlign: "left",
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
      fontWeight: "500",
      border: "none",
      backgroundColor: "#fff1f2",
      width: "100%",
      textAlign: "left",
      marginTop: "4px",
    },

    // MAIN AREA
    main: {
      marginLeft: "220px",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    },

    // TOP NAV
    topNav: {
      backgroundColor: "white",
      padding: "0 1.5rem",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #f1f5f9",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    },
    searchWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "9px",
      padding: "8px 14px",
      width: "280px",
    },
    searchInput: {
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      fontSize: "0.875rem",
      color: "#475569",
      width: "100%",
    },
    topNavRight: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    bellBtn: {
      position: "relative",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#64748b",
      display: "flex",
    },
    bellDot: {
      position: "absolute",
      top: "0",
      right: "0",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "#ef4444",
      border: "2px solid white",
    },
    // CONTENT
    content: {
      padding: "1.75rem",
      flex: 1,
    },
    welcome: {
      marginBottom: "1.75rem",
    },
    welcomeTitle: {
      fontSize: "1.625rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
      letterSpacing: "-0.02em",
    },
    welcomeSub: {
      fontSize: "0.875rem",
      color: "#64748b",
      marginTop: "4px",
    },

    // STAT CARDS
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1rem",
      marginBottom: "1.75rem",
    },
    statCard: () => ({
      backgroundColor: "white",
      borderRadius: "14px",
      padding: "1.25rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }),
    statIconBox: (bg) => ({
      width: "44px",
      height: "44px",
      borderRadius: "11px",
      backgroundColor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.25rem",
    }),
    statLabel: (color) => ({
      fontSize: "0.6875rem",
      fontWeight: "700",
      color,
      letterSpacing: "0.06em",
    }),
    statValue: {
      fontSize: "2rem",
      fontWeight: "800",
      color: "#0f172a",
      lineHeight: 1,
    },
    statSub: {
      fontSize: "0.8125rem",
      color: "#64748b",
    },
    statBadge: (color, bg) => ({
      display: "inline-block",
      backgroundColor: bg,
      color,
      fontSize: "0.625rem",
      fontWeight: "700",
      padding: "3px 8px",
      borderRadius: "20px",
      letterSpacing: "0.05em",
      alignSelf: "flex-start",
    }),

    // TWO COLUMN
    twoCol: {
      display: "grid",
      gridTemplateColumns: "65fr 35fr",
      gap: "1rem",
      alignItems: "flex-start",
    },

    // BOOKINGS PANEL
    panel: {
      backgroundColor: "white",
      borderRadius: "14px",
      padding: "1.25rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    panelHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "0.375rem",
    },
    panelTitle: {
      fontSize: "1rem",
      fontWeight: "700",
      color: "#0f172a",
      margin: 0,
    },
    panelSub: {
      fontSize: "0.8125rem",
      color: "#94a3b8",
      marginBottom: "1rem",
    },
    viewAllLink: {
      fontSize: "0.8125rem",
      color: "#3b82f6",
      textDecoration: "none",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      cursor: "pointer",
      border: "none",
      background: "none",
      padding: 0,
    },
    bookingCard: {
      display: "flex",
      gap: "14px",
      padding: "14px",
      borderRadius: "11px",
      border: "1px solid #f1f5f9",
      borderLeft: "3px solid #3b82f6",
      marginBottom: "10px",
      alignItems: "flex-start",
    },
    bookingDate: {
      fontSize: "0.6875rem",
      fontWeight: "700",
      color: "#3b82f6",
      backgroundColor: "#eff6ff",
      padding: "4px 8px",
      borderRadius: "6px",
      whiteSpace: "nowrap",
    },
    bookingTitle: {
      fontSize: "0.9375rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
      marginBottom: "2px",
    },
    bookingLoc: {
      fontSize: "0.8125rem",
      color: "#64748b",
    },
    bookingTime: {
      fontSize: "0.75rem",
      color: "#94a3b8",
      marginTop: "4px",
    },
    bookingBadge: (color, bg) => ({
      display: "inline-block",
      backgroundColor: bg,
      color,
      fontSize: "0.625rem",
      fontWeight: "700",
      padding: "2px 7px",
      borderRadius: "20px",
      letterSpacing: "0.05em",
      marginTop: "6px",
    }),

    // RIGHT PANELS
    rightCol: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    launchpad: {
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      borderRadius: "14px",
      padding: "1.25rem",
      color: "white",
    },
    launchpadTitle: {
      fontSize: "0.9375rem",
      fontWeight: "700",
      marginBottom: "0.25rem",
      color: "white",
    },
    launchpadSub: {
      fontSize: "0.8125rem",
      color: "rgba(255,255,255,0.65)",
      marginBottom: "1rem",
    },
    outlineBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: "10px 12px",
      backgroundColor: "transparent",
      border: "1.5px solid rgba(255,255,255,0.3)",
      borderRadius: "9px",
      color: "white",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      marginBottom: "8px",
      boxSizing: "border-box",
    },
    feedCard: {
      display: "flex",
      gap: "12px",
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "flex-start",
    },
    feedDot: (color) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: color,
      marginTop: "5px",
      flexShrink: 0,
    }),
    feedTitle: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#0f172a",
    },
    feedDesc: {
      fontSize: "0.8125rem",
      color: "#64748b",
      marginTop: "1px",
    },
    feedTime: {
      fontSize: "0.75rem",
      color: "#94a3b8",
      marginTop: "2px",
    },

    // FAB
    fab: {
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      border: "none",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 20px rgba(26,58,107,0.45)",
      zIndex: 200,
    },
  };

  return (
    <div style={layout.root}>
      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <Sidebar activeId="dashboard" />

      {/* ── MAIN ───────────────────────────────────────────────────── */}
      <main style={layout.main}>
        {/* Top Navbar */}
        <header style={layout.topNav}>
          <div style={layout.searchWrapper}>
            <Search size={15} color="#94a3b8" />
            <input
              style={layout.searchInput}
              placeholder="Search operations..."
              aria-label="Search operations"
            />
          </div>
          <div style={layout.topNavRight}>
            <button style={layout.bellBtn} aria-label="Notifications">
              <Bell size={20} color="#64748b" />
              <span style={layout.bellDot} />
            </button>
            <ProfileDropdown />
          </div>
        </header>

        {/* Content */}
        <div style={layout.content}>
          {/* Welcome */}
          <div style={layout.welcome}>
            <h1 style={layout.welcomeTitle}>Welcome back, {user?.name || "User"}!</h1>
            <p style={layout.welcomeSub}>University Operations Platform</p>
          </div>

          {/* Stat Cards */}
          <div style={layout.statsRow}>
            {getDynamicStats(resourceCount).map((st) => (
              <div key={st.label} style={layout.statCard()}>
                <div style={layout.statIconBox(st.bg)}>{st.emoji}</div>
                <span style={layout.statLabel(st.color)}>{st.label}</span>
                <span style={layout.statValue}>{st.value}</span>
                <span style={layout.statSub}>{st.sub}</span>
                {st.badge && (
                  <span style={layout.statBadge(st.badge.color, st.badge.bg)}>
                    {st.badge.text}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Two Columns */}
          <div style={layout.twoCol}>
            {/* LEFT – Bookings */}
            <div style={layout.panel}>
              <div style={layout.panelHeader}>
                <div>
                  <p style={layout.panelTitle}>Your Priority Bookings</p>
                </div>
                <button style={layout.viewAllLink}>
                  View All Schedule <ChevronRight size={14} />
                </button>
              </div>
              <p style={layout.panelSub}>Confirmed reservations for academic activities</p>

              {BOOKINGS.map((b) => (
                <div key={b.title} style={layout.bookingCard}>
                  <span style={layout.bookingDate}>{b.date}</span>
                  <div>
                    <p style={layout.bookingTitle}>{b.title}</p>
                    <span style={layout.bookingLoc}>{b.location}</span>
                    <p style={layout.bookingTime}>{b.time}</p>
                    <span style={layout.bookingBadge(b.badgeColor, b.badgeBg)}>
                      {b.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div style={layout.rightCol}>
              {/* Operations Launchpad */}
              <div style={layout.launchpad}>
                <p style={layout.launchpadTitle}>Operations Launchpad</p>
                <p style={layout.launchpadSub}>Quick access to core functions</p>
                <button style={layout.outlineBtn}>
                  Book a Room <ArrowRight size={15} />
                </button>
                <button style={{ ...layout.outlineBtn, marginBottom: 0 }} onClick={() => navigate("/resources")}>
                  Browse Catalog <ArrowRight size={15} />
                </button>
              </div>

              {/* System Feed */}
              <div style={layout.panel}>
                <p style={layout.panelTitle}>System Feed</p>
                {FEED.map((f) => (
                  <div key={f.title} style={layout.feedCard}>
                    <div style={layout.feedDot(f.dotColor)} />
                    <div>
                      <p style={layout.feedTitle}>{f.title}</p>
                      <p style={layout.feedDesc}>{f.desc}</p>
                      <p style={layout.feedTime}>{f.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button style={layout.fab} aria-label="New action">
        <Plus size={22} />
      </button>
    </div>
  );
};

export default DashboardPage;
