import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

/* ================= CONFIG ================= */
const AI_ENDPOINT =
  "https://aivora-v181.netlify.app/.netlify/functions/chat";

/* ================= AI TYPES ================= */
const AI_TYPES = {
  helpful: {
    label: "🤝 Helpful",
    prompt: "You are a helpful, friendly assistant. Answer clearly.",
  },
  technical: {
    label: "💻 Technical",
    prompt:
      "You are a senior technical expert. Be precise, structured, and code-focused.",
  },
  emotional: {
    label: "💖 Emotional",
    prompt:
      "You are an empathetic emotional assistant. Be calm and supportive.",
  },
  mentor: {
    label: "🎓 Mentor",
    prompt:
      "You are a career mentor. Give guidance, motivation, and steps.",
  },
};

export default function Chat() {
  /* ================= STATES ================= */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [dark, setDark] = useState(true);
  const [aiType, setAiType] = useState("helpful");

  const [voiceReply, setVoiceReply] = useState(true);
  const [voiceType, setVoiceType] = useState("default");

  const [listening, setListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const endRef = useRef(null);
  const audioUnlocked = useRef(false);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ================= HISTORY ================= */
  useEffect(() => {
    const saved = localStorage.getItem("aivora_chat");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("aivora_chat", JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= VOICE ================= */
  function unlockAudio() {
    if (audioUnlocked.current) return;
    speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    audioUnlocked.current = true;
  }

  function speak(text) {
    if (!voiceReply) return;
    unlockAudio();
    speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    if (voiceType !== "default") {
      const v = voices.find((x) =>
        x.name.toLowerCase().includes(voiceType)
      );
      if (v) u.voice = v;
    }

    u.rate = 0.95;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  }

  /* ================= MIC ================= */
  function startMic() {
    if (listening) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Your browser does not support Speech Recognition. Try Chrome or Edge.");
      return;
    }

    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => {
      setListening(true);
      console.log("Mic started");
    };

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      console.log("Mic result:", transcript);
    };

    rec.onerror = (e) => {
      console.error("Mic error:", e.error);
      setListening(false);
      if (e.error === 'not-allowed') {
        alert("Microphone access denied. Please allow microphone permissions.");
      } else {
        alert("Microphone error: " + e.error);
      }
    };

    rec.onend = () => {
      setListening(false);
      console.log("Mic stopped");
    };

    try {
      rec.start();
    } catch (err) {
      console.error("Mic start error:", err);
      setListening(false);
    }
  }

  /* ================= SEND ================= */
  async function send(text) {
    if (!text.trim() || loading) return;
    unlockAudio();

    const userMsg = {
      from: "user",
      text,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `${AI_TYPES[aiType].prompt}
User: ${text}
Assistant:`;

      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const reply =
        data?.response ||
        data?.reply ||
        "Sorry, I couldn’t respond.";

      const botMsg = {
        from: "bot",
        text: reply,
        time: new Date().toLocaleTimeString(),
      };

      setMessages((p) => [...p, botMsg]);
      speak(reply);
    } catch {
      setMessages((p) => [
        ...p,
        { from: "bot", text: "⚠️ Server error", time: "" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */
  return (
    <div style={dark ? styles.pageDark : styles.page}>
      <Navbar />
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>✨ AIVORA</div>

        <div style={styles.topBtns}>
          <select
            value={aiType}
            onChange={(e) => setAiType(e.target.value)}
            style={styles.select}
          >
            {Object.entries(AI_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <button onClick={() => setVoiceReply(!voiceReply)}>
            🔊
          </button>
          <button onClick={() => setShowHistory(!showHistory)}>
            📜
          </button>
          <button onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* CHAT */}
        <div style={styles.chatBox}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.row,
                justifyContent:
                  m.from === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  maxWidth: "min(85%, 420px)",
                  background:
                    m.from === "user"
                      ? "linear-gradient(135deg,#2563eb,#00f2fe)"
                      : "#111827",
                }}
              >
                {m.text}
                <div style={styles.time}>{m.time}</div>
              </div>
            </div>
          ))}

          {/* RESERVED SPACE FOR TYPING */}
          <div style={{ minHeight: 24 }}>
            {loading && (
              <div style={styles.typing}>Aivora typing…</div>
            )}
          </div>

          <div ref={endRef} />
        </div>

        {/* HISTORY PANEL */}
        {showHistory && (
          <div style={styles.history}>
            <h4>Chat History</h4>
            {messages.map((m, i) => (
              <div key={i} style={styles.historyItem}>
                <b>{m.from === "user" ? "You:" : "AI:"}</b>{" "}
                {m.text.slice(0, 40)}…
              </div>
            ))}
            <button
              onClick={() => setMessages([])}
              style={styles.clear}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={`Ask Aivora (${AI_TYPES[aiType].label})`}
          style={styles.input}
        />

        <button onClick={() => send(input)} style={styles.send}>
          ➤
        </button>

        <button onClick={startMic} style={styles.mic}>
          {listening ? "🎙️" : "🎤"}
        </button>

        {!isMobile && (
          <select
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value)}
            style={styles.select}
          >
            <option value="default">Voice</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  pageDark: {
    height: "100vh",
    overflow: "hidden",
    background: "radial-gradient(circle,#020617,#000)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  page: {
    height: "100vh",
    overflow: "hidden",
    background: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    height: 56,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #1e293b",
    flexShrink: 0,
  },
  logo: {
    fontWeight: 900,
    fontSize: 18,
    background:
      "linear-gradient(90deg,#00f2fe,#4facfe,#a855f7)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  topBtns: { display: "flex", gap: 6 },

  main: {
    flex: 1,
    display: "flex",
    position: "relative",
    overflow: "hidden",
  },

  chatBox: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    overscrollBehavior: "contain",
  },

  row: { display: "flex", marginBottom: 10 },

  bubble: {
    padding: 14,
    borderRadius: 16,
    boxShadow: "0 0 14px rgba(0,255,255,.15)",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },

  time: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 4,
  },

  typing: {
    fontSize: 13,
    opacity: 0.6,
    paddingLeft: 8,
  },

  inputBar: {
    height: 64,
    display: "flex",
    gap: 6,
    padding: "0 10px",
    alignItems: "center",
    borderTop: "1px solid #1e293b",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "#020617",
    color: "#fff",
  },

  send: {
    padding: "0 16px",
    borderRadius: 12,
    background:
      "linear-gradient(135deg,#00f2fe,#4facfe)",
    border: "none",
  },

  mic: {
    padding: "0 12px",
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    border: "none",
  },

  select: {
    background: "#020617",
    color: "#fff",
    borderRadius: 8,
    border: "1px solid #334155",
    padding: 6,
  },

  history: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 260,
    height: "100%",
    background: "#020617",
    borderLeft: "1px solid #1e293b",
    padding: 12,
    overflowY: "auto",
    zIndex: 20,
  },

  historyItem: {
    fontSize: 12,
    marginBottom: 6,
  },

  clear: {
    marginTop: 10,
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 6,
  },
};
