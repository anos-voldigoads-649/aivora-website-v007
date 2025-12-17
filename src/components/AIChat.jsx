import React, { useState } from "react";
import "./aiChat.css";
import aiAvatar from "../assets/ai-avatar.jpg";

export default function AIChat({ open, onClose }) {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hello! I am Aivora. How can I assist you today?" }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!text.trim() || loading) return;

    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("https://aivora-v181.netlify.app/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.text }),
      });

      const data = await res.json();
      const reply = data.response || data.reply || "Sorry, I couldn't respond.";

      setMessages((prev) => [
        ...prev,
        { from: "ai", text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "AI server unavailable" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="chat-window chat-popup">
      <div className="chat-header">
        <span className="chat-title">Aivora AI Assistant</span>
        <button className="mini" onClick={onClose}>✖</button>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg ${msg.from === "user" ? "user" : "assistant"}`}
          >
            {msg.from !== "user" && (
              <img src={aiAvatar} alt="AI" className="chat-avatar" />
            )}

            <div className="bubble">
              {msg.text}
            </div>

            {msg.from === "user" && (
              <img
                src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png"
                alt="User"
                className="chat-avatar"
              />
            )}
          </div>
        ))}
      </div>

      <div className="composer">
        <textarea
          rows={1}
          value={text}
          placeholder="Ask something..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button className="send-btn" onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}
