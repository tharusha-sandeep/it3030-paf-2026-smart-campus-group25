import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { LockKeyhole, Eye, EyeOff, Loader2 } from "lucide-react";

const NAVY = "#1e3a5f";

const ChangePasswordPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Redirect if not LOCAL
  if (user?.authProvider !== "LOCAL") {
    return <Navigate to="/profile" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password must match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("sc_token");
      await axiosInstance.put(
        "http://localhost:8080/api/auth/change-password",
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success("Password changed successfully.");
      // Optional: Log out the user or just navigate away
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password. Check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa", fontFamily: "'Inter', sans-serif" },
    main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
    topNav: { backgroundColor: "white", padding: "0 1.5rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "flex-end", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "2rem", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" },
    
    card: { width: "100%", maxWidth: "480px", backgroundColor: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
    iconBox: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" },
    title: { fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.5rem 0" },
    sub: { fontSize: "0.875rem", color: "#64748b", margin: "0 0 2rem 0" },
    
    formGroup: { marginBottom: "1.25rem" },
    label: { display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "0.5rem" },
    inputWrapper: { display: "flex", alignItems: "center", position: "relative" },
    input: { width: "100%", padding: "10px 40px 10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9375rem", outline: "none", transition: "border-color 0.2s" },
    eyeBtn: { position: "absolute", right: "12px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", padding: 0 },
    
    submitBtn: { width: "100%", padding: "12px", borderRadius: "10px", border: "none", backgroundColor: NAVY, color: "white", fontWeight: "600", fontSize: "0.9375rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", marginTop: "1rem", transition: "background-color 0.2s" },
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="" />
      <main style={s.main}>
        <header style={s.topNav}>
          <ProfileDropdown />
        </header>

        <div style={s.content}>
          <div style={s.card}>
            <div style={s.iconBox}>
              <LockKeyhole size={24} />
            </div>
            <h1 style={s.title}>Change Password</h1>
            <p style={s.sub}>Ensure your account is using a strong, secure password.</p>

            <form onSubmit={handleSubmit}>
              <div style={s.formGroup}>
                <label style={s.label}>Current Password</label>
                <div style={s.inputWrapper}>
                  <input
                    type={showCurrent ? "text" : "password"}
                    style={s.input}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>New Password</label>
                <div style={s.inputWrapper}>
                  <input
                    type={showNew ? "text" : "password"}
                    style={s.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Confirm New Password</label>
                <div style={s.inputWrapper}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    style={s.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
