import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Ticket,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ShieldCheck,
  Bell,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Box,
  Server,
  Projector,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";

const NAVY = "#1e3a5f";
const NAVY_DARK = "#122a47";

// ── Icons and Theme Mapping ──────────────────────────────────────────────
const typeConfig = {
  LECTURE_HALL: { icon: "🎓", lucide: Projector, color: NAVY, bg: "#eff6ff", label: "Lecture Hall" },
  LAB: { icon: "🔬", lucide: Server, color: "#8b5cf6", bg: "#f3e8ff", label: "Lab" },
  MEETING_ROOM: { icon: "🤝", lucide: Users, color: "#14b8a6", bg: "#ccfbf1", label: "Meeting Room" },
  EQUIPMENT: { icon: "🔧", lucide: Box, color: "#f97316", bg: "#fff7ed", label: "Equipment" },
};

const formatType = (type) => typeConfig[type]?.label || type;

const ResourcesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";
  const initials = user?.name ? user.name[0].toUpperCase() : "U";

  // Data State
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'az', 'cap_low_high', 'cap_high_low', 'newest'

  // Modal State
  const [selectedResource, setSelectedResource] = useState(null); // For View Details
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDelete, setTargetDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // ── Availability Scheduler State ──────────────────────────────────────────
  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [schedDays, setSchedDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");

  const serializeAvailability = (days, start, end) => {
    return `${days.join(",")} ${start}-${end}`;
  };

  const deserializeAvailability = (str) => {
    try {
      if (!str) return null;
      const parts = str.trim().split(" ");
      if (parts.length !== 2) return null;
      
      const days = parts[0].split(",");
      const times = parts[1].split("-");
      if (times.length !== 2) return null;

      // Basic validation
      if (days.length === 0 || !WEEKDAYS.includes(days[0])) return null;
      
      return { days, start: times[0], end: times[1] };
    } catch (e) {
      return null;
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    availabilityWindows: "",
    description: "",
    status: "ACTIVE",
  });


  const fetchResources = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await axiosInstance.get(`/api/resources`);
      setResources(res.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Derived Filter Options
  const uniqueLocations = useMemo(() => {
    const locs = resources.map(r => r.location).filter(Boolean);
    return [...new Set(locs)].sort();
  }, [resources]);

  // Apply filters & search & sorting locally so it's super fast
  const processedResources = useMemo(() => {
    let filtered = [...resources];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        r => r.name.toLowerCase().includes(term) || (r.location && r.location.toLowerCase().includes(term))
      );
    }

    if (filterType) filtered = filtered.filter(r => r.type === filterType);
    if (filterStatus) filtered = filtered.filter(r => r.status === filterStatus);
    if (filterLocation) filtered = filtered.filter(r => r.location === filterLocation);

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "az": return a.name.localeCompare(b.name);
        case "cap_low_high": return (a.capacity || 0) - (b.capacity || 0);
        case "cap_high_low": return (b.capacity || 0) - (a.capacity || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return filtered;
  }, [resources, searchTerm, filterType, filterStatus, filterLocation, sortBy]);

  // Modal Handlers
  const handleOpenAdd = () => {
    setCurrentEdit(null);
    setFormData({ name: "", type: "LECTURE_HALL", capacity: "", location: "", availabilityWindows: "", description: "", status: "ACTIVE" });
    setSchedDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    setStartTime("08:00");
    setEndTime("18:00");
    setShowAddModal(true);
  };

  const handleOpenEdit = (res) => {
    setSelectedResource(null); // Close view details if open
    setCurrentEdit(res);

    // Parse legacy availability or use defaults
    const parsed = deserializeAvailability(res.availabilityWindows);
    if (parsed) {
      setSchedDays(parsed.days);
      setStartTime(parsed.start);
      setEndTime(parsed.end);
    } else {
      setSchedDays(["Mon", "Tue", "Wed", "Thu", "Fri"]);
      setStartTime("08:00");
      setEndTime("18:00");
    }

    setFormData({
      name: res.name,
      type: res.type,
      capacity: res.capacity || "",
      location: res.location || "",
      availabilityWindows: res.availabilityWindows || "",
      description: res.description || "",
      status: res.status,
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (schedDays.length === 0) {
      return toast.error("At least one available day must be selected.");
    }
    if (startTime >= endTime) {
      return toast.error("End time must be after start time.");
    }

    setModalLoading(true);
    try {
      const finalAvailability = serializeAvailability(schedDays, startTime, endTime);
      const payload = { 
        ...formData, 
        capacity: parseInt(formData.capacity) || 0,
        availabilityWindows: finalAvailability 
      };

      if (currentEdit) {
        await axiosInstance.put(`/api/resources/${currentEdit.id}`, payload);
        toast.success("Resource updated successfully!");
      } else {
        await axiosInstance.post(`/api/resources`, payload);
        toast.success("Resource added successfully!");
      }
      setShowAddModal(false);
      fetchResources();
    } catch (err) {
      toast.error("Failed to save resource.");
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!targetDelete) return;
    setModalLoading(true);
    try {
      await axiosInstance.delete(`/api/resources/${targetDelete}`);
      toast.success("Resource deleted successfully!");
      setShowDeleteModal(false);
      setSelectedResource(null);
      fetchResources();
    } catch (err) {
      toast.error("Failed to delete resource.");
    } finally {
      setModalLoading(false);
    }
  };


  // ── Styles ───────────────────────────────────────────────────────────────
  const s = {
    // LAYOUT
    root: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", backgroundColor: "#f8fafc" },
    sidebar: { width: "220px", minWidth: "220px", backgroundColor: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 },
    main: { marginLeft: "220px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
    
    // SIDEBAR 
    sidebarBrand: { padding: "1.25rem 1rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px" },
    brandIconBox: { width: "34px", height: "34px", borderRadius: "9px", background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    brandTitle: { fontSize: "0.8rem", fontWeight: "700", color: "#0f172a", lineHeight: 1.2 },
    brandSub: { fontSize: "0.625rem", color: "#94a3b8" },
    navSection: { flex: 1, padding: "1rem 0.5rem", overflowY: "auto" },
    navItem: (active) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "9px", marginBottom: "2px", cursor: "pointer", backgroundColor: active ? NAVY : "transparent", color: active ? "white" : "#475569", fontSize: "0.875rem", fontWeight: active ? "600" : "500", border: "none", width: "100%", textAlign: "left", transition: "all 0.2s" }),
    sidebarBottom: { padding: "0.75rem 0.5rem 1rem", borderTop: "1px solid #f1f5f9" },
    bottomBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "9px", marginBottom: "2px", cursor: "pointer", color: "#475569", fontSize: "0.875rem", border: "none", backgroundColor: "transparent", width: "100%", textAlign: "left", fontWeight: "500" },
    logoutBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "9px", cursor: "pointer", color: "#ef4444", fontSize: "0.875rem", fontWeight: "600", border: "none", backgroundColor: "#fef2f2", width: "100%", textAlign: "left", marginTop: "4px" },
    
    // TOP NAV
    topNav: { backgroundColor: "white", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "flex-end", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 },
    topNavRight: { display: "flex", alignItems: "center", gap: "16px" },
    bellBtn: { position: "relative", background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" },
    bellDot: { position: "absolute", top: 0, right: 0, width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", border: "2px solid white" },
    avatar: { width: "36px", height: "36px", borderRadius: "50%", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "0.875rem", cursor: "pointer" },
    
    // CONTENT
    content: { padding: "2rem", flex: 1, maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" },
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" },
    pageTitle: { fontSize: "1.875rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.03em" },
    pageSub: { fontSize: "1rem", color: "#64748b", marginTop: "6px" },
    primaryBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: NAVY, color: "white", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer", transition: "transform 0.1s, box-shadow 0.2s", boxShadow: "0 4px 6px -1px rgba(30,58,95,0.2)" },
    
    // FILTERS
    filterCard: { backgroundColor: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" },
    filterTop: { display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" },
    filterGroup: { display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 },
    searchBox: { display: "flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 14px", flex: "1 1 250px", backgroundColor: "#f8fafc", transition: "border-color 0.2s" },
    searchInput: { border: "none", outline: "none", backgroundColor: "transparent", fontSize: "0.9375rem", color: "#334155", width: "100%" },
    select: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "0.875rem", color: "#334155", outlineColor: NAVY, cursor: "pointer", fontWeight: "500", minWidth: "140px" },
    resultsCount: { fontSize: "0.875rem", color: "#64748b", fontWeight: "500" },

    // GRID
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" },
    
    // CARDS
    cardWrapper: { perspective: "1000px" },
    card: (color) => ({ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer", height: "100%", position: "relative" }),
    cardTopBar: (color) => ({ height: "6px", backgroundColor: color, width: "100%" }),
    cardBody: { padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" },
    cardHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" },
    cardTitleBox: { display: "flex", gap: "12px", alignItems: "center" },
    cardEmojiBg: (bg) => ({ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }),
    cardTitle: { fontSize: "1.125rem", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0", lineHeight: 1.2 },
    typeBadge: { fontSize: "0.6875rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
    statusBadge: (isActive) => ({ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: isActive ? "#dcfce7" : "#fee2e2", color: isActive ? "#16a34a" : "#ef4444" }),
    infoRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "#475569", marginBottom: "8px" },
    infoIcon: { color: "#94a3b8" },
    cardFooter: { borderTop: "1px solid #f1f5f9", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa" },
    viewBtn: { background: "none", border: "none", color: NAVY, fontWeight: "600", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", padding: 0 },
    actionRow: { display: "flex", gap: "8px" },
    iconBtn: (danger) => ({ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: danger ? "1px solid #fecaca" : "1px solid #e2e8f0", backgroundColor: "white", color: danger ? "#ef4444" : "#64748b", cursor: "pointer", transition: "all 0.2s" }),
    updatedText: { fontSize: "0.75rem", color: "#94a3b8", alignSelf: "flex-start", marginTop: "10px" },

    // SKELETON
    skeletonBox: { height: "20px", backgroundColor: "#e2e8f0", borderRadius: "4px", marginBottom: "12px", animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
    
    // ERROR/EMPTY
    stateContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", textAlign: "center", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #cbd5e1" },
    stateIcon: { fontSize: "3rem", marginBottom: "1rem" },
    stateTitle: { fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" },
    stateDesc: { fontSize: "0.9375rem", color: "#64748b", marginBottom: "1.5rem" },

    // MODAL
    modalBackdrop: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", backdropFilter: "blur(4px)" },
    modalPanel: { backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "600px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" },
    modalHeader: (color) => ({ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", backgroundColor: color || "white" }),
    modalHeaderTitle: { fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 },
    closeBtn: { background: "rgba(0,0,0,0.05)", border: "none", color: "#64748b", cursor: "pointer", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" },
    modalBody: { padding: "1.5rem", overflowY: "auto", flex: 1 },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
    formGroupContainer: (full) => ({ gridColumn: full ? "1 / -1" : "auto", display: "flex", flexDirection: "column", gap: "6px" }),
    label: { fontSize: "0.875rem", fontWeight: "600", color: "#334155" },
    input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9375rem", outlineColor: NAVY, transition: "border-color 0.2s" },
    textarea: { padding: "12px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9375rem", outlineColor: NAVY, minHeight: "80px", resize: "vertical" },
    radioGroup: { display: "flex", gap: "1rem", alignItems: "center", height: "42px" },
    radioLabel: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", fontWeight: "500", cursor: "pointer" },
    modalFooter: { padding: "1.25rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "#fafafa", flexShrink: 0 },
    btnOutline: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", color: "#475569", fontWeight: "600", fontSize: "0.9375rem", cursor: "pointer" },
    
    // SCHEDULER
    pillContainer: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" },
    dayPill: (active) => ({
      padding: "8px 14px",
      borderRadius: "20px",
      fontSize: "0.8125rem",
      fontWeight: "600",
      cursor: "pointer",
      border: "1px solid",
      borderColor: active ? NAVY : "#e2e8f0",
      backgroundColor: active ? NAVY : "#f1f5f9",
      color: active ? "white" : "#64748b",
      transition: "all 0.1s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "54px",
      userSelect: "none"
    }),
    timeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "4px" },
    
    // VIEW DETAILS MODAL
    detailBlock: { marginBottom: "1.5rem" },
    detailLabel: { fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" },
    detailText: { fontSize: "1rem", color: "#0f172a", fontWeight: "500", lineHeight: 1.5 },
    detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem", backgroundColor: "#f8fafc", padding: "1.25rem", borderRadius: "12px" },
  };

  return (
    <div style={s.root}>
      {/* ── SIDEBAR ── */}
      <Sidebar activeId="resources" />

      {/* ── MAIN ── */}
      <main style={s.main}>
        {/* TOPNAV */}
        <header style={s.topNav}>
          <div style={s.topNavRight}>
            <button style={s.bellBtn}><Bell size={20} /><span style={s.bellDot} /></button>
            <ProfileDropdown />
          </div>
        </header>

        {/* CONTENT */}
        <div style={s.content}>
          <div style={s.headerRow}>
            <div>
              <h1 style={s.pageTitle}>Institutional Resources</h1>
              <p style={s.pageSub}>Manage and browse campus facilities and assets</p>
            </div>
            {isAdmin && (
              <button 
                style={s.primaryBtn} 
                onClick={handleOpenAdd}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 12px -2px rgba(30,58,95,0.25)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(30,58,95,0.2)"; }}
              >
                <Plus size={18} /> Add Resource
              </button>
            )}
          </div>

          <div style={s.filterCard}>
            <div style={s.filterTop}>
              <div style={s.searchBox}>
                <Search size={18} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search by name or location..." 
                  style={s.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={s.filterGroup}>
                <select style={s.select} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
                <select style={s.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statutes</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
                <select style={s.select} value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                  <option value="">All Locations</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <select style={s.select} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Recently Added</option>
                  <option value="az">Name (A-Z)</option>
                  <option value="cap_low_high">Capacity (Low → High)</option>
                  <option value="cap_high_low">Capacity (High → Low)</option>
                </select>
              </div>
            </div>
            {!loading && !error && (
              <div style={s.resultsCount}>
                Showing {processedResources.length} of {resources.length} resources
              </div>
            )}
          </div>

          {loading ? (
             <div style={s.grid}>
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} style={{...s.card(""), border: "1px solid #e2e8f0", padding: "1.5rem"}}>
                   <div style={s.cardHeaderRow}>
                      <div style={{ display: "flex", gap: "12px", width: "100%"}}>
                        <div style={{width:"38px", height:"38px", borderRadius:"10px", backgroundColor:"#e2e8f0", animation:"pulse 1.5s infinite"}}/>
                        <div style={{flex:1}}>
                           <div style={{...s.skeletonBox, width: "60%"}} />
                           <div style={{...s.skeletonBox, width: "40%", height:"12px"}} />
                        </div>
                      </div>
                   </div>
                   <div style={{...s.skeletonBox, width: "80%", height:"14px", marginTop:"12px"}} />
                   <div style={{...s.skeletonBox, width: "50%", height:"14px"}} />
                 </div>
               ))}
             </div>
          ) : error ? (
            <div style={s.stateContainer}>
              <AlertTriangle style={{...s.stateIcon, color: "#ef4444"}} />
              <h3 style={s.stateTitle}>Failed to load resources</h3>
              <p style={s.stateDesc}>Please check your connection and try again.</p>
              <button style={s.primaryBtn} onClick={fetchResources}><RefreshCw size={16}/> Retry</button>
            </div>
          ) : processedResources.length === 0 ? (
            <div style={s.stateContainer}>
              <div style={{...s.stateIcon, fontSize:"4rem"}}>🏫</div>
              <h3 style={s.stateTitle}>No resources found</h3>
              <p style={s.stateDesc}>Try adjusting your search or filters to find what you're looking for.</p>
              {isAdmin && (
                <button style={s.primaryBtn} onClick={handleOpenAdd}><Plus size={16}/> Add New Resource</button>
              )}
            </div>
          ) : (
            <div style={s.grid}>
              {processedResources.map(res => {
                const conf = typeConfig[res.type] || { icon: "📦", color: NAVY, bg: "#f1f5f9", label: "Other" };
                
                return (
                  <div key={res.id} style={s.cardWrapper}>
                    <div 
                      style={s.card(conf.color)}
                      onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px -8px rgba(0,0,0,0.1)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                      onClick={() => setSelectedResource(res)}
                    >
                      <div style={s.cardTopBar(conf.color)} />
                      <div style={s.cardBody}>
                        <div style={s.cardHeaderRow}>
                          <div style={s.cardTitleBox}>
                            <div style={s.cardEmojiBg(conf.bg)}>{conf.icon}</div>
                            <div>
                              <h3 style={s.cardTitle}>{res.name}</h3>
                              <span style={s.typeBadge}>{conf.label}</span>
                            </div>
                          </div>
                          <div style={{...s.statusBadge(res.status === "ACTIVE"),marginLeft: "auto"}}>
                            {res.status === "ACTIVE" ? "ACTIVE" : "OUT_OF_SERVICE"}
                          </div>
                        </div>

                        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {res.capacity > 0 && (
                            <div style={s.infoRow}><Users size={16} style={s.infoIcon}/> 👥 {res.capacity} people</div>
                          )}
                          {res.location && (
                            <div style={s.infoRow}><Building size={16} style={s.infoIcon}/> {res.location}</div>
                          )}
                          {res.availabilityWindows && (
                            <div style={s.infoRow}><Clock size={16} style={s.infoIcon}/> {res.availabilityWindows}</div>
                          )}
                        </div>
                        {res.updatedAt && (
                          <div style={s.updatedText}>Updated {new Date(res.updatedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                      
                      <div style={s.cardFooter} onClick={(e) => e.stopPropagation()}>
                        <button style={s.viewBtn} onClick={() => setSelectedResource(res)}>
                          <Eye size={16} /> View Details
                        </button>
                        {isAdmin && (
                          <div style={s.actionRow}>
                            <button 
                               style={s.iconBtn(false)} 
                               onClick={() => handleOpenEdit(res)}
                               onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                               onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                               style={s.iconBtn(true)} 
                               onClick={() => { setTargetDelete(res.id); setShowDeleteModal(true); }}
                               onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                               onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── VIEW DETAILS MODAL ── */}
      {selectedResource && (
        <div style={s.modalBackdrop} onClick={() => setSelectedResource(null)}>
          <div style={s.modalPanel} onClick={e => e.stopPropagation()}>
            {(() => {
               const conf = typeConfig[selectedResource.type] || { icon: "📦", color: NAVY, bg: "#f1f5f9", label: "Other" };
               return (
                  <>
                    <div style={{height: "8px", backgroundColor: conf.color, width: "100%"}}></div>
                    <div style={s.modalHeader("white")}>
                      <div style={s.cardTitleBox}>
                        <div style={{...s.cardEmojiBg(conf.bg), width:"48px", height:"48px", fontSize:"1.75rem"}}>{conf.icon}</div>
                        <div>
                          <h2 style={s.modalHeaderTitle}>{selectedResource.name}</h2>
                          <span style={s.typeBadge}>{conf.label}</span>
                        </div>
                      </div>
                      <button style={s.closeBtn} onClick={() => setSelectedResource(null)}>
                        <X size={20} />
                      </button>
                    </div>
                    <div style={s.modalBody}>
                       <div style={s.detailGrid}>
                          <div>
                             <div style={s.detailLabel}>Status</div>
                             <div style={s.statusBadge(selectedResource.status === "ACTIVE")}>
                                {selectedResource.status === "ACTIVE" ? "Active" : "Out of Service"}
                             </div>
                          </div>
                          <div>
                             <div style={s.detailLabel}>Capacity</div>
                             <div style={s.detailText}>{selectedResource.capacity > 0 ? `${selectedResource.capacity} people` : "N/A"}</div>
                          </div>
                          <div>
                             <div style={s.detailLabel}>Location</div>
                             <div style={s.detailText}>{selectedResource.location || "N/A"}</div>
                          </div>
                          <div>
                             <div style={s.detailLabel}>Availability</div>
                             <div style={s.detailText}>{selectedResource.availabilityWindows || "N/A"}</div>
                          </div>
                       </div>
                       
                       <div style={s.detailBlock}>
                         <div style={s.detailLabel}>Description</div>
                         <div style={{...s.detailText, color: selectedResource.description ? "#0f172a" : "#94a3b8", whiteSpace: "pre-wrap"}}>
                           {selectedResource.description || "No description provided for this resource."}
                         </div>
                       </div>
                    </div>
                    {isAdmin && (
                      <div style={s.modalFooter}>
                         <button style={s.primaryBtn} onClick={() => handleOpenEdit(selectedResource)}>
                           <Edit2 size={16} /> Edit Resource
                         </button>
                      </div>
                    )}
                  </>
               )
            })()}
          </div>
        </div>
      )}

      {/* ── ADD/EDIT MODAL ── */}
      {showAddModal && (
        <div style={s.modalBackdrop}>
          <div style={s.modalPanel}>
            <div style={s.modalHeader("white")}>
               <h2 style={s.modalHeaderTitle}>{currentEdit ? "Update Resource" : "Register Resource"}</h2>
               <button style={s.closeBtn} onClick={() => setShowAddModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleFormSubmit} style={{display:"flex", flexDirection:"column", flex: 1, overflow: "hidden"}}>
              <div style={s.modalBody}>
                <div style={s.formGrid}>
                  <div style={s.formGroupContainer(false)}>
                    <label style={s.label}>Resource Name *</label>
                    <input required style={s.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Main Auditorium" />
                  </div>
                  <div style={s.formGroupContainer(false)}>
                    <label style={s.label}>Type *</label>
                    <select style={s.input} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="LAB">Lab</option>
                      <option value="MEETING_ROOM">Meeting Room</option>
                      <option value="EQUIPMENT">Equipment</option>
                    </select>
                  </div>
                  <div style={s.formGroupContainer(false)}>
                    <label style={s.label}>Capacity *</label>
                    <input required type="number" min="0" style={s.input} value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="e.g. 150" />
                  </div>
                  <div style={s.formGroupContainer(false)}>
                    <label style={s.label}>Location *</label>
                    <input required style={s.input} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Block A, Room 101" />
                  </div>
                  <div style={s.formGroupContainer(true)}>
                    <label style={s.label}>Available Days *</label>
                    <div style={s.pillContainer}>
                      {WEEKDAYS.map(day => {
                        const active = schedDays.includes(day);
                        return (
                          <div 
                            key={day} 
                            style={s.dayPill(active)} 
                            onClick={() => {
                              if (active) setSchedDays(schedDays.filter(d => d !== day));
                              else setSchedDays([...schedDays, day]);
                            }}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div style={s.timeGrid}>
                      <div style={s.formGroupContainer(false)}>
                        <label style={s.label}>Start Time *</label>
                        <input 
                          type="time" 
                          style={s.input} 
                          value={startTime} 
                          onChange={e => setStartTime(e.target.value)} 
                          required 
                        />
                      </div>
                      <div style={s.formGroupContainer(false)}>
                        <label style={s.label}>End Time *</label>
                        <input 
                          type="time" 
                          style={s.input} 
                          value={endTime} 
                          onChange={e => setEndTime(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  <div style={s.formGroupContainer(true)}>
                    <label style={s.label}>Description</label>
                    <textarea style={s.textarea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Additional details about this resource..." />
                  </div>
                  <div style={s.formGroupContainer(true)}>
                    <label style={s.label}>Status</label>
                    <div style={s.radioGroup}>
                      <label style={s.radioLabel}>
                        <input type="radio" value="ACTIVE" checked={formData.status === "ACTIVE"} onChange={e => setFormData({...formData, status: e.target.value})} /> Active
                      </label>
                      <label style={s.radioLabel}>
                        <input type="radio" value="OUT_OF_SERVICE" checked={formData.status === "OUT_OF_SERVICE"} onChange={e => setFormData({...formData, status: e.target.value})} /> Out of Service
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div style={s.modalFooter}>
                <button type="button" style={s.btnOutline} onClick={() => setShowAddModal(false)} disabled={modalLoading}>Discard</button>
                <button type="submit" style={s.primaryBtn} disabled={modalLoading}>
                  {modalLoading ? <Loader2 className="animate-spin" size={18} /> : currentEdit ? "Update Resource" : "Register Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div style={s.modalBackdrop}>
          <div style={{ ...s.modalPanel, maxWidth: "420px", textAlign: "center", padding: "2.5rem 1.5rem 1.5rem" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#fef2f2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: "1.375rem", fontWeight: "800", color: "#0f172a", marginBottom: "0.5rem" }}>Delete Resource?</h2>
            <p style={{ color: "#64748b", fontSize: "0.9375rem", marginBottom: "2rem", lineHeight: 1.5 }}>
              This action cannot be undone. Are you sure you want to permanently remove this resource from the catalogue?
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => setShowDeleteModal(false)} disabled={modalLoading}>Cancel</button>
              <button 
                style={{ ...s.primaryBtn, flex: 1, backgroundColor: "#ef4444", justifyContent: "center", boxShadow: "none" }} 
                onClick={confirmDelete}
                disabled={modalLoading}
              >
                {modalLoading ? <Loader2 className="animate-spin" size={16} /> : "Delete Resource"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Styles for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default ResourcesPage;
