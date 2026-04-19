import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { getRoleBasedPath } from "../utils/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";

const NAVY = "#1a3a6b";
const NAVY_DARK = "#0f2447";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.178 0 7.55 0 9s.347 2.822.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.048.957 4.962l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

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
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
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
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  googleBtn: {
    width: "100%",
    backgroundColor: "white",
    color: "#1e293b",
    padding: "11px 16px",
    borderRadius: "10px",
    border: "none",
    fontSize: "0.9375rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxSizing: "border-box",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "1.25rem 0",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.75rem",
    letterSpacing: "0.05em",
  },
  dividerLine: { flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.1)" },
  dividerText: { margin: "0 10px", whiteSpace: "nowrap" },
  formGroup: { marginBottom: "1rem" },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "6px",
  },
  label: { fontSize: "0.8125rem", fontWeight: "500", color: "#ffffff" },
  forgotLink: {
    fontSize: "0.75rem",
    color: "#93c5fd",
    textDecoration: "none",
    fontWeight: "500",
  },
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
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1.25rem",
  },
  checkboxLabel: { fontSize: "0.8125rem", color: "rgba(255,255,255,0.8)", cursor: "pointer" },
  submitBtn: {
    width: "100%",
    backgroundColor: "#3b82f6",
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
  },
  signupAnchor: {
    color: "#93c5fd",
    fontWeight: "600",
    textDecoration: "none",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#fecaca",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginBottom: "1.25rem",
    textAlign: "center",
    border: "1px solid rgba(239, 68, 68, 0.3)",
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

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to={getRoleBasedPath(user)} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });
      login(response.data.token);
      const decoded = response.data.token ? (() => { try { const p = JSON.parse(atob(response.data.token.split('.')[1])); return p; } catch { return {}; } })() : {};
      navigate(decoded.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
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

      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.iconBox}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={s.title}>Smart Campus Hub</h1>
        </div>

        {/* Error Message */}
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleLogin} autoComplete="off">
          {/* Google Sign-In at TOP */}
          <button type="button" style={s.googleBtn} onClick={handleGoogleLogin}>
            <GoogleIcon />
            Sign in with Google
          </button>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>or sign in with email</span>
            <div style={s.dividerLine} />
          </div>

          {/* Email */}
          <div style={s.formGroup}>
            <label style={s.label}>Email Address</label>
            <div style={s.inputWrapper}>
              <Mail style={s.inputIcon} />
              <input
                type="email"
                autoComplete="off"
                name="login-email"
                placeholder="you@university.edu"
                style={s.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password with Forgot link */}
          <div style={s.formGroup}>
            <div style={s.labelRow}>
              <label style={s.label}>Password</label>
              <Link to="/forgot-password" style={s.forgotLink}>Forgot password?</Link>
            </div>
            <div style={s.inputWrapper}>
              <Lock style={s.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                name="login-password"
                placeholder="Enter your password"
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

          {/* Keep me logged in */}
          <div style={s.checkboxRow}>
            <input
              id="keep-logged-in"
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              style={{ accentColor: "#3b82f6", width: "15px", height: "15px", cursor: "pointer" }}
            />
            <label htmlFor="keep-logged-in" style={s.checkboxLabel}>Keep me logged in</label>
          </div>

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign in"}
          </button>

          <div style={s.signupLink}>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>New to Smart Campus Hub? </span>
            <Link to="/register" style={s.signupAnchor}>
              Create an account →
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

export default LoginPage;
