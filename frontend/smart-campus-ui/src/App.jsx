import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";
import { getRoleBasedPath } from "./utils/navigation";
import { Toaster } from "react-hot-toast";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ResourcesPage from "./pages/ResourcesPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import BookingsPage from "./pages/BookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";

/**
 * Redirects authenticated users to their role-specific dashboard,
 * unauthenticated users to /login.
 */
const DefaultRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return <Navigate to={isAuthenticated ? getRoleBasedPath(user) : "/login"} replace />;
};

const LoadingSpinner = () => (
  <div style={{ 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    height: "100vh", 
    background: "linear-gradient(135deg, #1a3a6b 0%, #0f2447 50%, #1a3a6b 100%)",
    flexDirection: "column",
    gap: "1rem",
    color: "white",
    fontFamily: "'Inter', sans-serif"
  }}>
    <div style={{
      width: "40px",
      height: "40px",
      border: "3px solid rgba(255,255,255,0.2)",
      borderTop: "3px solid #60a5fa",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }} />
    <p style={{ fontSize: "0.875rem", opacity: 0.8, letterSpacing: "0.02em" }}>Verifying Session...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes — any authenticated user */}
      <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>

      {/* Admin-only Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />

      {/* Default Redirects — role-aware */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

