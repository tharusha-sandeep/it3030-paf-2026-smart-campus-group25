import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import axiosInstance from "../api/axiosInstance";
import { User, Mail, Shield, Calendar, ShieldCheck, Database, Loader2, AlertCircle } from "lucide-react";

const NAVY = "#1e3a5f";
const NAVY_DARK = "#122a47";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/me");
        setProfileData(response.data);
      } catch (err) {
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const s = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa", fontFamily: "'Inter', sans-serif" },
    main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
    topNav: { backgroundColor: "white", padding: "0 1.5rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "flex-end", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "2rem", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" },
    
    // CARD
    card: { width: "100%", maxWidth: "600px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", overflow: "hidden" },
    headerBanner: { height: "120px", background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`, position: "relative" },
    avatarWrapper: { position: "absolute", bottom: "-40px", left: "2rem", width: "80px", height: "80px", borderRadius: "50%", border: "4px solid white", background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "2rem", fontWeight: "700", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" },
    
    body: { padding: "3.5rem 2rem 2rem 2rem" },
    name: { fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" },
    badge: (isAdmin) => ({ backgroundColor: isAdmin ? "#fef2f2" : "#eff6ff", color: isAdmin ? "#ef4444" : "#3b82f6", fontSize: "0.6875rem", fontWeight: "700", padding: "4px 10px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "4px", letterSpacing: "0.05em" }),
    infoGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginTop: "2rem" },
    infoItem: { display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: "12px" },
    iconBox: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, boxShadow: "0 2px 4px rgba(0,0,0,0.02)", flexShrink: 0 },
    infoContent: { display: "flex", flexDirection: "column" },
    infoLabel: { fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" },
    infoValue: { fontSize: "0.9375rem", fontWeight: "500", color: "#0f172a" },
    
    // STATES
    loadingWrapper: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem" },
    error: { backgroundColor: "#fef2f2", color: "#ef4444", padding: "16px", borderRadius: "12px", border: "1px solid #fee2e2", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", fontWeight: "500" },
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={s.loadingWrapper}>
          <Loader2 className="animate-spin" size={32} color={NAVY} />
          <p style={{ marginTop: "1rem", color: "#64748b", fontWeight: "500" }}>Loading profile...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={s.body}>
          <div style={s.error}><AlertCircle size={18} /> {error}</div>
        </div>
      );
    }

    if (!profileData) return null;

    const initials = profileData.name ? profileData.name[0].toUpperCase() : "U";
    const isAdmin = profileData.role === "ADMIN";
    const joinedAt = new Date(profileData.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div style={s.card}>
        <div style={s.headerBanner}>
          <div style={s.avatarWrapper}>{initials}</div>
        </div>
        
        <div style={s.body}>
          <h1 style={s.name}>
            {profileData.name}
            <span style={s.badge(isAdmin)}>
              <ShieldCheck size={12} /> {profileData.role}
            </span>
          </h1>
          
          <div style={s.infoGrid}>
            <div style={s.infoItem}>
              <div style={s.iconBox}><Mail size={18} /></div>
              <div style={s.infoContent}>
                <span style={s.infoLabel}>Email Address</span>
                <span style={s.infoValue}>{profileData.email}</span>
              </div>
            </div>

            <div style={s.infoItem}>
              <div style={s.iconBox}><Database size={18} /></div>
              <div style={s.infoContent}>
                <span style={s.infoLabel}>Authentication Provider</span>
                <span style={s.infoValue}>{profileData.authProvider}</span>
              </div>
            </div>

            <div style={s.infoItem}>
              <div style={s.iconBox}><Calendar size={18} /></div>
              <div style={s.infoContent}>
                <span style={s.infoLabel}>Account Created</span>
                <span style={s.infoValue}>{joinedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={s.root}>
      <Sidebar activeId="" />
      <main style={s.main}>
        <header style={s.topNav}>
          <ProfileDropdown />
        </header>
        <div style={s.content}>
          <div style={{ width: "100%", maxWidth: "600px", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>My Profile</h1>
            <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>Manage your account details and preferences.</p>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
