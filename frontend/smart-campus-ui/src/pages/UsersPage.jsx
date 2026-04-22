import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  Search,
  UserPlus,
  Shield,
  User,
  Mail,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  UserCheck,
  Trash2,
  Users
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  
  // Data State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters State
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
      console.log("Fetching users from /api/admin/users...");
      const res = await axiosInstance.get("/api/admin/users");
      console.log("Users response:", res.data);
      const usersData = res.data;
      
      let actualUsers = [];
      if (Array.isArray(usersData)) actualUsers = usersData;
      else if (Array.isArray(usersData?.content)) actualUsers = usersData.content;
      
      setUsers(actualUsers);
    } catch (err) {
      console.log('Users API error:', err.response?.status, err.response?.data);
      setError(true);
      toast.error("Failed to load user directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await axiosInstance.patch(`/api/admin/users/${userId}/status`, { enabled: !currentStatus });
      toast.success("Security profile updated");
      fetchUsers();
    } catch (err) {
      toast.error("Status update restricted");
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await axiosInstance.patch(`/api/admin/users/${selectedUser.id}/role`, { role: newRole });
      toast.success("Permissions updated");
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Role modification failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanent erasure of user data. Proceed?")) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}`);
      toast.success("User removed");
      fetchUsers();
    } catch (err) {
      toast.error("Deletion not permitted");
    }
  };

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === "ADMIN").length,
    regulars: users.filter(u => u.role === "USER").length,
    google: users.filter(u => u.authProvider === "GOOGLE").length
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "" || u.role === filterRole;
      const matchesProvider = filterProvider === "" || u.authProvider === filterProvider;
      return matchesSearch && matchesRole && matchesProvider;
    });
  }, [users, searchTerm, filterRole, filterProvider]);

  const styles = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    header: { height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" },
    pageHeader: { marginBottom: "32px" },
    title: { fontSize: "24px", fontWeight: "700", color: "#0F172A" },
    sub: { fontSize: "14px", color: "#64748B", marginTop: "4px" },

    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" },
    statCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
    statIcon: (bg, color) => ({ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center" }),

    filterBar: { backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", display: "flex", gap: "16px", marginBottom: "32px", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
    select: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", backgroundColor: "white", fontSize: "13px", fontWeight: "500", color: "#334155", outline: "none" },
    
    tableContainer: { backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    th: { padding: "12px 24px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontSize: "11px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" },
    td: { padding: "16px 24px", borderBottom: "1px solid #F1F5F9", fontSize: "14px", color: "#374151", verticalAlign: "middle" },

    modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modalPanel: { backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },

    toggle: (active) => ({ width: "36px", height: "20px", borderRadius: "99px", backgroundColor: active ? "#10B981" : "#E2E8F0", position: "relative", cursor: "pointer", transition: "0.2s" }),
    toggleCircle: (active) => ({ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "white", position: "absolute", top: "3px", left: active ? "19px" : "3px", transition: "0.2s" }),
  };

  return (
    <div style={styles.root}>
      <Sidebar activeId="users" />
      <main style={styles.main}>
        <header style={styles.header}><ProfileDropdown /></header>

        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.title}>Access Management</h1>
            <p style={styles.sub}>Control identities, permissions and authentication status.</p>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon("#E0F2FE", "#0EA5E9")}><Users size={20} /></div>
              <div><div style={{ fontSize: "24px", fontWeight: "700" }}>{stats.total}</div><div style={{ fontSize: "12px", color: "#64748B" }}>Total Users</div></div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon("#F3E8FF", "#8B5CF6")}><ShieldCheck size={20} /></div>
              <div><div style={{ fontSize: "24px", fontWeight: "700" }}>{stats.admins}</div><div style={{ fontSize: "12px", color: "#64748B" }}>Administrators</div></div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon("#D1FAE5", "#10B981")}><UserCheck size={20} /></div>
              <div><div style={{ fontSize: "24px", fontWeight: "700" }}>{stats.regulars}</div><div style={{ fontSize: "12px", color: "#64748B" }}>Verified Users</div></div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon("#FEF3C7", "#F59E0B")}><Mail size={20} /></div>
              <div><div style={{ fontSize: "24px", fontWeight: "700" }}>{stats.google}</div><div style={{ fontSize: "12px", color: "#64748B" }}>Google SSO</div></div>
            </div>
          </div>

          <div style={styles.filterBar}>
             <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F1F5F9", padding: "10px 16px", borderRadius: "8px", flex: 1 }}>
                <Search size={18} color="#94A3B8" />
                <input style={{ border: "none", background: "none", outline: "none", fontSize: "14px", width: "100%" }} placeholder="Search directory..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <select style={styles.select} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="">Role: All</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
             </select>
             <select style={styles.select} value={filterProvider} onChange={e => setFilterProvider(e.target.value)}>
                <option value="">Provider: All</option>
                <option value="GOOGLE">Google</option>
                <option value="LOCAL">Local</option>
             </select>
          </div>

          <div style={styles.tableContainer}>
            {loading ? (
               <div style={{ padding: "100px", textAlign: "center" }}><Loader2 className="animate-spin" color="#0EA5E9" size={40} /></div>
            ) : filteredUsers.length === 0 ? (
               <div style={{ padding: "100px", textAlign: "center", color: "#94A3B8" }}>No identities found.</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Identity</th>
                    <th style={styles.th}>Permissions</th>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ transition: "background 0.15s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#F8FAFC"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#0F172A" }}>{u.name[0]}</div>
                          <div><div style={{ fontWeight: "600", color: "#0F172A" }}>{u.name}</div><div style={{ fontSize: "12px", color: "#64748B" }}>{u.email}</div></div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-approved' : 'badge-muted'}`}>{u.role}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: "13px", color: "#64748B" }}>{u.authProvider === 'GOOGLE' ? '🔒 Google SSO' : '📧 Local Auth'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: "13px", color: "#64748B" }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td style={styles.td}>
                         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={styles.toggle(u.enabled)} onClick={() => handleToggleStatus(u.id, u.enabled)}><div style={styles.toggleCircle(u.enabled)} /></div>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: u.enabled ? "#10B981" : "#EF4444" }}>{u.enabled ? "ACTIVE" : "BAN"}</span>
                         </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "8px" }}>
                           <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => { setSelectedUser(u); setNewRole(u.role); setShowRoleModal(true); }}>Role</button>
                           {u.id !== currentUser?.id && (
                             <button onClick={() => handleDeleteUser(u.id)} style={{ padding: "6px", borderRadius: "6px", border: "1px solid #FEE2E2", color: "#EF4444", backgroundColor: "transparent", cursor: "pointer" }}><Trash2 size={14} /></button>
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

      {showRoleModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalPanel}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Update Permissions</h3>
                <button onClick={() => setShowRoleModal(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={20} /></button>
             </div>
             <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "24px" }}>Modify role for <span style={{ fontWeight: "700", color: "#0F172A" }}>{selectedUser?.name}</span>. This will affect their administrative access level.</p>
             <select style={{ ...styles.select, width: "100%", marginBottom: "24px" }} value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="USER">Standard User</option>
                <option value="ADMIN">System Administrator</option>
             </select>
             <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowRoleModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleRoleUpdate} disabled={actionLoading}>
                   {actionLoading ? "Updating..." : "Commit Change"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
