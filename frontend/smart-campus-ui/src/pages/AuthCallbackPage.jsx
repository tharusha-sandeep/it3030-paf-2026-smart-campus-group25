import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Handles the Google OAuth2 callback.
 * Extracted token is saved directly to localStorage and role is decoded 
 * to determine the immediate redirect path without extra API calls.
 */
export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Store token immediately (matching 'sc_token' in AuthContext)
    localStorage.setItem("sc_token", token);

    // Decode JWT payload to get role WITHOUT calling /api/auth/me
    try {
      const base64Payload = token.split(".")[1];
      const padding = "=".repeat((4 - (base64Payload.length % 4)) % 4);
      const decoded = JSON.parse(atob(base64Payload + padding));

      // Try various role claim names
      const role = decoded.role || decoded.roles || decoded.authorities || "USER";

      // Store simplified user role
      const normalizedRole =
        (Array.isArray(role) && role.some((r) => r.includes("ADMIN"))) ||
        (typeof role === "string" && (role === "ADMIN" || role === "ROLE_ADMIN"))
          ? "ADMIN"
          : "USER";

      localStorage.setItem("userRole", normalizedRole);

      // Redirect based on role
      if (normalizedRole === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Token decoding failed", error);
      // Fallback redirect
      window.location.href = "/dashboard";
    }
  }, [searchParams]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(135deg, #1a3a6b 0%, #0f2447 50%, #1a3a6b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid rgba(255,255,255,0.3)",
          borderTop: "4px solid white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "16px",
        }}
      />
      <p style={{ fontSize: "16px", opacity: 0.8 }}>Signing you in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
