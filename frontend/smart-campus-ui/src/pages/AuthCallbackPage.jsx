import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Loader2 } from "lucide-react";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      // Decode role directly from JWT to decide where to go
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        navigate(payload.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
      } catch {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, login, navigate]);

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
