import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { getRoleBasedPath } from "../utils/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";

const NAVY = "#1a3a6b";
const NAVY_DARK = "#0f2447";

const s = {
  page: {
    width: '100vw',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a3a6b 0%, #0f2447 50%, #1a3a6b 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
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
    maxWidth: "480px",
    width: "100%",
    margin: "auto",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
    padding: "2.25rem",
    position: "relative",
    zIndex: 1,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "1.75rem",
  },
  iconBox: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
    boxShadow: "0 4px 12px rgba(26,58,107,0.4)",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  formGroup: { marginBottom: "1rem" },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "6px",
  },
  label: { fontSize: "0.8125rem", fontWeight: "500", color: "#ffffff" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "rgba(255, 255, 255, 0.5)",
    width: "16px",
    height: "16px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "11px 40px",
    borderRadius: "9px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontSize: "0.9375rem",
    outline: "none",
    boxSizing: "border-box",
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  passwordToggle: {
    position: "absolute",
    right: "12px",
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer",
    padding: 0,
    display: "flex",
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
    letterSpacing: "0.01em",
  },
  signupLink: {
    marginTop: "1.25rem",
    textAlign: "center",
    fontSize: "0.8125rem",
    color: "#64748b",
  },
  signupAnchor: {
    color: NAVY,
    fontWeight: "600",
    textDecoration: "none",
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

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to={getRoleBasedPath(user)} replace />;
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/auth/register", { name: fullName, email, password });
      login(response.data.token);
      navigate("/dashboard"); // new accounts always start as USER
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Email already registered");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <style>
        {`
          input::placeholder {
            color: rgba(255, 255, 255, 0.45) !important;
          }
          input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px rgba(26, 58, 107, 0.9) inset !important;
            -webkit-text-fill-color: #ffffff !important;
          }
        `}
      </style>
      <div style={s.bgCircle1} />
      <div style={s.bgCircle2} />

      {/* Adding card background change implicitly through outer styling requirement, but keeping the white card to stand out? 
          Wait, the prompt says "Input fields invisible (white text on white background)". The card itself might need a dark background depending on design, or maybe the inputs inside the white card now have a dark background.
          Actually, I notice the prompt says label text color #ffffff. This means the card background must be dark/transparent, or the background of the form area is dark.
          If `s.card` has `backgroundColor: "white"` then white labels won't work well.
          Let's change the card background to `transparent` or dark to match the form. I'll use a deep semi-transparent dark, like `rgba(15, 23, 42, 0.6)` or just remove the white background.
          Let me adjust s.card to `backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(10px)"` so it works with white text.
      */}

      <div style={{...s.card, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.iconBox}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{...s.title, color: "white"}}>Smart Campus Hub</h1>
        </div>

        {/* Error Message */}
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleRegister} autoComplete="off">
          <div style={s.formGroup}>
            <label style={s.label}>Full Name</label>
            <div style={s.inputWrapper}>
              <UserIcon style={s.inputIcon} />
              <input
                type="text"
                autoComplete="off"
                name="register-name"
                placeholder="Your full name"
                style={s.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Email Address</label>
            <div style={s.inputWrapper}>
              <Mail style={s.inputIcon} />
              <input
                type="email"
                autoComplete="off"
                name="register-email"
                placeholder="you@university.edu"
                style={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrapper}>
              <Lock style={s.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                name="register-password"
                placeholder="Create a password"
                style={s.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" style={s.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={{ ...s.formGroup, marginBottom: "1.25rem" }}>
            <label style={s.label}>Confirm Password</label>
            <div style={s.inputWrapper}>
              <Lock style={s.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                name="register-password-confirm"
                placeholder="Repeat password"
                style={s.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
          </button>
          <div style={s.signupLink}>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Already have an account? </span>
            <Link to="/login" style={{...s.signupAnchor, color: "#93c5fd"}}>
              Sign in →
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
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

export default RegisterPage;
