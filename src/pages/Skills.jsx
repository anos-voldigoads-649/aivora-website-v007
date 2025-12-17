import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FiCheckCircle, FiAward } from "react-icons/fi";
import "./skills.css";

export default function Skills() {
  const [field, setField] = useState("");
  const [steps, setSteps] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [details, setDetails] = useState({});
  const [notes, setNotes] = useState({});
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setNotes(JSON.parse(localStorage.getItem("notes") || "{}"));
    setProgress(JSON.parse(localStorage.getItem("progress") || "{}"));
    setStreak(Number(localStorage.getItem("streak") || 0));
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("progress", JSON.stringify(progress));
    localStorage.setItem("streak", streak);
  }, [notes, progress, streak]);

  const generate = async () => {
    const res = await fetch("/.netlify/functions/generateSkill", {
      method: "POST",
      body: JSON.stringify({ field }),
    });
    const data = await res.json();
    setSteps(data.steps);
    setProgress({});
    setExpanded(null);
  };

  const loadDetails = async (step, i) => {
    setExpanded(expanded === i ? null : i);
    if (details[i]) return;

    const res = await fetch("/.netlify/functions/stepDetails", {
      method: "POST",
      body: JSON.stringify({ field, step }),
    });
    const data = await res.json();
    setDetails((d) => ({ ...d, [i]: data.explanation }));
  };

  const completeStep = (i) => {
    if (!progress[i]) setStreak(streak + 1);
    setProgress({ ...progress, [i]: !progress[i] });
  };

  const completed = Object.values(progress).filter(Boolean).length;
  const badge = completed >= steps.length ? "Master Badge 🏆" : null;

  return (
    <div className="skills-container">
      <Navbar />

      <h1 className="title">AI Skill Learning Dashboard</h1>

      <div className="input-box">
        <input
          placeholder="Enter skill (AI, Web Dev...)"
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
        <button onClick={generate}>Generate</button>
      </div>

      <div className="stats">
        <span>🔥 Streak: {streak}</span>
        <span>✅ Completed: {completed}/{steps.length}</span>
        {badge && <span><FiAward /> {badge}</span>}
      </div>

      <div className="roadmap">
        {steps.map((step, i) => (
          <div key={i} className={`card ${progress[i] ? "done" : ""}`}>
            <div className="card-header" onClick={() => loadDetails(step, i)}>
              <h3>{step}</h3>
              <button onClick={(e) => {
                e.stopPropagation();
                completeStep(i);
              }}>
                <FiCheckCircle />
              </button>
            </div>

            {expanded === i && (
              <div className="card-body">
                <pre>{details[i]}</pre>

                <textarea
                  placeholder="Your notes..."
                  value={notes[i] || ""}
                  onChange={(e) =>
                    setNotes({ ...notes, [i]: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
