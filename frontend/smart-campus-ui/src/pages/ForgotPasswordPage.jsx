import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, GraduationCap, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const NAVY = "#1a3a6b";
const NAVY_DARK = "#0f2447";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Endpoint placeholder — backend not yet implemented
      await axiosInstance.post("/api/auth/forgot-password", { email });
      setSent(true);
    // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      // Show success regardless to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 50%, ${NAVY} 100%)`,
      padding: "1.5rem",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    bgCircle1: {
      position: "absolute",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.04)",
      top: "-100px",
      right: "-100px",
      pointerEvents: "none",
    },
    bgCircle2: {
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background: "rgba(255,255,255,0.03)",
      bottom: "-80px",
      left: "-80px",
      pointerEvents: "none",
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
      padding: "2.25rem",
      position: "relative",
      zIndex: 1,
    },
    iconBox: {
      width: "52px",
      height: "52px",
      borderRadius: "14px",
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1.25rem",
      boxShadow: "0 4px 12px rgba(26,58,107,0.4)",
    },
    title: {
      fontSize: "1.375rem",
      fontWeight: "700",
      color: "#0f172a",
      textAlign: "center",
      margin: "0 0 0.375rem",
      letterSpacing: "-0.02em",
    },
    desc: {
      fontSize: "0.875rem",
      color: "#64748b",
      textAlign: "center",
      marginBottom: "1.75rem",
      lineHeight: "1.5",
    },
    label: {
      display: "block",
      fontSize: "0.8125rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "6px",
    },
    inputWrapper: { position: "relative", display: "flex", alignItems: "center", marginBottom: "1.25rem" },
    inputIcon: {
      position: "absolute",
      left: "12px",
      color: "#94a3b8",
      width: "16px",
      height: "16px",
      pointerEvents: "none",
    },
    input: {
      width: "100%",
      padding: "11px 40px",
      borderRadius: "9px",
      border: "1.5px solid #e2e8f0",
      fontSize: "0.9375rem",
      outline: "none",
      boxSizing: "border-box",
      color: "#1e293b",
    },
    submitBtn: {
      width: "100%",
      backgroundColor: NAVY,
      color: "white",
      padding: "12px",
      borderRadius: "10px",
      border: "none",
      fontSize: "0.9375rem",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxSizing: "border-box",
      marginBottom: "1rem",
    },
    backLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      color: NAVY,
      textDecoration: "none",
      fontSize: "0.875rem",
      fontWeight: "500",
    },
    error: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      padding: "10px 14px",
      borderRadius: "8px",
      fontSize: "0.875rem",
      marginBottom: "1.25rem",
      textAlign: "center",
      border: "1px solid #fecaca",
    },
    successBox: {
      textAlign: "center",
      padding: "1rem 0",
    },
    successIcon: { marginBottom: "1rem" },
    successTitle: {
      fontSize: "1.125rem",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "0.5rem",
    },
    successDesc: {
      fontSize: "0.875rem",
      color: "#64748b",
      lineHeight: "1.5",
      marginBottom: "1.5rem",
    },
    footerLinks: {
      marginTop: "1.75rem",
      display: "flex",
      gap: "1.5rem",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.75rem",
      position: "relative",
      zIndex: 1,
    },
    footerLink: { color: "rgba(255,255,255,0.65)", textDecoration: "none" },
    footerDot: { color: "rgba(255,255,255,0.3)" },
  };

  return (
    <div style={s.page}>
      <div style={s.bgCircle1} />
      <div style={s.bgCircle2} />

      <div style={s.card}>
        <div style={s.iconBox}>
          <GraduationCap size={28} color="white" />
        </div>

        {sent ? (
          <div style={s.successBox}>
            <CheckCircle size={48} color="#16a34a" style={s.successIcon} />
            <p style={s.successTitle}>Check your inbox</p>
            <p style={s.successDesc}>
              If an account exists for <strong>{email}</strong>, you will receive
              a password reset link shortly.
            </p>
            <Link to="/login" style={s.backLink}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={s.title}>Reset Password</h1>
            <p style={s.desc}>
              Enter your university email address and we'll send you a link to reset your password.
            </p>

            {error && <div style={s.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrapper}>
                <Mail style={s.inputIcon} />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  style={s.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Reset Link"}
              </button>

              <Link to="/login" style={s.backLink}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </form>
          </>
        )}
      </div>

      <div style={s.footerLinks}>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>© 2026 Smart Campus Hub</span>
        <span style={s.footerDot}>·</span>
        <a href="#" style={s.footerLink}>Help Center</a>
        <span style={s.footerDot}>·</span>
        <a href="#" style={s.footerLink}>Compliance</a>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
