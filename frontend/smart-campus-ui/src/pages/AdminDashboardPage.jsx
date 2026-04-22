import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import {
  Search,
  Bell,
  Box,
  Users,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Loader2,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByWeek(bookings) {
  const weekMap = {};
  bookings.forEach((b) => {
    if (!b.bookingDate) return;
    const d = new Date(b.bookingDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    const weekOfMonth = Math.ceil(d.getDate() / 7);
    const sortKey = `${year}-${String(month).padStart(2, "0")}-${weekOfMonth}`;
    const label   = `${d.toLocaleString("default", { month: "short" })} W${weekOfMonth}`;
    if (!weekMap[sortKey]) weekMap[sortKey] = { week: label, bookings: 0 };
    weekMap[sortKey].bookings += 1;
  });
  return Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([, v]) => v);
}

function bookingToActivity(b) {
  const statusMap = {
    PENDING:   { icon: Clock3,       color: "#CA8A04", bg: "#FEF9C3", label: "Pending" },
    APPROVED:  { icon: CheckCircle2, color: "#16A34A", bg: "#DCFCE7", label: "Approved" },
    REJECTED:  { icon: XCircle,      color: "#DC2626", bg: "#FEE2E2", label: "Rejected" },
    CANCELLED: { icon: AlertCircle,  color: "#64748B", bg: "#F1F5F9", label: "Cancelled" },
  };
  const cfg = statusMap[b.status] || statusMap.PENDING;
  const rawPurpose = b.purpose || "";
  const purpose = rawPurpose.length > 40 ? rawPurpose.substring(0, 40) + "…" : rawPurpose;
  
  return {
    ...b,
    icon: cfg.icon,
    iconColor: cfg.color,
    iconBg: cfg.bg,
    statusLabel: cfg.label,
    displayPurpose: purpose
  };
}

// ── AdminDashboardPage ────────────────────────────────────────────────────────

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalResources: null,
    totalBookings: null,
    pendingApprovals: null,
    activeUsers: null,
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [resourcesRes, bookingsRes, usersRes] = await Promise.allSettled([
          axiosInstance.get("/api/resources"),
          axiosInstance.get("/api/bookings"),
          axiosInstance.get("/api/admin/users"),
        ]);

        const resources = resourcesRes.status === "fulfilled" ? resourcesRes.value.data : [];
        const bookings  = bookingsRes.status  === "fulfilled" ? bookingsRes.value.data  : [];
        const usersData = usersRes.status     === "fulfilled" ? usersRes.value.data     : [];

        let activeUsersCount = 0;
        if (Array.isArray(usersData)) activeUsersCount = usersData.length;
        else if (usersData?.totalElements != null) activeUsersCount = usersData.totalElements;
        else if (Array.isArray(usersData?.content)) activeUsersCount = usersData.content.length;

        const pending = bookings.filter(b => b.status === "PENDING");

        setStats({
          totalResources: Array.isArray(resources) ? resources.length : 0,
          totalBookings: Array.isArray(bookings) ? bookings.length : 0,
          pendingApprovals: pending.length,
          activeUsers: activeUsersCount,
        });

        setChartData(groupByWeek(bookings));

        const sorted = [...bookings].sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRecentActivity(sorted.slice(0, 5).map(bookingToActivity));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const styles = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: {
      height: "64px",
      backgroundColor: "white",
      borderBottom: "1px solid #E2E8F0",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    },
    searchBox: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "#F1F5F9",
      padding: "8px 16px",
      borderRadius: "999px",
      width: "320px",
    },
    searchInput: {
      border: "none",
      background: "none",
      outline: "none",
      fontSize: "14px",
      width: "100%",
    },
    content: { padding: "32px", flex: 1 },
    pageTitle: { fontSize: "24px", fontWeight: "700", color: "#0F172A", marginBottom: "8px" },
    pageSub: { fontSize: "14px", color: "#64748B", marginBottom: "32px" },
    
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "24px",
      marginBottom: "32px",
    },
    statCard: (color) => ({
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      borderBottom: `3px solid ${color}`,
    }),
    statIconBox: (bg, color) => ({
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      backgroundColor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: color,
    }),
    statLabel: { fontSize: "13px", fontWeight: "500", color: "#64748B" },
    statValue: { fontSize: "32px", fontWeight: "700", color: "#0F172A", lineHeight: 1 },

    mainGrid: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" },
    panel: {
      backgroundColor: "white",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      padding: "24px",
    },
    panelHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    panelTitle: { fontSize: "16px", fontWeight: "600", color: "#0F172A" },
    
    activityItem: {
      display: "flex",
      gap: "16px",
      padding: "16px 0",
      borderBottom: "1px solid #F1F5F9",
      alignItems: "flex-start",
    },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: 0 },
    activityDesc: { fontSize: "13px", color: "#64748B", marginTop: "2px" },
    activityTime: { fontSize: "12px", color: "#94A3B8", marginTop: "4px" },
  };

  const STATS_CONFIG = [
    { label: "Total Resources", key: "totalResources", icon: Box, color: "#0EA5E9", bg: "#E0F2FE" },
    { label: "Active User Count", key: "activeUsers", icon: Users, color: "#10B981", bg: "#D1FAE5" },
    { label: "Total Bookings", key: "totalBookings", icon: CalendarDays, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Pending Approvals", key: "pendingApprovals", icon: AlertCircle, color: "#EF4444", bg: "#FEE2E2" },
  ];

  return (
    <div style={styles.root}>
      <Sidebar activeId="dashboard" />
      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94A3B8" />
            <input style={styles.searchInput} placeholder="Search anything..." />
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><Bell size={20} /></button>
            <ProfileDropdown />
          </div>
        </header>

        <div style={styles.content}>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.pageSub}>Real-time campus operations and resource metrics.</p>

          <div style={styles.statsGrid}>
            {STATS_CONFIG.map((cfg) => (
              <div key={cfg.label} style={styles.statCard(cfg.color)}>
                <div style={styles.statIconBox(cfg.bg, cfg.color)}><cfg.icon size={20} /></div>
                <div style={styles.statLabel}>{cfg.label}</div>
                <div style={styles.statValue}>
                  {loading ? "..." : (stats[cfg.key] ?? 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.mainGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingUp size={20} color="#0EA5E9" />
                  <span style={styles.panelTitle}>Booking Trends</span>
                </div>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>Weekly reservation volume</span>
              </div>
              <div style={{ height: "320px", marginTop: "24px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="bookings" radius={[4, 4, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "#0EA5E9" : "#E2E8F0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <span style={styles.panelTitle}>Recent Activity</span>
                <button 
                  onClick={() => navigate("/admin/bookings")}
                  style={{ background: "none", border: "none", color: "#0EA5E9", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>
              <div>
                {loading ? (
                   <div style={{ textAlign: "center", padding: "40px" }}><Loader2 className="animate-spin" color="#0EA5E9" /></div>
                ) : recentActivity.length === 0 ? (
                   <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8", fontSize: "14px" }}>No recent activity</div>
                ) : recentActivity.map((item) => (
                  <div key={item.id} style={styles.activityItem}>
                    <div style={{ 
                      width: "32px", height: "32px", borderRadius: "50%", 
                      backgroundColor: item.iconBg, color: item.iconColor,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      <item.icon size={16} />
                    </div>
                    <div style={styles.activityInfo}>
                      <p style={styles.activityTitle}>{item.resourceName}</p>
                      <p style={styles.activityDesc}>
                        <span style={{ fontWeight: "600", color: item.iconColor }}>{item.statusLabel}</span> · {item.userName}
                      </p>
                      <p style={styles.activityTime}>{new Date(item.createdAt || item.bookingDate).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
