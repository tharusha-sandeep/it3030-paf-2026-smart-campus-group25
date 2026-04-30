// ═══════════════════════════════════════════════════════════════════════════
// FILE: src/components/tickets/CommentSection.jsx
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { getComments, addComment, editComment, deleteComment } from "../../api/ticketApi";
import { useAuth } from "../../auth/AuthContext";
import { Send, Pencil, Trash2, X, Check, MessageSquare } from "lucide-react";

const CommentSection = ({ ticketId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getComments(ticketId).then(setComments); }, [ticketId]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await addComment(ticketId, newComment.trim());
      setComments([...comments, comment]);
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id) => {
    const updated = await editComment(ticketId, id, editContent);
    setComments(comments.map((c) => (c.id === id ? updated : c)));
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    await deleteComment(ticketId, id);
    setComments(comments.filter((c) => c.id !== id));
  };

  const s = {
    card: { backgroundColor: "white", borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" },
    cardHeader: { padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "10px" },
    comment: { padding: "16px 24px", borderBottom: "1px solid #F8FAFC", display: "flex", gap: "12px" },
    avatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#0F172A", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0 },
    textarea: { width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "14px", outlineColor: "#0EA5E9", resize: "vertical", minHeight: "70px", boxSizing: "border-box", fontFamily: "inherit" },
    iconBtn: (danger) => ({ background: "none", border: "none", cursor: "pointer", color: danger ? "#EF4444" : "#94A3B8", padding: "4px", borderRadius: "4px", display: "flex", alignItems: "center" }),
    newCommentArea: { padding: "16px 24px", display: "flex", gap: "12px", alignItems: "flex-end", backgroundColor: "#FAFAFA" },
  };

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <MessageSquare size={18} color="#0EA5E9" />
        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#0F172A", margin: 0 }}>
          Comments ({comments.length})
        </h3>
      </div>

      {comments.length === 0 && (
        <div style={{ padding: "32px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
          No comments yet. Be the first to add one.
        </div>
      )}

      {comments.map((c) => (
        <div key={c.id} style={s.comment}>
          <div style={s.avatar}>{c.authorName?.[0]?.toUpperCase() || "U"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0F172A" }}>{c.authorName}</span>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>{new Date(c.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
                {c.authorId === user?.id && editingId !== c.id && (
                  <>
                    <button style={s.iconBtn(false)} onClick={() => { setEditingId(c.id); setEditContent(c.content); }} title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button style={s.iconBtn(true)} onClick={() => handleDelete(c.id)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingId === c.id ? (
              <div>
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} style={s.textarea} />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleEdit(c.id)}>
                    <Check size={13} /> Save
                  </button>
                  <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setEditingId(null)}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, margin: 0 }}>{c.content}</p>
            )}
          </div>
        </div>
      ))}

      <div style={s.newCommentArea}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#0EA5E9", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={s.textarea}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleAdd(); }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button className="btn-primary" onClick={handleAdd} disabled={!newComment.trim() || submitting} style={{ padding: "8px 16px" }}>
              <Send size={14} /> Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
