import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Ticket,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ShieldCheck,
  Bell,
  TrendingUp,
  Box,
  AlertTriangle,
  Download,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserPlus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";

const NAVY = "#1a3a6b";
const NAVY_DARK = "#0f2447";


// ── Booking trend data ────────────────────────────────────────────────────────
const CHART_DATA = [
  { week: "Week 1", bookings: 320 },
  { week: "Week 2", bookings: 480 },
  { week: "Week 3", bookings: 390 },
  { week: "Week 4", bookings: 520 },
  { week: "Week 5", bookings: 710 },
  { week: "Week 6", bookings: 430 },
  { week: "Week 7", bookings: 590 },
  { week: "Week 8", bookings: 620 },
];
const PEAK_WEEK = 5; // 0-indexed: Week 5 is the navy peak bar

// ── Recent activity feed ──────────────────────────────────────────────────────
const ACTIVITY = [
  {
    icon: UserPlus,
    iconColor: NAVY,
    iconBg: "#e8edf7",
    title: "Dr. Helena Vance registered",
    desc: "Applied for Science Wing access",
    time: "2 mins ago",
  },
  {
    icon: CheckCircle2,
    iconColor: "#16a34a",
    iconBg: "#dcfce7",
    title: "Lab 402 booking confirmed",
    desc: "Approved by Central Admin",
    time: "15 mins ago",
  },
  {
    icon: AlertCircle,
    iconColor: "#f97316",
    iconBg: "#ffedd5",
    title: "Maintenance alert",
    desc: "HVAC system in Library requires attention",
    time: "45 mins ago",
  },
  {
    icon: FileText,
    iconColor: "#3b82f6",
    iconBg: "#eff6ff",
    title: "New booking request",
    desc: "Auditorium A for Open Day 2024",
    time: "1 hour ago",
  },
];

// ── Custom tooltip for bar chart ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const isPeak = label === "Week 5";
  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "8px 14px",
      fontSize: "0.8125rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      <p style={{ fontWeight: "700", color: NAVY, margin: 0 }}>
        {isPeak ? "⭐ Current Peak" : label}
      </p>
      <p style={{ color: "#475569", margin: "2px 0 0" }}>{payload[0].value} bookings</p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name ? user.name[0].toUpperCase() : "A";
  const [resourceCount, setResourceCount] = useState("...");
  const [chartView, setChartView] = useState("month");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axiosInstance.get("/api/resources");
        setResourceCount(res.data.length.toString());
      } catch (err) {
        console.error("Failed to load resource count", err);
      }
    };
    fetchResources();
  }, []);

  // ── Stat cards config ────────────────────────────────────────────────────────
  const STATS = [
    {
      icon: Box,
      iconColor: "#3b82f6",
      iconBg: "#eff6ff",
      label: "TOTAL RESOURCES",
      value: resourceCount,
      badge: { text: "+4.2%", color: "#16a34a", bg: "#dcfce7" },
    },
    {
      icon: CalendarDays,
      iconColor: "#6366f1",
      iconBg: "#eef2ff",
      label: "TOTAL BOOKINGS",
      value: "1,520",
      badge: { text: "+12.8%", color: "#16a34a", bg: "#dcfce7" },
    },
    {
      icon: AlertTriangle,
      iconColor: "#f97316",
      iconBg: "#fff7ed",
      label: "PENDING APPROVALS",
      value: "12 items",
      badge: { text: "Urgent", color: "#ea580c", bg: "#ffedd5" },
    },
    {
      icon: Users,
      iconColor: NAVY,
      iconBg: "#e8edf7",
      label: "ACTIVE USERS",
      value: "85",
      avatars: ["#6366f1", "#3b82f6", "#f97316"],
    },
  ];

  // ── Styles ───────────────────────────────────────────────────────────────────
  const s = {
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
      top: 0, left: 0,
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
    brandTitle: { fontSize: "0.8rem", fontWeight: "700", color: "#0f172a", lineHeight: 1.2 },
    brandSub: { fontSize: "0.625rem", color: "#94a3b8" },
    navSection: { flex: 1, padding: "1rem 0.5rem", overflowY: "auto" },
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
    navDivider: { height: "1px", backgroundColor: "#f1f5f9", margin: "8px 0.5rem" },
    sidebarBottom: { padding: "0.75rem 0.5rem 1rem", borderTop: "1px solid #f1f5f9" },
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

    // MAIN
    main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },

    // TOPNAV
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
      gap: "1rem",
    },
    searchWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "9px",
      padding: "8px 14px",
      width: "240px",
    },
    searchInput: {
      border: "none", outline: "none",
      backgroundColor: "transparent",
      fontSize: "0.875rem",
      color: "#475569",
      width: "100%",
    },
    topNavRight: { display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" },
    exportBtn: {
      display: "flex", alignItems: "center", gap: "6px",
      padding: "8px 14px",
      borderRadius: "9px",
      border: "1.5px solid #e2e8f0",
      backgroundColor: "white",
      color: "#374151",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
    },
    newResourceBtn: {
      display: "flex", alignItems: "center", gap: "6px",
      padding: "8px 14px",
      borderRadius: "9px",
      border: "none",
      backgroundColor: NAVY,
      color: "white",
      fontSize: "0.875rem",
      fontWeight: "600",
      cursor: "pointer",
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
      top: 0, right: 0,
      width: "8px", height: "8px",
      borderRadius: "50%",
      backgroundColor: "#ef4444",
      border: "2px solid white",
    },
    adminAvatar: {
      width: "36px", height: "36px",
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: "700", fontSize: "0.875rem",
      cursor: "pointer", userSelect: "none",
    },

    // CONTENT
    content: { padding: "1.75rem", flex: 1 },
    pageTitle: { fontSize: "1.625rem", fontWeight: "700", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" },
    pageSub: { fontSize: "0.875rem", color: "#64748b", marginTop: "4px", marginBottom: "1.75rem" },

    // STAT CARDS
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1rem",
      marginBottom: "1.75rem",
    },
    statCard: {
      backgroundColor: "white",
      borderRadius: "14px",
      padding: "1.25rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    statIconBox: (bg) => ({
      width: "42px", height: "42px",
      borderRadius: "11px",
      backgroundColor: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: "12px",
    }),
    statLabel: {
      fontSize: "0.6875rem", fontWeight: "700",
      color: "#94a3b8", letterSpacing: "0.06em",
      marginBottom: "4px",
    },
    statValue: {
      fontSize: "1.875rem", fontWeight: "800",
      color: "#0f172a", lineHeight: 1,
      marginBottom: "10px",
    },
    statBadge: (color, bg) => ({
      display: "inline-block",
      backgroundColor: bg, color,
      fontSize: "0.6875rem", fontWeight: "700",
      padding: "3px 8px", borderRadius: "20px",
      letterSpacing: "0.04em",
    }),
    miniAvatars: { display: "flex" },
    miniAvatar: (bg, index) => ({
      width: "24px", height: "24px",
      borderRadius: "50%",
      backgroundColor: bg,
      border: "2px solid white",
      marginLeft: index === 0 ? 0 : "-8px",
    }),

    // TWO COL
    twoCol: {
      display: "grid",
      gridTemplateColumns: "65fr 35fr",
      gap: "1rem",
      alignItems: "flex-start",
    },

    // PANELS
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
      marginBottom: "0.25rem",
    },
    panelTitle: { fontSize: "1rem", fontWeight: "700", color: "#0f172a", margin: 0 },
    panelSub: { fontSize: "0.8125rem", color: "#94a3b8", marginBottom: "1.25rem" },

    // CHART TOGGLE
    toggleGroup: { display: "flex", gap: "4px" },
    toggleBtn: (active) => ({
      padding: "5px 12px",
      borderRadius: "7px",
      border: active ? "none" : "1px solid #e2e8f0",
      backgroundColor: active ? NAVY : "white",
      color: active ? "white" : "#64748b",
      fontSize: "0.75rem",
      fontWeight: "500",
      cursor: "pointer",
    }),

    // ACTIVITY
    activityItem: {
      display: "flex",
      gap: "12px",
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "flex-start",
    },
    activityIconBox: (bg) => ({
      width: "34px", height: "34px",
      borderRadius: "9px",
      backgroundColor: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }),
    activityTitle: { fontSize: "0.875rem", fontWeight: "600", color: "#0f172a", margin: 0 },
    activityDesc: { fontSize: "0.8125rem", color: "#64748b", marginTop: "1px" },
    activityTime: { fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" },
    viewLogBtn: {
      width: "100%",
      marginTop: "1rem",
      padding: "10px",
      borderRadius: "9px",
      border: "1.5px solid #e2e8f0",
      backgroundColor: "white",
      color: "#374151",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      boxSizing: "border-box",
    },
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="dashboard" />

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main style={s.main}>
        {/* Top Navbar */}
        <header style={s.topNav}>
          <div style={s.searchWrapper}>
            <Search size={15} color="#94a3b8" />
            <input
              style={s.searchInput}
              placeholder="Search operations..."
              aria-label="Search operations"
            />
          </div>

          <div style={s.topNavRight}>
            <button style={s.newResourceBtn} onClick={() => navigate("/resources")}>
              <Plus size={15} /> New Resource
            </button>
            <button style={s.bellBtn} aria-label="Notifications">
              <Bell size={20} color="#64748b" />
              <span style={s.bellDot} />
            </button>
            <div style={s.adminAvatar}>{initials}</div>
          </div>
        </header>

        {/* Content */}
        <div style={s.content}>
          <h1 style={s.pageTitle}>Campus Overview</h1>
          <p style={s.pageSub}>Real-time operational intelligence for the main campus sector.</p>

          {/* Stat Cards */}
          <div style={s.statsRow}>
            {STATS.map((st) => {
              const StatIcon = st.icon;
              return (
                <div key={st.label} style={s.statCard}>
                  <div style={s.statIconBox(st.iconBg)}>
                    <StatIcon size={20} color={st.iconColor} strokeWidth={2} />
                  </div>
                  <p style={s.statLabel}>{st.label}</p>
                  <p style={s.statValue}>{st.value}</p>
                  {st.badge && (
                    <span style={s.statBadge(st.badge.color, st.badge.bg)}>
                      {st.badge.text}
                    </span>
                  )}
                  {st.avatars && (
                    <div style={s.miniAvatars}>
                      {st.avatars.map((color, i) => (
                        <div key={i} style={s.miniAvatar(color, i)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Two Column */}
          <div style={s.twoCol}>
            {/* LEFT – Chart */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <div>
                  <p style={s.panelTitle}>Booking Trends</p>
                </div>
                <div style={s.toggleGroup}>
                  <button
                    style={s.toggleBtn(chartView === "month")}
                    onClick={() => setChartView("month")}
                  >Month</button>
                  <button
                    style={s.toggleBtn(chartView === "week")}
                    onClick={() => setChartView("week")}
                  >Week</button>
                </div>
              </div>
              <p style={s.panelSub}>Resource utilization over the last 30 days.</p>

              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={CHART_DATA} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 800]}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                    {CHART_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === PEAK_WEEK ? NAVY : "#e2e8f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* RIGHT – Activity */}
            <div style={s.panel}>
              <p style={s.panelTitle}>Recent Activity</p>
              <p style={{ ...s.panelSub, marginBottom: "0.25rem" }}> </p>

              {ACTIVITY.map((item) => {
                const AIcon = item.icon;
                return (
                  <div key={item.title} style={s.activityItem}>
                    <div style={s.activityIconBox(item.iconBg)}>
                      <AIcon size={16} color={item.iconColor} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={s.activityTitle}>{item.title}</p>
                      <p style={s.activityDesc}>{item.desc}</p>
                      <p style={s.activityTime}>{item.time}</p>
                    </div>
                  </div>
                );
              })}

              <button style={s.viewLogBtn}>View Full Audit Log</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
