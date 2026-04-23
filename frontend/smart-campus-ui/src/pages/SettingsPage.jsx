import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { 
  User, Mail, Shield, ShieldCheck, 
  Lock, Bell, Trash2, Calendar, 
  Loader2, ChevronRight, AlertCircle,
  Eye, EyeOff
} from "lucide-react";

const SettingsPage = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password State
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Preferences State
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/me");
        setProfileData(response.data);
      } catch (err) {
        toast.error("Failed to load account settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePassChange = (e) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (passForm.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setPassLoading(true);
    try {
      await axiosInstance.put("/api/auth/change-password", {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success("Password updated successfully.");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) {
      toast.error("Account deletion logic is currently in development mode.");
    }
  };

  const styles = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    topNav: { height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-end", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "40px", maxWidth: "900px", margin: "0 auto", width: "100%" },
    
    header: { marginBottom: "32px" },
    title: { fontSize: "28px", fontWeight: "800", color: "#0F172A", letterSpacing: "-0.02em" },
    subtitle: { fontSize: "15px", color: "#64748B", marginTop: "4px" },

    section: { 
      backgroundColor: "white", 
      borderRadius: "16px", 
      border: "1px solid #E2E8F0", 
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      marginBottom: "24px",
      overflow: "hidden"
    },
    sectionHeader: { 
      padding: "24px", 
      borderBottom: "1px solid #F1F5F9",
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#0F172A" },
    sectionBody: { padding: "24px" },

    formGroup: { marginBottom: "20px" },
    label: { display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" },
    input: { 
      width: "100%", 
      padding: "10px 14px", 
      border: "1px solid #E2E8F0", 
      borderRadius: "8px", 
      fontSize: "14px", 
      color: "#0F172A",
      backgroundColor: "#FDFDFD",
      transition: "border-color 0.15s ease",
      outline: "none",
      boxSizing: "border-box"
    },
    
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },

    toggleContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px",
      backgroundColor: "#F8FAFC",
      borderRadius: "12px",
      border: "1px solid #E2E8F0"
    },
    toggle: (active) => ({
      width: "44px",
      height: "24px",
      backgroundColor: active ? "#0EA5E9" : "#E2E8F0",
      borderRadius: "12px",
      position: "relative",
      cursor: "pointer",
      transition: "background-color 0.2s"
    }),
    toggleCircle: (active) => ({
      width: "18px",
      height: "18px",
      backgroundColor: "white",
      borderRadius: "50%",
      position: "absolute",
      top: "3px",
      left: active ? "23px" : "3px",
      transition: "left 0.2s"
    }),

    dangerArea: {
      padding: "24px",
      backgroundColor: "#FFF1F2",
      borderTop: "1px solid #FFE4E6",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  };

  if (loading) {
    return (
      <div style={styles.root}>
        <Sidebar activeId="settings" />
        <main style={styles.main}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Loader2 className="animate-spin" size={40} color="#0EA5E9" />
          </div>
        </main>
      </div>
    );
  }

  const isGoogle = profileData?.authProvider === "GOOGLE";

  return (
    <div style={styles.root}>
      <Sidebar activeId="settings" />
      <main style={styles.main}>
        <header style={styles.topNav}>
          <ProfileDropdown />
        </header>

        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>Account Settings</h1>
            <p style={styles.subtitle}>Manage your profile information and security preferences.</p>
          </div>

          {/* Profile Overview (Read Only) */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <User size={20} color="#0EA5E9" />
              <span style={styles.sectionTitle}>Profile Overview</span>
            </div>
            <div style={styles.sectionBody}>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input style={styles.input} value={profileData?.name} readOnly />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input style={styles.input} value={profileData?.email} readOnly />
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#F1F5F9", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                     <ShieldCheck size={16} /> {profileData?.role}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Provider</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#F1F5F9", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>
                     <Shield size={16} /> {profileData?.authProvider}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password - Only for LOCAL users */}
          {!isGoogle && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Lock size={20} color="#0EA5E9" />
                <span style={styles.sectionTitle}>Security & Password</span>
              </div>
              <form onSubmit={updatePassword} style={styles.sectionBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showPass ? "text" : "password"} 
                      name="currentPassword"
                      value={passForm.currentPassword}
                      onChange={handlePassChange}
                      style={styles.input} 
                      placeholder="••••••••"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <input 
                      type="password" 
                      name="newPassword"
                      value={passForm.newPassword}
                      onChange={handlePassChange}
                      style={styles.input} 
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm New Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={passForm.confirmPassword}
                      onChange={handlePassChange}
                      style={styles.input} 
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button type="submit" className="btn-primary" disabled={passLoading}>
                    {passLoading ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Bell size={20} color="#0EA5E9" />
              <span style={styles.sectionTitle}>Account Preferences</span>
            </div>
            <div style={styles.sectionBody}>
              <div style={styles.toggleContainer}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "#0F172A" }}>Email Notifications</div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>Receive booking approvals and system alerts via email.</div>
                </div>
                <div style={styles.toggle(notifications)} onClick={() => setNotifications(!notifications)}>
                  <div style={styles.toggleCircle(notifications)} />
                </div>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "10px", color: "#64748B", fontSize: "13px" }}>
                <Calendar size={14} />
                <span>Joined on {new Date(profileData?.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ ...styles.section, borderColor: "#FECACA" }}>
            <div style={{ ...styles.sectionHeader, borderBottomColor: "#FEE2E2" }}>
              <AlertCircle size={20} color="#EF4444" />
              <span style={{ ...styles.sectionTitle, color: "#991B1B" }}>Danger Zone</span>
            </div>
            <div style={styles.dangerArea}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#991B1B" }}>Delete Account</div>
                <div style={{ fontSize: "13px", color: "#B91C1C" }}>Permanently remove your account and all associated data.</div>
              </div>
              <button 
                onClick={handleDeleteAccount}
                style={{ 
                  backgroundColor: "transparent", 
                  color: "#EF4444", 
                  border: "1px solid #FCA5A5", 
                  padding: "8px 16px", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#EF4444"; e.currentTarget.style.color = "white"; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#EF4444"; }}
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
