import { useState, useEffect } from "react";
import { getComments, addComment, editComment, deleteComment } from "../../api/ticketApi";
import { useAuth } from "../../auth/AuthContext";

export default function CommentSection({ ticketId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    getComments(ticketId).then(setComments);
  }, [ticketId]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    const comment = await addComment(ticketId, newComment.trim());
    setComments([...comments, comment]);
    setNewComment("");
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

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Comments ({comments.length})</h2>

      {comments.map((c) => (
        <div key={c.id} style={styles.comment}>
          <div style={styles.commentHeader}>
            <strong>{c.authorName}</strong>
            <span style={styles.date}>{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          {editingId === c.id ? (
            <div>
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} style={styles.textarea} />
              <div style={styles.actions}>
                <button onClick={() => handleEdit(c.id)} style={styles.saveBtn}>Save</button>
                <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          ) : (
            <p style={styles.content}>{c.content}</p>
          )}
          {c.authorId === user?.id && editingId !== c.id && (
            <div style={styles.actions}>
              <button onClick={() => { setEditingId(c.id); setEditContent(c.content); }} style={styles.editBtn}>Edit</button>
              <button onClick={() => handleDelete(c.id)} style={styles.deleteBtn}>Delete</button>
            </div>
          )}
        </div>
      ))}

      <div style={styles.newComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          style={styles.textarea}
        />
        <button onClick={handleAdd} style={styles.addBtn}>Post Comment</button>
      </div>
    </div>
  );
}

const styles = {
  container: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem" },
  heading: { fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" },
  comment: { borderBottom: "1px solid #f3f4f6", paddingBottom: "1rem", marginBottom: "1rem" },
  commentHeader: { display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" },
  date: { fontSize: "0.8rem", color: "#9ca3af" },
  content: { color: "#374151", margin: 0 },
  textarea: { width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "0.9rem", boxSizing: "border-box", minHeight: 70 },
  actions: { display: "flex", gap: "0.5rem", marginTop: "0.4rem" },
  editBtn: { background: "none", border: "1px solid #d1d5db", borderRadius: 6, padding: "2px 10px", cursor: "pointer", fontSize: "0.8rem" },
  deleteBtn: { background: "none", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 6, padding: "2px 10px", cursor: "pointer", fontSize: "0.8rem" },
  saveBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: "0.85rem" },
  cancelBtn: { background: "none", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: "0.85rem" },
  newComment: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  addBtn: { alignSelf: "flex-end", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "0.5rem 1.2rem", fontWeight: 600, cursor: "pointer" },
};