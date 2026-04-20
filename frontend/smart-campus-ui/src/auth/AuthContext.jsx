import { createContext, useContext, useReducer, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN": {
      const token = action.payload;
      try {
        const decoded = jwtDecode(token);
        
        const rawRole = decoded.role || decoded.roles || decoded.authorities;
        const normalizedRole =
          (Array.isArray(rawRole) && rawRole.some((r) => r.includes("ADMIN"))) ||
          (typeof rawRole === "string" && (rawRole === "ADMIN" || rawRole === "ROLE_ADMIN"))
            ? "ADMIN"
            : "USER";

        const user = {
          id: decoded.sub,
          name: decoded.name || decoded.full_name || decoded.email?.split("@")[0],
          email: decoded.email,
          role: normalizedRole,
          authProvider: decoded.authProvider || "LOCAL", // Default to LOCAL if not found
        };
        
        localStorage.setItem("sc_token", token);
        localStorage.setItem("userRole", normalizedRole);

        return {
          ...state,
          user,
          token,
          isAuthenticated: true,
          loading: false,
        };
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("sc_token");
        localStorage.removeItem("userRole");
        return { ...initialState, loading: false };
      }
    }
    case "LOGOUT":
      localStorage.removeItem("sc_token");
      localStorage.removeItem("userRole");
      return { ...initialState, loading: false };
    case "FINISH_LOADING":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("sc_token");
      const savedRole = localStorage.getItem("userRole");

      if (token) {
        // Dispatching LOGIN will validate and decode
        dispatch({ type: "LOGIN", payload: token });
      } else {
        // If Role exists without token, clear role
        if (savedRole) {
          localStorage.removeItem("userRole");
        }
        dispatch({ type: "FINISH_LOADING" });
      }
    };

    initializeAuth();
  }, []);

  const login = (token) => dispatch({ type: "LOGIN", payload: token });
  const logout = () => dispatch({ type: "LOGOUT" });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
