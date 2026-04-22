import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import {
  Package,
  CalendarDays,
  Users,
  Search,
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
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileDropdown from "../components/ProfileDropdown";
import NewBookingModal from "../components/NewBookingModal";

/**
 * Professional Resource Management Page
 * - Stripe-style filter bar
 * - Clean card grid with sky blue accents
 * - Modern modal dialogs
 */

const typeConfig = {
  LECTURE_HALL: { icon: "🎓", color: "#0EA5E9", bg: "#E0F2FE", label: "Lecture Hall" },
  LAB: { icon: "🔬", color: "#8B5CF6", bg: "#F3E8FF", label: "Lab" },
  MEETING_ROOM: { icon: "🤝", color: "#10B981", bg: "#D1FAE5", label: "Meeting Room" },
  EQUIPMENT: { icon: "🔧", color: "#F59E0B", bg: "#FEF3C7", label: "Equipment" },
};

const ResourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Debug & Auth
  const isAdmin = user?.role === "ADMIN" || 
                  user?.role === "ROLE_ADMIN" || 
                  (user?.roles && user.roles.includes("ROLE_ADMIN"));

  const isUser = user?.role === 'ROLE_USER' || 
                 user?.role === 'USER' || 
                 user?.role === 'user' ||
                 (user?.roles && (
                   user.roles.includes('ROLE_USER') || 
                   user.roles.includes('USER')
                 ));

  // Data State
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Modal State
  const [selectedResource, setSelectedResource] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDelete, setTargetDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [preSelectedId, setPreSelectedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "", type: "LECTURE_HALL", capacity: "", location: "", 
    availabilityWindows: "", description: "", status: "ACTIVE"
  });

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/resources`);
      setResources(res.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const processedResources = useMemo(() => {
    let filtered = [...resources];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(term) || (r.location && r.location.toLowerCase().includes(term))
      );
    }
    if (filterType) filtered = filtered.filter(r => r.type === filterType);
    if (filterStatus) filtered = filtered.filter(r => r.status === filterStatus);

    filtered.sort((a, b) => {
      if (sortBy === "az") return a.name.localeCompare(b.name);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return filtered;
  }, [resources, searchTerm, filterType, filterStatus, sortBy]);

  const handleOpenAdd = () => {
    setCurrentEdit(null);
    setFormData({ name: "", type: "LECTURE_HALL", capacity: "", location: "", availabilityWindows: "Mon-Fri 08:00-18:00", description: "", status: "ACTIVE" });
    setShowAddModal(true);
  };

  const handleOpenEdit = (res) => {
    setCurrentEdit(res);
    setFormData({ ...res });
    setShowAddModal(true);
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (currentEdit) await axiosInstance.put(`/api/resources/${currentEdit.id}`, formData);
      else await axiosInstance.post(`/api/resources`, formData);
      toast.success(currentEdit ? "Resource updated" : "Resource catalogued");
      setShowAddModal(false);
      fetchResources();
    } catch (err) {
      toast.error("Process failed");
    } finally { setModalLoading(false); }
  };

  const styles = {
    root: { display: "flex", minHeight: "100vh", backgroundColor: "#F8FAFC" },
    main: { marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" },
    topNav: { height: "64px", backgroundColor: "white", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 32px", position: "sticky", top: 0, zIndex: 50 },
    content: { padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" },
    title: { fontSize: "24px", fontWeight: "700", color: "#0F172A" },
    sub: { fontSize: "14px", color: "#64748B", marginTop: "4px" },
    
    filterBar: {
      backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px",
      display: "flex", gap: "16px", marginBottom: "32px", alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    },
    searchBox: {
      display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#F1F5F9", 
      padding: "10px 16px", borderRadius: "8px", flex: 1
    },
    input: { border: "none", background: "none", outline: "none", fontSize: "14px", width: "100%" },
    select: {
      padding: "10px 16px", borderRadius: "8px", border: "1px solid #E2E8F0",
      backgroundColor: "white", fontSize: "13px", fontWeight: "500", color: "#334155", outline: "none"
    },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" },
    card: {
      backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", 
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    },
    cardBody: { padding: "20px" },
    cardFooter: { 
      padding: "16px 20px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFAFA",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    },

    typePill: (bg, color) => ({
      padding: "4px 10px", borderRadius: "999px", backgroundColor: bg, color: color,
      fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em"
    }),

    modalBackdrop: { position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
    modalPanel: { backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "560px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden" },
    modalHeader: { padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" },
    formLabel: { fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" },
    formInput: { width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "14px", outlineColor: "#0EA5E9" },
  };

  return (
    <div style={styles.root}>
      <Sidebar activeId="resources" />
      <main style={styles.main}>
        <header style={styles.topNav}>
          <ProfileDropdown />
        </header>

        <div style={styles.content}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>Resources Catalog</h1>
              <p style={styles.sub}>Central database of campus facilities and equipment.</p>
            </div>
            {isAdmin && (
              <button 
                className="btn-primary" 
                onClick={handleOpenAdd}
              >
                <Plus size={18} /> Register Asset
              </button>
            )}
          </div>

          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <Search size={18} color="#94A3B8" />
              <input 
                style={styles.input} 
                placeholder="Search by name, code or building..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select style={styles.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {Object.keys(typeConfig).map(k => <option key={k} value={k}>{typeConfig[k].label}</option>)}
            </select>
            <select style={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Maintenance</option>
            </select>
            <button style={{ ...styles.select, display: "flex", alignItems: "center", gap: "8px" }}><Filter size={14} /> More Filters</button>
          </div>

          {loading ? (
            <div style={{ padding: "100px", textAlign: "center" }}><Loader2 className="animate-spin" color="#0EA5E9" size={40} /></div>
          ) : (
            <div style={styles.grid}>
              {processedResources.map(res => {
                const conf = typeConfig[res.type] || { icon: "📦", color: "#64748B", bg: "#F1F5F9", label: "Asset" };
                return (
                  <div key={res.id} style={styles.card} onMouseOver={e => e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"} onMouseOut={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}>
                    <div style={styles.cardBody}>
                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                         <div style={styles.typePill(conf.bg, conf.color)}>{conf.label}</div>
                         <div className={`badge ${res.status === 'ACTIVE' ? 'badge-active' : 'badge-rejected'}`}>
                            {res.status === 'ACTIVE' ? 'Active' : 'Offline'}
                         </div>
                       </div>
                       <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#0F172A" }}>{res.name}</h3>
                       <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#64748B" }}>
                            <Building size={14} /> {res.location}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#64748B" }}>
                            <Users size={14} /> Capacity: {res.capacity} pax
                          </div>
                          {res.availabilityWindows && (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#64748B" }}>
                              <Clock size={14} /> {res.availabilityWindows}
                            </div>
                          )}
                       </div>
                    </div>
                    <div style={styles.cardFooter}>
                      <button style={{ background: "none", border: "none", color: "#0EA5E9", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setSelectedResource(res)}>
                        <Eye size={16} /> Details
                      </button>
                      
                      <div style={{ display: "flex", gap: "8px" }}>
                        {isUser && res.status === 'ACTIVE' && (
                          <button 
                            style={{ backgroundColor: "#0EA5E9", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                            onClick={() => { setPreSelectedId(res.id); setShowBookingModal(true); }}
                          >
                            Book Now
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button onClick={() => handleOpenEdit(res)} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: "6px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", cursor: "pointer" }}><Edit2 size={14} /></button>
                            <button onClick={() => { setTargetDelete(res.id); setShowDeleteModal(true); }} style={{ background: "none", border: "1px solid #FEE2E2", borderRadius: "6px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                          </>
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

      {/* MODALS implementation */}
      {showAddModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalPanel}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: "18px", fontWeight: "700" }}>{currentEdit ? "Edit Asset" : "Register New Asset"}</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={onFormSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                 <div style={{ gridColumn: "1 / -1" }}>
                   <label style={styles.formLabel}>Resource Name</label>
                   <input required style={styles.formInput} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                   <label style={styles.formLabel}>Type</label>
                   <select style={styles.formInput} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                     <option value="LECTURE_HALL">Lecture Hall</option>
                     <option value="LAB">Lab</option>
                     <option value="MEETING_ROOM">Meeting Room</option>
                     <option value="EQUIPMENT">Equipment</option>
                   </select>
                 </div>
                 <div>
                   <label style={styles.formLabel}>Capacity</label>
                   <input type="number" style={styles.formInput} value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                 </div>
                 <div style={{ gridColumn: "1 / -1" }}>
                   <label style={styles.formLabel}>Location</label>
                   <input required style={styles.formInput} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                 </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #F1F5F9", paddingTop: "20px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Discard</button>
                <button type="submit" className="btn-primary" disabled={modalLoading}>
                  {modalLoading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBookingModal && (
        <NewBookingModal preSelectedResourceId={preSelectedId} onClose={() => setShowBookingModal(false)} onSuccess={() => setShowBookingModal(false)} />
      )}
    </div>
  );
};

export default ResourcesPage;
