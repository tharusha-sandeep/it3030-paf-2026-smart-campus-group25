import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Box,
  CalendarDays,
  Clock,
  ArrowRight,
  ChevronRight,
  Plus,
  Loader2,
  Package,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    upcomingCount: 0,
    availableResources: 0,
    systemAlerts: 0
  });
  const [priorityBookings, setPriorityBookings] = useState([]);
  const [systemFeed, setSystemFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resourcesRes, bookingsRes] = await Promise.all([
          axiosInstance.get("/api/resources"),
          axiosInstance.get("/api/bookings/my")
        ]);

        const today = new Date().toISOString().split('T')[0];
        const activeResources = resourcesRes.data.filter(r => r.status === 'ACTIVE');
        const allMyBookings = bookingsRes.data || [];
        const upcoming = allMyBookings.filter(b => 
          b.status === 'APPROVED' && b.bookingDate >= today
        );

        setStats({
          upcomingCount: upcoming.length,
          availableResources: activeResources.length,
          systemAlerts: 0
        });

        const sortedUpcoming = [...upcoming].sort((a, b) => 
          a.bookingDate.localeCompare(b.bookingDate)
        ).slice(0, 3);
        setPriorityBookings(sortedUpcoming);

        const sortedFeed = [...allMyBookings].sort((a, b) => 
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        ).slice(0, 5);
        setSystemFeed(sortedFeed);

      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    content: { padding: "32px", flex: 1 },
    welcomeTitle: { fontSize: "24px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" },
    welcomeSub: { fontSize: "14px", color: "#64748B", marginBottom: "32px" },
    
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "24px",
      marginBottom: "32px",
    },
    statCard: (color) => ({
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      borderBottom: `3px solid ${color}`,
    }),
    statIconBox: (bg, color) => ({
      width: "36px", height: "36px", borderRadius: "8px", 
      backgroundColor: bg, color: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: "16px"
    }),
    statValue: { fontSize: "32px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" },
    statLabel: { fontSize: "13px", fontWeight: "500", color: "#64748B" },

    twoCol: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" },
    panel: {
      backgroundColor: "white",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    },
    panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    panelTitle: { fontSize: "16px", fontWeight: "600", color: "#0F172A" },
    
    bookingCard: {
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid #E2E8F0",
      backgroundColor: "white",
      marginBottom: "12px",
      display: "flex",
      gap: "16px",
      alignItems: "center",
    },
    dateBox: {
      width: "48px",
      height: "48px",
      borderRadius: "8px",
      backgroundColor: "#F1F5F9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #E2E8F0"
    },
    dateDay: { fontSize: "16px", fontWeight: "700", color: "#0F172A" },
    dateMonth: { fontSize: "10px", fontWeight: "700", color: "#64748B", textTransform: "uppercase" },

    launchpad: {
      background: "#0F172A", // Dark navy
      borderRadius: "12px",
      padding: "24px",
      color: "white",
      marginBottom: "24px",
    },
    primaryBtn: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      backgroundColor: "#1E293B",
      border: "1px solid #334155",
      borderRadius: "8px",
      color: "white",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      marginBottom: "8px",
      transition: "all 0.2s"
    },
    fab: {
      position: "fixed", bottom: "32px", right: "32px",
      width: "56px", height: "56px", borderRadius: "50%",
      backgroundColor: "#0EA5E9", color: "white",
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.4)",
      zIndex: 200,
    }
  };

  const getStatusStyle = (status) => {
    const maps = {
      APPROVED: { color: "#16A34A", bg: "#DCFCE7", text: "Approved" },
      PENDING: { color: "#CA8A04", bg: "#FEF9C3", text: "Pending" },
      REJECTED: { color: "#DC2626", bg: "#FEE2E2", text: "Rejected" },
      CANCELLED: { color: "#64748B", bg: "#F1F5F9", text: "Cancelled" }
    };
    return maps[status] || maps.PENDING;
  };

  return (
    <div style={styles.root}>
      <Sidebar activeId="dashboard" />
      <main style={styles.main}>
        <header style={styles.header}>
           <div style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#F1F5F9", padding: "8px 16px", borderRadius: "999px", width: "320px"}}>
             <Search size={16} color="#94A3B8" />
             <input style={{ border: "none", background: "none", outline: "none", fontSize: "14px", width: "100%" }} placeholder="Search bookings..." />
           </div>
           <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><Bell size={20} /></button>
             <ProfileDropdown />
           </div>
        </header>

        <div style={styles.content}>
          <div className="animate-fade-in">
            <h1 style={styles.welcomeTitle}>Welcome back, {user?.name || "User"}</h1>
            <p style={styles.welcomeSub}>Explore the Smart Campus ecosystem.</p>
          </div>

          {loading ? (
             <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}><Loader2 size={40} className="animate-spin" color="#0EA5E9" /></div>
          ) : (
            <>
              <div style={styles.statsGrid}>
                <div style={styles.statCard("#0EA5E9")}>
                  <div style={styles.statIconBox("#E0F2FE", "#0EA5E9")}><CalendarDays size={20} /></div>
                  <div style={styles.statValue}>{stats.upcomingCount}</div>
                  <div style={styles.statLabel}>Upcoming Bookings</div>
                </div>
                <div style={styles.statCard("#10B981")}>
                  <div style={styles.statIconBox("#D1FAE5", "#10B981")}><Box size={20} /></div>
                  <div style={styles.statValue}>{stats.availableResources}</div>
                  <div style={styles.statLabel}>Available Resources</div>
                </div>
                <div style={styles.statCard("#64748B")}>
                  <div style={styles.statIconBox("#F1F5F9", "#64748B")}><AlertCircle size={20} /></div>
                  <div style={styles.statValue}>{stats.systemAlerts}</div>
                  <div style={styles.statLabel}>System Health</div>
                </div>
              </div>

              <div style={styles.twoCol}>
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <p style={styles.panelTitle}>Priority Schedule</p>
                    <button style={{ background: "none", border: "none", color: "#0EA5E9", fontSize: "13px", fontWeight: "600", cursor: "pointer" }} onClick={() => navigate("/bookings")}>
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  {priorityBookings.length > 0 ? (
                    priorityBookings.map((b) => {
                      const d = new Date(b.bookingDate);
                      return (
                        <div key={b.id} style={styles.bookingCard}>
                          <div style={styles.dateBox}>
                            <span style={styles.dateDay}>{d.getDate()}</span>
                            <span style={styles.dateMonth}>{d.toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <p style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: 0 }}>{b.resourceName}</p>
                              <span className="badge badge-approved">Approved</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748B" }}>
                                <Clock size={12} /> {b.startTime} - {b.endTime}
                              </div>
                              <div style={{ fontSize: "12px", color: "#94A3B8" }}>· {b.resourceLocation || "Main Campus"}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>No upcoming bookings soon.</div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={styles.launchpad}>
                    <p style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Launchpad</p>
                    <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "20px" }}>Fast-track your requests.</p>
                    <button style={styles.primaryBtn} onClick={() => navigate("/bookings")}>
                      Book a Room <ArrowRight size={14} />
                    </button>
                    <button style={{ ...styles.primaryBtn, marginBottom: 0 }} onClick={() => navigate("/resources")}>
                      Browse Assets <ArrowRight size={14} />
                    </button>
                  </div>

                  <div style={styles.panel}>
                     <p style={{ ...styles.panelTitle, marginBottom: "20px" }}>Activity Feed</p>
                     {systemFeed.length > 0 ? systemFeed.map(f => {
                       const st = getStatusStyle(f.status);
                       return (
                         <div key={f.id} style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: st.color, marginTop: "6px" }} />
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "#0F172A", margin: 0 }}>{f.resourceName}</p>
                              <p style={{ fontSize: "12px", color: "#64748B" }}>Status set to <span style={{ color: st.color, fontWeight: "600" }}>{st.text}</span></p>
                            </div>
                         </div>
                       );
                     }) : (
                       <div style={{ textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>No recent records.</div>
                     )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <button style={styles.fab} onClick={() => navigate("/bookings")} title="New Booking">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default DashboardPage;
