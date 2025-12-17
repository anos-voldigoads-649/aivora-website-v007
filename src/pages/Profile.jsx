import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../services/AuthContext";
import { db, storage } from "../services/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    profilePic: "",
    name: "",
    profession: "",
    phone: "",
    age: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setForm((p) => ({ ...p, ...snap.data() }));
      setLoading(false);
    })();
  }, [user]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    await setDoc(doc(db, "users", user.uid), { ...form, email: user.email }, { merge: true });
    setEdit(false);
  };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const r = ref(storage, `profile/${user.uid}.jpg`);
    await uploadBytes(r, file);
    update("profilePic", await getDownloadURL(r));
    setUploading(false);
  };

  const filled = Object.values(form).filter(Boolean).length;
  const progress = Math.round((filled / Object.keys(form).length) * 100);

  if (!user) return <Center>Not logged in</Center>;

  return (
    <div className="page">
      <Navbar />
      <AnimatePresence>
        {loading ? (
          <Skeleton />
        ) : (
          <motion.div className="card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <aside className="sidebar">
              <motion.img whileHover={{ scale: 1.08 }} src={form.profilePic || "https://cdn-icons-png.flaticon.com/512/147/147144.png"} />
              {edit && (
                <label className="upload">
                  {uploading ? "Uploading…" : "Change Photo"}
                  <input hidden type="file" onChange={(e) => upload(e.target.files[0])} />
                </label>
              )}
              <h2>{form.name || "Your Name"}</h2>
              <p>{form.profession || "Your profession"}</p>

              <div className="progress">
                <div className="bar" style={{ width: `${progress}%` }} />
                <span>{progress}% Profile Complete</span>
              </div>
            </aside>

            <main className="main">
              <h1>Profile Details</h1>
              <Field label="Email" value={user.email} />
              <Field label="Name" value={form.name} edit={edit} onChange={(v) => update("name", v)} />
              <Field label="Profession" value={form.profession} edit={edit} onChange={(v) => update("profession", v)} />
              <Field label="Phone" value={form.phone} edit={edit} onChange={(v) => update("phone", v)} />
              <Field label="Age" value={form.age} edit={edit} onChange={(v) => update("age", v)} />
              <Field label="Bio" value={form.bio} edit={edit} textarea onChange={(v) => update("bio", v)} />

              <div className="actions">
                {!edit ? (
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => setEdit(true)}>Edit Profile</motion.button>
                ) : (
                  <>
                    <button className="save" onClick={save}>Save</button>
                    <button className="cancel" onClick={() => setEdit(false)}>Cancel</button>
                  </>
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: radial-gradient(circle at top, #7c3aed, #020617);
          padding: 0 0 20px 0;
        }
        .card {
          margin: auto;
          display: grid;
          grid-template-columns: 260px 1fr;
          width: 100%;
          max-width: 1000px;
          background: linear-gradient(180deg, rgba(15,23,42,0.95), rgba(2,6,23,0.95));
          border-radius: 32px;
          box-shadow: 0 50px 120px rgba(0,0,0,0.6);
          color: #e5e7eb;
        }
        .sidebar {
          padding: 40px 24px;
          text-align: center;
          background: linear-gradient(180deg,#4f46e5,#7c3aed);
        }
        .sidebar img {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 4px solid white;
          object-fit: cover;
        }
        .upload { cursor: pointer; font-size: 13px; }
        .progress { margin-top: 20px; }
        .bar { height: 6px; background: #22d3ee; border-radius: 999px; }
        .main { padding: 48px; }
        .actions { margin-top: 30px; display: flex; gap: 14px; }
        button { padding: 12px 28px; border-radius: 999px; border: none; cursor: pointer; }
        .save { background: #22c55e; }
        .cancel { background: #ef4444; color: white; }
      `}</style>
    </div>
  );
}

function Field({ label, value, edit, onChange, textarea }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="field">
      <label>{label}</label>
      {edit ? (
        textarea ? <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /> : <input value={value || ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="text">{value || "—"}</div>
      )}
      <style>{`
        .field { margin-bottom: 18px; }
        label { font-size: 14px; color: #c7d2fe; }
        input, textarea {
          width: 100%;
          margin-top: 6px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: white;
        }
        .text { margin-top: 8px; }
      `}</style>
    </motion.div>
  );
}

function Skeleton() {
  return <div style={{ width: 900, height: 500, borderRadius: 32, background: 'linear-gradient(90deg,#1e293b,#334155,#1e293b)', animation: 'pulse 1.5s infinite' }} />;
}

function Center({ children }) {
  return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>{children}</div>;
}
