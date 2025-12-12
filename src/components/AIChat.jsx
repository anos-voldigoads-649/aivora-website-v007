import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";
import "./AIChat.css";
import aiAvatar from "../assets/ai-avatar.jpg";

export default function AIChat({ open, onClose }) {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hello! I am Aivora. How can I assist you today?" }
  ]);
  const [text, setText] = useState("");

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async function sendMessage() {
    if (!text.trim()) return;

    const userMsg = { from: "user", text };
    setMessages((m) => [...m, userMsg]);

    try {
      const result = await model.generateContent(text);
      const aiResponse = result.response.text();

      const aiMsg = { from: "ai", text: aiResponse };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "ai", text: "⚠️ Error: Unable to connect to AI" },
      ]);
    }

    setText("");
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
          <div key={i} className={`msg ${msg.from === "user" ? "user" : "assistant"}`}>
            {msg.from !== "user" && (
              <img 
                src={aiAvatar} 
                alt="AI" 
                className="chat-avatar" 
              />
            )}
            <div className={`bubble ${msg.from === "ai" && messages.length - 1 === i && "typing"}`}>
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
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
        />
        <button className="send-btn" onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}
