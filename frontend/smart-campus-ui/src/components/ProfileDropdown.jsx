import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { User, LogOut, LockKeyhole } from "lucide-react";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = user?.name ? user.name[0].toUpperCase() : "U";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const s = {
    container: { position: "relative", display: "inline-block" },
    avatarBtn: {
      width: "36px", height: "36px", borderRadius: "50%",
      background: "linear-gradient(135deg, #1e3a5f 0%, #122a47 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: "700", fontSize: "0.875rem",
      cursor: "pointer", border: "none", outline: "none", padding: 0,
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    dropdown: {
      position: "absolute", top: "100%", right: 0, marginTop: "8px",
      width: "240px", backgroundColor: "white", borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", border: "1px solid #f1f5f9",
      overflow: "hidden", zIndex: 1000,
      display: isOpen ? "block" : "none",
    },
    header: { padding: "1rem", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" },
    name: { fontSize: "0.875rem", fontWeight: "600", color: "#0f172a", margin: 0 },
    email: { fontSize: "0.75rem", color: "#64748b", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    menu: { padding: "0.5rem", listStyle: "none", margin: 0 },
    menuItem: {
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 12px", width: "100%", backgroundColor: "transparent",
      border: "none", borderRadius: "8px", cursor: "pointer",
      fontSize: "0.875rem", color: "#475569", textAlign: "left",
      transition: "background-color 0.2s",
    },
  };

  return (
    <div style={s.container} ref={dropdownRef}>
      <button style={s.avatarBtn} onClick={() => setIsOpen(!isOpen)}>
        {initials}
      </button>

      <div style={s.dropdown}>
        <div style={s.header}>
          <p style={s.name}>{user?.name || "User"}</p>
          <p style={s.email}>{user?.email || ""}</p>
        </div>
        <ul style={s.menu}>
          <li>
            <button style={s.menuItem}
              onClick={() => { setIsOpen(false); navigate("/profile"); }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
              <User size={16} /> My Profile
            </button>
          </li>
          {String(user?.authProvider).toUpperCase() === "LOCAL" && (
            <li>
              <button style={s.menuItem}
                onClick={() => { setIsOpen(false); navigate("/change-password"); }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <LockKeyhole size={16} /> Change Password
              </button>
            </li>
          )}
          <li>
            <button style={{ ...s.menuItem, color: "#ef4444" }}
              onClick={handleLogout}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
              <LogOut size={16} /> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDropdown;