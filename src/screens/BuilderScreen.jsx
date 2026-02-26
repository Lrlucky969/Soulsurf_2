// SoulSurf – BuilderScreen v6.6.2 (V1: UX Fix – uses onboarding data)
// Only asks: Board Type + Program Duration
// Experience, Goal, and Spot are pre-filled from onboarding profile
import React, { useState } from "react";
import { SURF_SPOTS, GOALS, BOARD_TYPES } from "../data.js";

export default function BuilderScreen({ data, t, dm, i18n, navigate }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [step, setStep] = useState(1);

  // Pre-filled from onboarding
  const spotObj = SURF_SPOTS.find(s => s.id === data.spot);
  const goalObj = GOALS.find(g => g.id === data.primaryGoal || data.goal);

  const build = () => {
    const result = data.build();
    if (result) navigate("lessons");
  };

  return (
    <div style={{ paddingTop: 30 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span style={{ fontSize: 40 }}>🛠</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, margin: "8px 0 6px" }}>{_("builder.title")}</h2>
        <p style={{ fontSize: 13, color: t.text3 }}>{_("builder.step", "Schritt")} {step} {_("builder.of", "von")} 2</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: s === step ? 28 : 10, height: 10, borderRadius: 5, background: s <= step ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"), transition: "all 0.3s ease", cursor: s < step ? "pointer" : "default" }} onClick={() => { if (s < step) setStep(s); }} />
          ))}
        </div>
      </div>

      {/* v6.6.2: Profile summary from onboarding */}
      {(spotObj || goalObj) && (
        <div style={{ background: dm ? "rgba(0,150,136,0.06)" : "#F1F8F7", border: `1px solid ${dm ? "rgba(0,150,136,0.12)" : "#C8E6C9"}`, borderRadius: 14, padding: "10px 14px", marginBottom: 20, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{_("builder.fromProfile", "Aus Profil")}:</span>
          {spotObj && <span style={{ fontSize: 11, color: t.text }}>{spotObj.emoji} {spotObj.name.split(",")[0]}</span>}
          {goalObj && <span style={{ fontSize: 11, color: t.text }}>· 🎯 {goalObj.name}</span>}
          {data.skillLevel && <span style={{ fontSize: 11, color: t.text }}>· {data.skillLevel === "beginner" ? "🟢" : "🟡"} {data.skillLevel}</span>}
        </div>
      )}

      {step === 1 && (
        <div style={{ animation: "slideUp 0.4s ease forwards", opacity: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.text2, display: "block", marginBottom: 10 }}>{_("builder.board")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {BOARD_TYPES.map(b => (
                <button key={b.id} onClick={() => data.setBoard(b.id)} style={{ background: data.board === b.id ? "linear-gradient(135deg, #5C6BC0, #7986CB)" : t.inputBg, color: data.board === b.id ? "white" : t.text, border: data.board === b.id ? "2px solid #5C6BC0" : `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "14px 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                  <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{b.emoji}</span>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 12 }}>{b.label}</span>
                  <span style={{ display: "block", fontSize: 10, color: data.board === b.id ? "rgba(255,255,255,0.7)" : "#90A4AE", marginTop: 2 }}>{b.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>{_("ob.next", "Weiter")} →</button>
            <button onClick={() => { data.setBoard(""); setStep(2); }} style={{ background: t.inputBg, color: t.text3, border: `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 13, cursor: "pointer" }}>Skip</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: "slideUp 0.4s ease forwards", opacity: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.text2, display: "block", marginBottom: 10 }}>{_("builder.howManyDays")} <span style={{ fontSize: 28, fontWeight: 900, color: "#009688", fontFamily: "'Playfair Display', serif" }}>{data.days}</span></label>
            <input type="range" min="3" max="30" value={data.days} onChange={e => data.setDays(parseInt(e.target.value))} style={{ width: "100%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, marginTop: 6 }}>
              <span>3 {_("builder.days", "Tage")}</span>
              <span style={{ color: "#009688", fontWeight: 700 }}>{data.days <= 5 ? "Quick Start" : data.days <= 10 ? "Solide Basis" : data.days <= 20 ? "Intensiv" : "Full Program"}</span>
              <span>30 {_("builder.days", "Tage")}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ background: t.inputBg, color: t.text2, border: `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 14, cursor: "pointer" }}>{_("g.back")}</button>
            <button onClick={build} style={{ flex: 1, background: "linear-gradient(135deg, #009688, #00796B)", color: "white", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)" }}>{_("builder.generate")} 🏄</button>
          </div>
        </div>
      )}
    </div>
  );
}
