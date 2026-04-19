import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Ticket,
  Users,
  LogOut,
  Search,
  ShieldCheck,
  UserPlus,
  Shield,
  User,
  Mail,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAVY = "#1e3a5f";
const NAVY_DARK = "#122a47";

const UsersPage = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const initials = currentUser?.name ? currentUser.name[0].toUpperCase() : "A";

  // Data State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterProvider, setFilterProvider] = useState("");

  // Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await axiosInstance.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      setError(true);
      toast.error("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.patch(`/api/admin/users/${userId}/status`, { enabled: !currentStatus });
      toast.success("User status updated!");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user status.");
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await axiosInstance.patch(`/api/admin/users/${selectedUser.id}/role`, { role: newRole });
      toast.success("Role updated successfully!");
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const openRoleModal = (u) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setShowRoleModal(true);
  };

  const handleNav = (path) => navigate(path);

  // Derived Stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === "ADMIN").length,
      regulars: users.filter(u => u.role === "USER").length,
      google: users.filter(u => u.authProvider === "GOOGLE").length
    };
  }, [users]);

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "" || u.role === filterRole;
      const matchesProvider = filterProvider === "" || u.authProvider === filterProvider;
      return matchesSearch && matchesRole && matchesProvider;
    });
  }, [users, searchTerm, filterRole, filterProvider]);

  // Styles
  const s = {
    root: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#f8fafc" },
    sidebar: { width: "220px", minWidth: "220px", backgroundColor: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 },
    main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
    sidebarBrand: { padding: "1.25rem 1rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px" },
    brandIconBox: { width: "34px", height: "34px", borderRadius: "9px", background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    brandTitle: { fontSize: "0.8rem", fontWeight: "700", color: "#0f172a", lineHeight: 1.2 },
    brandSub: { fontSize: "0.625rem", color: "#94a3b8" },
    navSection: { flex: 1, padding: "1rem 0.5rem", overflowY: "auto" },
    navItem: (active) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "9px", marginBottom: "2px", cursor: "pointer", backgroundColor: active ? NAVY : "transparent", color: active ? "white" : "#475569", fontSize: "0.875rem", fontWeight: active ? "600" : "500", border: "none", width: "100%", textAlign: "left", transition: "all 0.2s" }),
    logoutBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "9px", cursor: "pointer", color: "#ef4444", fontSize: "0.875rem", fontWeight: "600", border: "none", backgroundColor: "#fef2f2", width: "100%", textAlign: "left", margin: "0.75rem 0.5rem 1rem" },
    topNav: { backgroundColor: "white", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "flex-end", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 },
    avatar: { width: "36px", height: "36px", borderRadius: "50%", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "0.875rem" },
    content: { padding: "2rem", flex: 1, maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" },
    pageHeader: { marginBottom: "2rem" },
    pageTitle: { fontSize: "1.875rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.03em" },
    pageSub: { fontSize: "1rem", color: "#64748b", marginTop: "6px" },
    statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" },
    statCard: { backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "1rem" },
    statIcon: (bg, color) => ({ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center" }),
    statLabel: { fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.025em" },
    statValue: { fontSize: "1.5rem", fontWeight: "800", color: "#0f172a" },
    filterBar: { display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" },
    searchBox: { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "white", border: "1px solid #e2e8f0", padding: "0 1rem", borderRadius: "10px", flex: 1, minWidth: "250px", height: "44px" },
    searchInput: { border: "none", outline: "none", flex: 1, fontSize: "0.9375rem" },
    select: { height: "44px", padding: "0 12px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", outline: "none", cursor: "pointer", fontSize: "0.875rem", color: "#475569", fontWeight: "500", minWidth: "150px" },
    tableContainer: { backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    th: { padding: "1rem 1.5rem", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" },
    td: { padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
    badge: (bg, color) => ({ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: bg, color: color }),
    providerIcon: (google) => ({ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: google ? "#ea4335" : "#64748b", fontWeight: "600" }),
    actionBtn: { padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "white", color: "#475569", fontSize: "0.8125rem", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
    toggle: (active) => ({ width: "40px", height: "20px", borderRadius: "20px", backgroundColor: active ? "#22c55e" : "#cbd5e1", position: "relative", cursor: "pointer", transition: "background 0.3s" }),
    toggleCircle: (active) => ({ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "white", position: "absolute", top: "3px", left: active ? "23px" : "3px", transition: "left 0.3s" }),
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "white", borderRadius: "16px", width: "400px", maxWidth: "90%", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },
    modalTitle: { margin: "0 0 1.5rem 0", fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" },
    formGroup: { marginBottom: "1.5rem" },
    label: { display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#475569" },
    btnPrimary: { width: "100%", padding: "10px", borderRadius: "10px", border: "none", backgroundColor: NAVY, color: "white", fontWeight: "700", cursor: "pointer" },
    btnSecondary: { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontWeight: "600", cursor: "pointer", marginTop: "10px" },
    skeletonHeader: { height: "40px", backgroundColor: "#f1f5f9", margin: "1rem 1.5rem", borderRadius: "8px" },
    skeletonRow: { height: "60px", backgroundColor: "#f8fafc", margin: "0.5rem 1.5rem", borderRadius: "8px" },
  };

  return (
    <div style={s.root}>
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarBrand}>
          <div style={s.brandIconBox}><ShieldCheck size={18} color="white" /></div>
          <div><div style={s.brandTitle}>Smart Campus Hub</div><div style={s.brandSub}>Operations Platform</div></div>
        </div>
        <nav style={s.navSection}>
          <button style={s.navItem(false)} onClick={() => handleNav("/admin/dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button style={s.navItem(false)} onClick={() => handleNav("/resources")}>
            <Package size={18} /> Resources
          </button>
          <button style={s.navItem(true)}>
            <Users size={18} /> Users
          </button>
          <button style={s.navItem(false)}><CalendarDays size={18} /> Bookings</button>
          <button style={s.navItem(false)}><Ticket size={18} /> Tickets</button>
        </nav>
        <button style={s.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main style={s.main}>
        <header style={s.topNav}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={s.avatar}>{initials}</div>
          </div>
        </header>

        <div style={s.content}>
          <div style={s.pageHeader}>
            <h1 style={s.pageTitle}>User Management</h1>
            <p style={s.pageSub}>Manage system users and their roles</p>
          </div>

          {/* STATS */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <div style={s.statIcon("#eff6ff", "#3b82f6")}><Users size={24} /></div>
              <div><div style={s.statLabel}>Total Users</div><div style={s.statValue}>{stats.total}</div></div>
            </div>
            <div style={s.statCard}>
              <div style={s.statIcon("#f5f3ff", "#8b5cf6")}><Shield size={24} /></div>
              <div><div style={s.statLabel}>Admins</div><div style={s.statValue}>{stats.admins}</div></div>
            </div>
            <div style={s.statCard}>
              <div style={s.statIcon("#f0fdf4", "#22c55e")}><User size={24} /></div>
              <div><div style={s.statLabel}>Regular</div><div style={s.statValue}>{stats.regulars}</div></div>
            </div>
            <div style={s.statCard}>
              <div style={s.statIcon("#fff7ed", "#f97316")}><Mail size={24} /></div>
              <div><div style={s.statLabel}>Google Auth</div><div style={s.statValue}>{stats.google}</div></div>
            </div>
          </div>

          {/* FILTERS */}
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={18} color="#94a3b8" />
              <input 
                style={s.searchInput} 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select style={s.select} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
            <select style={s.select} value={filterProvider} onChange={e => setFilterProvider(e.target.value)}>
              <option value="">All Providers</option>
              <option value="GOOGLE">Google</option>
              <option value="LOCAL">Local</option>
            </select>
          </div>

          {/* DATA TABLE */}
          <div style={s.tableContainer}>
            {loading ? (
              <div>
                <div style={{ ...s.skeletonHeader, animation: "pulse 1.5s infinite" }} />
                {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ ...s.skeletonRow, animation: "pulse 1.5s infinite" }} />)}
              </div>
            ) : error ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "1rem" }} />
                <p style={{ color: "#475569", marginBottom: "1.5rem" }}>Something went wrong while fetching users.</p>
                <button onClick={fetchUsers} style={{ ...s.actionBtn, padding: "8px 24px" }}>Retry</button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                <UserPlus size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                <h3>No users found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>User</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Provider</th>
                    <th style={s.th}>Joined</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ 
                            width: "40px", 
                            height: "40px", 
                            borderRadius: "50%", 
                            background: u.role === "ADMIN" ? NAVY : "#94a3b8",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700"
                          }}>{u.name[0].toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: "700", color: "#0f172a" }}>{u.name}</div>
                            <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={s.badge(u.role === "ADMIN" ? "#eff6ff" : "#f1f5f9", u.role === "ADMIN" ? NAVY : "#64748b")}>
                          {u.role}
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={s.providerIcon(u.authProvider === "GOOGLE")}>
                          {u.authProvider === "GOOGLE" ? "G Google" : "Local"}
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ fontSize: "0.875rem", color: "#475569" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={s.toggle(u.enabled)} onClick={() => handleToggleStatus(u.id, u.enabled)}>
                            <div style={s.toggleCircle(u.enabled)} />
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: u.enabled ? "#22c55e" : "#ef4444" }}>
                            {u.enabled ? "ACTIVE" : "DISABLED"}
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button style={s.actionBtn} onClick={() => openRoleModal(u)}>Change Role</button>
                          {u.id !== currentUser?.id && (
                            <button 
                              style={{ ...s.actionBtn, backgroundColor: "#fef2f2", color: "#ef4444", borderColor: "#fecaca" }} 
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* ROLE MODAL */}
      {showRoleModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>Change User Role</h2>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "4px" }}>User</div>
              <div style={{ fontWeight: "700" }}>{selectedUser?.name} ({selectedUser?.email})</div>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>New Role</label>
              <select style={s.select} value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: "100%" }}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button 
              style={s.btnPrimary} 
              onClick={handleRoleUpdate}
              disabled={actionLoading}
            >
              {actionLoading ? "Updating..." : "Save Changes"}
            </button>
            <button style={s.btnSecondary} onClick={() => setShowRoleModal(false)} disabled={actionLoading}>Cancel</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default UsersPage;
