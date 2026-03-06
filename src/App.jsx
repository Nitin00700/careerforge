import { useState } from "react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "llama3-70b-8192";

async function callGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

const STEPS = ["Info", "Experience", "Skills", "Preview"];

const emptyExp = () => ({ company: "", role: "", duration: "", description: "" });
const emptyEdu = () => ({ school: "", degree: "", year: "" });

const initForm = {
  name: "", email: "", phone: "", location: "", linkedin: "", title: "", summary: "",
  experience: [emptyExp()],
  education: [emptyEdu()],
  skills: "",
};

export default function CareerForge() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initForm);
  const [loading, setLoading] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setExp = (i, k, v) => setForm(f => { const e = [...f.experience]; e[i] = { ...e[i], [k]: v }; return { ...f, experience: e }; });
  const setEdu = (i, k, v) => setForm(f => { const e = [...f.education]; e[i] = { ...e[i], [k]: v }; return { ...f, education: e }; });

  const aiWrite = async (field, idx) => {
    setLoading(field + (idx ?? ""));
    try {
      let prompt = "", result = "";
      if (field === "summary") {
        prompt = `Write a punchy 2-sentence professional resume summary for: Name: ${form.name}, Title: ${form.title}. Skills: ${form.skills}. Return ONLY the summary, no labels or quotes.`;
        result = await callGroq(prompt);
        set("summary", result);
      } else if (field === "desc") {
        const e = form.experience[idx];
        prompt = `Write 3 strong resume bullet points for: Role: ${e.role}, Company: ${e.company}. Start each with a powerful action verb. Separate bullets with newlines. Return ONLY the bullets, no preamble.`;
        result = await callGroq(prompt);
        setExp(idx, "description", result);
      } else if (field === "skills") {
        prompt = `List 14 relevant skills for a ${form.title || "professional"} resume. Return ONLY a comma-separated list, no numbering or extra text.`;
        result = await callGroq(prompt);
        set("skills", result);
      }
    } finally { setLoading(null); }
  };

  const skillList = form.skills.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Epilogue:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080a0f;
          --surface: #0e1117;
          --border: #1e2433;
          --accent: #3b82f6;
          --accent2: #06b6d4;
          --text: #f1f5f9;
          --muted: #64748b;
          --card: #111827;
        }
        body { font-family: 'Epilogue', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

        /* HEADER */
        .hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px; border-bottom: 1px solid var(--border);
          background: var(--surface);
          position: sticky; top: 0; z-index: 100;
        }
        .logo {
          font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .logo-sub { font-size: 11px; color: var(--muted); letter-spacing: 3px; text-transform: uppercase; font-family: 'Epilogue', sans-serif; margin-top: 2px; }
        .badge { background: linear-gradient(135deg, #3b82f6, #06b6d4); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px; }

        /* STEPPER */
        .stepper { display: flex; align-items: center; justify-content: center; gap: 0; padding: 36px 48px 0; }
        .s-wrap { display: flex; align-items: center; }
        .s-dot {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          border: 2px solid var(--border); background: var(--surface); color: var(--muted);
          transition: all 0.3s; position: relative; z-index: 1;
        }
        .s-dot.active { border-color: var(--accent); background: var(--accent); color: #fff; box-shadow: 0 0 20px rgba(59,130,246,0.4); }
        .s-dot.done { border-color: var(--accent2); background: var(--accent2); color: #fff; }
        .s-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-left: 8px; font-weight: 600; }
        .s-label.active { color: var(--text); }
        .s-line { width: 60px; height: 2px; background: var(--border); margin: 0 4px; transition: background 0.3s; }
        .s-line.done { background: var(--accent2); }

        /* CONTENT */
        .page { max-width: 900px; margin: 40px auto; padding: 0 48px 100px; }

        .card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 20px; padding: 40px;
          margin-bottom: 20px;
          animation: fadeUp 0.4s ease;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .card-head {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 32px; padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .card-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .card-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
        .card-desc { font-size: 13px; color: var(--muted); margin-top: 2px; }

        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full { grid-column: 1 / -1; }

        .field { display: flex; flex-direction: column; gap: 8px; }
        .lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
        .inp {
          background: var(--bg); border: 1.5px solid var(--border);
          border-radius: 10px; padding: 12px 16px;
          color: var(--text); font-family: 'Epilogue', sans-serif; font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none; width: 100%;
        }
        .inp:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .ta { resize: vertical; min-height: 96px; line-height: 1.7; }

        .ai-row { display: flex; gap: 10px; align-items: flex-start; }
        .ai-row .inp { flex: 1; }
        .aibtn {
          flex-shrink: 0; padding: 11px 16px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border: none; border-radius: 10px;
          color: #fff; font-size: 12px; font-weight: 700;
          cursor: pointer; font-family: 'Syne', sans-serif;
          letter-spacing: 0.5px; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 15px rgba(59,130,246,0.3);
        }
        .aibtn:hover { opacity: 0.9; transform: translateY(-1px); }
        .aibtn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .hint { font-size: 11px; color: var(--muted); margin-top: 5px; }

        .exp-card {
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 12px; padding: 24px; margin-bottom: 16px;
          border-left: 3px solid var(--accent);
        }
        .exp-num { font-family: 'Syne', sans-serif; font-size: 12px; color: var(--accent); font-weight: 700; margin-bottom: 16px; letter-spacing: 1px; }

        .add-btn {
          width: 100%; padding: 14px;
          background: transparent; border: 2px dashed var(--border);
          border-radius: 12px; color: var(--muted);
          font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .add-btn:hover { border-color: var(--accent); color: var(--accent); }

        .nav { display: flex; justify-content: space-between; margin-top: 36px; }
        .btn-back {
          padding: 13px 28px; background: transparent;
          border: 1.5px solid var(--border); border-radius: 10px;
          color: var(--muted); font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-back:hover { border-color: var(--text); color: var(--text); }
        .btn-next {
          padding: 13px 32px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border: none; border-radius: 10px;
          color: #fff; font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.3px;
          box-shadow: 0 4px 20px rgba(59,130,246,0.35);
        }
        .btn-next:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.4); }

        /* SPINNER */
        .spin { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: rot 0.6s linear infinite; }
        @keyframes rot { to { transform: rotate(360deg); } }

        /* PREVIEW */
        .preview-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .preview-label { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
        .preview-actions { display: flex; gap: 10px; }
        .btn-edit {
          padding: 10px 22px; background: transparent;
          border: 1.5px solid var(--border); border-radius: 8px;
          color: var(--muted); font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-edit:hover { border-color: var(--text); color: var(--text); }
        .btn-dl {
          padding: 10px 24px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border: none; border-radius: 8px;
          color: #fff; font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700; cursor: pointer;
          box-shadow: 0 4px 15px rgba(59,130,246,0.3);
          transition: all 0.2s;
        }
        .btn-dl:hover { transform: translateY(-1px); }

        /* RESUME DOC */
        .resume-paper {
          background: #fff; color: #111;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }
        .resume-top {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 44px 52px; color: #fff;
        }
        .r-name { font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 800; letter-spacing: -1.5px; line-height: 1; }
        .r-title {
          font-size: 14px; font-weight: 400; margin-top: 8px;
          color: #94a3b8; letter-spacing: 2px; text-transform: uppercase;
        }
        .r-contacts { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px; }
        .r-contact { font-size: 12px; color: #cbd5e1; display: flex; align-items: center; gap: 6px; }

        .resume-body { padding: 44px 52px; font-family: 'Epilogue', sans-serif; }
        .r-sec { margin-bottom: 32px; }
        .r-sec-title {
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 3px;
          color: #3b82f6; margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .r-sec-title::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

        .r-summary { font-size: 14px; color: #475569; line-height: 1.8; }

        .r-exp { margin-bottom: 20px; }
        .r-exp-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .r-role { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; }
        .r-company { font-size: 13px; color: #64748b; font-weight: 500; margin-top: 2px; }
        .r-dur { font-size: 12px; color: #94a3b8; background: #f1f5f9; padding: 3px 10px; border-radius: 20px; white-space: nowrap; font-weight: 500; }
        .r-bullets { font-size: 13px; color: #475569; line-height: 1.8; white-space: pre-wrap; }

        .r-skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .r-skill {
          background: #eff6ff; color: #3b82f6;
          border: 1px solid #bfdbfe;
          padding: 5px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
        }
        .r-edu-row { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .r-edu-row:last-child { border-bottom: none; }
        .r-degree { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: #0f172a; }
        .r-school { font-size: 12px; color: #64748b; margin-top: 2px; }
        .r-year { font-size: 12px; color: #94a3b8; font-weight: 500; }

        @media print {
          .hdr, .stepper, .page > :not(.preview-wrap) { display: none !important; }
          .preview-toolbar { display: none !important; }
          body { background: #fff !important; }
          .resume-paper { box-shadow: none !important; border-radius: 0 !important; }
          .page { margin: 0 !important; padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <div>
        {/* HEADER */}
        <div className="hdr">
          <div>
            <div className="logo">CareerForge</div>
            <div className="logo-sub">AI Resume Builder</div>
          </div>
          <div className="badge">✦ AI Powered</div>
        </div>

        {/* STEPPER */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div className="s-wrap" key={s}>
              <div className={`s-dot ${i === step ? "active" : i < step ? "done" : ""}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <div className={`s-label ${i === step ? "active" : ""}`}>{s}</div>
              {i < STEPS.length - 1 && <div className={`s-line ${i < step ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        <div className="page">

          {/* ── STEP 0: Info ── */}
          {step === 0 && (
            <div className="card">
              <div className="card-head">
                <div className="card-icon">👤</div>
                <div>
                  <div className="card-title">Personal Information</div>
                  <div className="card-desc">Let's start with the basics</div>
                </div>
              </div>
              <div className="grid2">
                <div className="field">
                  <span className="lbl">Full Name</span>
                  <input className="inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Alex Johnson" />
                </div>
                <div className="field">
                  <span className="lbl">Professional Title</span>
                  <input className="inp" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Full Stack Developer" />
                </div>
                <div className="field">
                  <span className="lbl">Email</span>
                  <input className="inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="alex@email.com" />
                </div>
                <div className="field">
                  <span className="lbl">Phone</span>
                  <input className="inp" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
                </div>
                <div className="field">
                  <span className="lbl">Location</span>
                  <input className="inp" value={form.location} onChange={e => set("location", e.target.value)} placeholder="San Francisco, CA" />
                </div>
                <div className="field">
                  <span className="lbl">LinkedIn</span>
                  <input className="inp" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/alexj" />
                </div>
                <div className="field full">
                  <span className="lbl">Professional Summary</span>
                  <div className="ai-row">
                    <textarea className="inp ta" value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="Write your summary or click AI Write..." />
                    <button className="aibtn" disabled={!!loading} onClick={() => aiWrite("summary")}>
                      {loading === "summary" ? <><span className="spin" /> Writing...</> : "✦ AI Write"}
                    </button>
                  </div>
                  <div className="hint">Fill your title first, then let AI craft a powerful summary</div>
                </div>
              </div>
              <div className="nav">
                <div />
                <button className="btn-next" onClick={() => setStep(1)}>Experience →</button>
              </div>
            </div>
          )}

          {/* ── STEP 1: Experience ── */}
          {step === 1 && (
            <div className="card">
              <div className="card-head">
                <div className="card-icon">💼</div>
                <div>
                  <div className="card-title">Work Experience & Education</div>
                  <div className="card-desc">Add your positions and let AI write bullet points</div>
                </div>
              </div>

              {form.experience.map((exp, i) => (
                <div className="exp-card" key={i}>
                  <div className="exp-num">POSITION {i + 1}</div>
                  <div className="grid2" style={{ marginBottom: 16 }}>
                    <div className="field">
                      <span className="lbl">Company</span>
                      <input className="inp" value={exp.company} onChange={e => setExp(i, "company", e.target.value)} placeholder="Google" />
                    </div>
                    <div className="field">
                      <span className="lbl">Role</span>
                      <input className="inp" value={exp.role} onChange={e => setExp(i, "role", e.target.value)} placeholder="Software Engineer" />
                    </div>
                    <div className="field">
                      <span className="lbl">Duration</span>
                      <input className="inp" value={exp.duration} onChange={e => setExp(i, "duration", e.target.value)} placeholder="Jan 2022 – Present" />
                    </div>
                  </div>
                  <div className="field">
                    <span className="lbl">Description</span>
                    <div className="ai-row">
                      <textarea className="inp ta" value={exp.description} onChange={e => setExp(i, "description", e.target.value)} placeholder="Describe your work or let AI write it..." />
                      <button className="aibtn" disabled={!!loading} onClick={() => aiWrite("desc", i)}>
                        {loading === `desc${i}` ? <><span className="spin" /> Writing...</> : "✦ AI Write"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={() => setForm(f => ({ ...f, experience: [...f.experience, emptyExp()] }))}>+ Add Another Position</button>

              <div style={{ marginTop: 36 }}>
                <div className="card-head" style={{ marginBottom: 24 }}>
                  <div className="card-icon">🎓</div>
                  <div>
                    <div className="card-title">Education</div>
                  </div>
                </div>
                {form.education.map((edu, i) => (
                  <div className="grid2" style={{ marginBottom: 16 }} key={i}>
                    <div className="field">
                      <span className="lbl">School</span>
                      <input className="inp" value={edu.school} onChange={e => setEdu(i, "school", e.target.value)} placeholder="MIT" />
                    </div>
                    <div className="field">
                      <span className="lbl">Degree</span>
                      <input className="inp" value={edu.degree} onChange={e => setEdu(i, "degree", e.target.value)} placeholder="B.S. Computer Science" />
                    </div>
                    <div className="field">
                      <span className="lbl">Year</span>
                      <input className="inp" value={edu.year} onChange={e => setEdu(i, "year", e.target.value)} placeholder="2021" />
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={() => setForm(f => ({ ...f, education: [...f.education, emptyEdu()] }))}>+ Add Education</button>
              </div>

              <div className="nav">
                <button className="btn-back" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-next" onClick={() => setStep(2)}>Skills →</button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Skills ── */}
          {step === 2 && (
            <div className="card">
              <div className="card-head">
                <div className="card-icon">⚡</div>
                <div>
                  <div className="card-title">Skills & Expertise</div>
                  <div className="card-desc">Add skills or let AI suggest the best ones for your role</div>
                </div>
              </div>
              <div className="field">
                <span className="lbl">Skills (comma-separated)</span>
                <div className="ai-row">
                  <textarea className="inp ta" style={{ minHeight: 120 }} value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="React, Node.js, TypeScript, AWS..." />
                  <button className="aibtn" disabled={!!loading} onClick={() => aiWrite("skills")}>
                    {loading === "skills" ? <><span className="spin" /> Generating...</> : "✦ AI Suggest"}
                  </button>
                </div>
                <div className="hint">AI will suggest relevant skills based on your title and experience</div>
              </div>
              {skillList.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {skillList.map((s, i) => (
                    <div key={i} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#60a5fa", fontWeight: 600 }}>{s}</div>
                  ))}
                </div>
              )}
              <div className="nav">
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-next" onClick={() => setStep(3)}>Preview Resume →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Preview ── */}
          {step === 3 && (
            <div className="preview-wrap">
              <div className="preview-toolbar">
                <div className="preview-label">Your Resume ✦</div>
                <div className="preview-actions">
                  <button className="btn-edit" onClick={() => setStep(0)}>✏️ Edit</button>
                  <button className="btn-dl" onClick={() => window.print()}>⬇ Download PDF</button>
                </div>
              </div>
              <div className="resume-paper">
                <div className="resume-top">
                  <div className="r-name">{form.name || "Your Name"}</div>
                  <div className="r-title">{form.title || "Professional Title"}</div>
                  <div className="r-contacts">
                    {form.email && <div className="r-contact">✉ {form.email}</div>}
                    {form.phone && <div className="r-contact">☎ {form.phone}</div>}
                    {form.location && <div className="r-contact">📍 {form.location}</div>}
                    {form.linkedin && <div className="r-contact">🔗 {form.linkedin}</div>}
                  </div>
                </div>
                <div className="resume-body">
                  {form.summary && (
                    <div className="r-sec">
                      <div className="r-sec-title">Profile</div>
                      <div className="r-summary">{form.summary}</div>
                    </div>
                  )}
                  {form.experience.some(e => e.company || e.role) && (
                    <div className="r-sec">
                      <div className="r-sec-title">Experience</div>
                      {form.experience.map((e, i) => (e.company || e.role) && (
                        <div className="r-exp" key={i}>
                          <div className="r-exp-top">
                            <div>
                              <div className="r-role">{e.role}</div>
                              <div className="r-company">{e.company}</div>
                            </div>
                            {e.duration && <div className="r-dur">{e.duration}</div>}
                          </div>
                          {e.description && <div className="r-bullets">{e.description}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {form.education.some(e => e.school || e.degree) && (
                    <div className="r-sec">
                      <div className="r-sec-title">Education</div>
                      {form.education.map((e, i) => (e.school || e.degree) && (
                        <div className="r-edu-row" key={i}>
                          <div>
                            <div className="r-degree">{e.degree}</div>
                            <div className="r-school">{e.school}</div>
                          </div>
                          <div className="r-year">{e.year}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {skillList.length > 0 && (
                    <div className="r-sec">
                      <div className="r-sec-title">Skills</div>
                      <div className="r-skills">
                        {skillList.map((s, i) => <div className="r-skill" key={i}>{s}</div>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
