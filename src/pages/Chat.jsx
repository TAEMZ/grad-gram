import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Send, MessageSquare, Sparkles } from "lucide-react";

function Chat({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const user = auth.currentUser;
  const uid = user?.uid;

  useEffect(() => {
    if (!roomId) return;

    const messagesQuery = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !uid) return;

    setSending(true);
    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: newMessage.trim(),
        authorId: uid,
        authorName: user.displayName || "Classmate",
        authorEmail: user.email || "",
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="card-glass animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 220px)",
        minHeight: "500px",
        maxHeight: "800px",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(14, 18, 26, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MessageSquare size={18} color="var(--gold-primary)" />
          <div>
            <h3 style={{ fontSize: "1.1rem", color: "#fff", margin: 0 }}>
              Cohort Discussion
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Live peer messages & commencement chatter
            </span>
          </div>
        </div>
        <span className="badge-titanium">{messages.length} Messages</span>
      </div>

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              margin: "auto",
              color: "var(--text-muted)",
              padding: "40px 20px",
            }}
          >
            <Sparkles size={32} color="var(--gold-primary)" style={{ margin: "0 auto 12px" }} />
            <h4 style={{ color: "#fff", marginBottom: 4 }}>No messages yet</h4>
            <p style={{ fontSize: "0.875rem" }}>
              Be the first to say hello to your graduating classmates!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.authorId === uid;
            const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(
              msg.authorName || msg.authorId
            )}&backgroundColor=141924`;

            const timeStr = msg.createdAt?.toDate
              ? new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                }).format(msg.createdAt.toDate())
              : "Just now";

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignSelf: isSelf ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  flexDirection: isSelf ? "row-reverse" : "row",
                }}
              >
                <img
                  src={avatarUrl}
                  alt={msg.authorName}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    border: "1.5px solid rgba(229, 184, 105, 0.3)",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      justifyContent: isSelf ? "flex-end" : "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: isSelf ? "var(--gold-light)" : "var(--text-primary)",
                      }}
                    >
                      {isSelf ? "You" : msg.authorName}
                    </span>
                    <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                      {timeStr}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.9375rem",
                      lineHeight: "1.45",
                      background: isSelf
                        ? "linear-gradient(135deg, rgba(229, 184, 105, 0.18), rgba(184, 134, 59, 0.12))"
                        : "rgba(255, 255, 255, 0.05)",
                      border: isSelf
                        ? "1px solid rgba(229, 184, 105, 0.3)"
                        : "1px solid var(--border-subtle)",
                      color: isSelf ? "#ffffff" : "var(--slate-200)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "14px 20px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(14, 18, 26, 0.8)",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          className="input-base"
          placeholder="Send a message to your classmates..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !newMessage.trim()}
          style={{ padding: "10px 18px" }}
        >
          <Send size={15} />
          <span>{sending ? "Sending..." : "Send"}</span>
        </button>
      </form>
    </div>
  );
}

export default Chat;
