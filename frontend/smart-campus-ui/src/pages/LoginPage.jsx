import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  ShieldCheck, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });
      login(response.data.token);
      navigate("/dashboard");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.post("/api/auth/register", { 
        name: fullName, 
        email, 
        password 
      });
      login(response.data.token);
      navigate("/dashboard");
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

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f3f4f6",
      padding: "1rem",
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      backgroundColor: "white",
      borderRadius: "1rem",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      padding: "2rem",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "2rem",
    },
    iconBox: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      backgroundColor: "#dcfce7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1rem",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#111827",
      margin: 0,
    },
    subtitle: {
      fontSize: "0.875rem",
      color: "#6b7280",
      marginTop: "0.25rem",
    },
    tabContainer: {
      display: "flex",
      backgroundColor: "#f9fafb",
      padding: "4px",
      borderRadius: "10px",
      marginBottom: "2rem",
    },
    tab: (active) => ({
      flex: 1,
      padding: "8px 0",
      fontSize: "0.875rem",
      fontWeight: "500",
      textAlign: "center",
      cursor: "pointer",
      borderRadius: "8px",
      border: "none",
      backgroundColor: active ? "white" : "transparent",
      boxShadow: active ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
      color: active ? "#111827" : "#6b7280",
      transition: "all 0.2s",
    }),
    formGroup: {
      marginBottom: "1.25rem",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    inputIcon: {
      position: "absolute",
      left: "12px",
      color: "#9ca3af",
      width: "18px",
      height: "18px",
    },
    input: {
      width: "100%",
      padding: "12px 40px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      fontSize: "0.95rem",
      outline: "none",
      boxSizing: "border-box", // Important for full width
    },
    passwordToggle: {
      position: "absolute",
      right: "12px",
      backgroundColor: "transparent",
      border: "none",
      color: "#9ca3af",
      cursor: "pointer",
      padding: 0,
    },
    button: {
      width: "100%",
      backgroundColor: "#15803d",
      color: "white",
      padding: "12px",
      borderRadius: "10px",
      border: "none",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginTop: "1rem",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      margin: "1.5rem 0",
      color: "#9ca3af",
      fontSize: "0.75rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      backgroundColor: "#e5e7eb",
    },
    dividerText: {
      margin: "0 10px",
    },
    googleButton: {
      width: "100%",
      backgroundColor: "white",
      color: "#374151",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      fontSize: "0.95rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    },
    error: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      padding: "10px",
      borderRadius: "8px",
      fontSize: "0.875rem",
      marginBottom: "1.5rem",
      textAlign: "center",
    },
    footer: {
      marginTop: "2rem",
      fontSize: "0.75rem",
      color: "#9ca3af",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconBox}>
            <ShieldCheck size={28} color="#15803d" />
          </div>
          <h1 style={styles.title}>Smart Campus Hub</h1>
          <p style={styles.subtitle}>Enterprise Campus Intelligence Hub</p>
        </div>

        <div style={styles.tabContainer}>
          <button 
            style={styles.tab(activeTab === "login")} 
            onClick={() => { setActiveTab("login"); setError(""); }}
          >
            Login
          </button>
          <button 
            style={styles.tab(activeTab === "signup")} 
            onClick={() => { setActiveTab("signup"); setError(""); }}
          >
            Student Signup
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {activeTab === "login" ? (
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Email Address"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  style={styles.passwordToggle} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Enter Workspace"}
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or continue with</span>
              <div style={styles.dividerLine}></div>
            </div>

            <button type="button" style={styles.googleButton} onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.178 0 7.55 0 9s.347 2.822.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.048.957 4.962l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <UserIcon style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Full Name"
                  style={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <Mail style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Email Address"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  style={styles.passwordToggle} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <Lock style={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  style={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
            </button>
          </form>
        )}
      </div>
      <div style={styles.footer}>© 2026 Smart Campus Hub</div>
    </div>
  );
};

export default LoginPage;
