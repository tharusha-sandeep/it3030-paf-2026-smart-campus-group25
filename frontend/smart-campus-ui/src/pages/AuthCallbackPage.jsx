import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Loader2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    let timeoutId;
    const authenticate = async () => {
      const token = searchParams.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Setup 5 second timeout to show error
      timeoutId = setTimeout(() => {
        setError(true);
      }, 5000);

      try {
        // Optimistically set the token for axios calls
        login(token);
        
        // Verify with the backend 
        const response = await axiosInstance.get("/api/auth/me");
        
        // If successful, clear the timeout
        clearTimeout(timeoutId);

        // Redirect based on the actual verified user role
        const role = response.data.role;
        window.location.href = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
      } catch {
        clearTimeout(timeoutId);
        setError(true);
      }
    };

    authenticate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "#f3f4f6" 
      }}>
        <div style={{ textAlign: "center", backgroundColor: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#b91c1c", marginBottom: "1.5rem", fontSize: "1.1rem", fontWeight: "500" }}>Authentication failed. Please try again.</p>
          <button 
            onClick={() => window.location.href = "/login"}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1a3a6b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      backgroundColor: "#f3f4f6" 
    }}>
      <div style={{ textAlign: "center" }}>
        <Loader2 className="animate-spin" size={48} color="#15803d" />
        <p style={{ marginTop: "1rem", color: "#6b7280" }}>Finalizing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
