// SoulSurf – BuilderScreen (4-Step Builder)
import React, { useState } from "react";
import { SURF_SPOTS, GOALS, BOARD_TYPES, EXPERIENCE_LEVELS } from "../data.js";

export default function BuilderScreen({ data, t, dm, i18n, navigate }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [step, setStep] = useState(1);
  const [spotSearch, setSpotSearch] = useState("");
  const spots = SURF_SPOTS.filter(s => s.name.toLowerCase().includes(spotSearch.toLowerCase()) || s.waveType.toLowerCase().includes(spotSearch.toLowerCase()));

  const build = () => {
    const result = data.build();
    if (result) navigate("lessons");
  };

  return (
    <div style={{ paddingTop: 30 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span style={{ fontSize: 40 }}>🛠<</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: t.text, margin: "8px 0 6px" }}>{_("builder.title")}</h2>
        <p style={{ fontSize: 15, color: t.text3 }}>Schritt {step} von 4<</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ width: s === step ? 28 : 10, height: 10, borderRadius: 5, background: s <= step ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"), transition: "all 0.3s ease", cursor: s < step ? "pointer" : "default" }} onClick={() => { if (s < step) setStep(s); }} />
          ))}
        <</div>
      <</div>

      {step === 1 && (
        <div style={{ animation: "slideUp 0.4s ease forwards", opacity: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.text2, display: "block", marginBottom: 10 }}>{_("builder.board")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {BOARD_TYPES.map(b => (
                <button key={b.id} onClick={() => data.setBoard(b.id)} style={{ background: data.board === b.id ? "linear-gradient(135deg, #5C6BC0, #7986CB)" : t.inputBg, color: data.board === b.id ? "white" : t.text, border: data.board === b.id ? "2px solid #5C6BC0" : `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "14px 10px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                  <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{b.emoji}<</span>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 12 }}>{b.label}<</span>
                  <span style={{ display: "block", fontSize: 10, color: data.board === b.id ? "rgba(255,255,255,0.7)" : "#90A4AE", marginTop: 2 }}>{b.desc}<</span>
                <</button>
              ))}
            <</div>
          <</div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.text2, display: "block", marginBottom: 10 }}>{_("builder.experience")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {EXPERIENCE_LEVELS.map(e => (
                <button key={e.id} onClick={() => data.setExperience(e.id)} style={{ background: data.experience === e.id ? "linear-gradient(135deg, #66BB6A, #43A047)" : t.inputBg, color: data.experience === e.id ? "white" : t.text, border: data.experience === e.id ? "2px solid #43A047" : `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 22, marginRight: 8 }}>{e.emoji}<</span>{e.label}
                <</button>
              ))}
            <</div>
          <</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>Weiter →<</button>
            <button onClick={() => { data.setBoard(""); data.setExperience(""); setStep(2); }} style={{ background: t.inputBg, color: t.text3, border: `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 13, cursor: "pointer" }}>Skip<</button>
          <</div>
        <</div>
      )}

      {step === 2 && (
        <div style={{ animation: "slideUp 0.4s ease forwards", opacity: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.text2, display: "block", marginBottom: 10 }}>{_("builder.howManyDays")} <span style={{ fontSize: 28, fontWeight: 900, color: "#009688", fontFamily: "'Playfair Display', serif" }}>{data.days}<</span><</label>
            <input type="range" min="3" max="30" value={data.days} onChange={e => data.setDays(parseInt(e.target.value))} style={{ width: "100%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, marginTop: 6 }}>
              <span>3 Tage<</span>
              <span style={{ color: "#009688", fontWeight: 700 }}>{data.days <= 5 ? "Quick Start" : data.days <= 10 ? "Solide Basis" : data.days <= 20 ? "Intensiv" : "Full Program"}<</span>
              <span>30 Tage<</span>
            <</div>
          <</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ background: t.inputBg, color: t.text2, border: `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 14, cursor: "pointer" }}>{_("g.back")}</button>
            <button onClick={() => setStep(3)} style={{ flex: 1, background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>Weiter →<</button>
          <</div>
        <</div>
      )}

      {step === 3 && (
        <div style={{ animation: "slideUp 0.4s ease forwards", opacity: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.text2, display: "block", marginBottom: 10 }}>{_("builder.goal")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => data.setGoal(g.id)} style={{ background: data.goal === g.id ? "linear-gradient(135deg, #FF7043, #FFB74D)" : t.inputBg, color: data.goal === g.id ? "white" : t.text, border: data.goal === g.id ? "2px solid #FF7043" : `2px solid ${t.inputBorder}`, borderRadius: 14, padding: 16, fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{g.emoji}<</span>{g.name}
                <</button>
              ))}
            <</div>
          <</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ background: t.inputBg, color: t.text2, border: `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 14, cursor: "pointer" }}>{_("g.back")}</button>
            <button onClick={() => { if (data.goal) setStep(4); }} disabled={!data.goal} style={{ flex: 1, background: data.goal ? "linear-gradient(135deg, #009688, #4DB6AC)" : "#E0E0E0", color: data.goal ? "white" : "#9E9E9E", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: data.goal ? "pointer" : "not-allowed", fontFamily: "'Playfair Display', serif" }}>Weiter →<</button>
          <</div>
        <</div>
      )}

      {step === 4 && (
        <div style={{ animation: "slideUp 0.4s ease forwards", opacity: 0 }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: t.text2, display: "block", marginBottom: 10 }}>{_("builder.spot")}</label>
            <input type="text" placeholder="{_("builder.searchSpot")}" value={spotSearch} onChange={e => setSpotSearch(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `2px solid ${t.inputBorder}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginBottom: 12, background: t.inputBg, color: t.text }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 340, overflowY: "auto" }}>
              {spots.map(s => (
                <button key={s.id} onClick={() => data.setSpot(s.id)} style={{ background: data.spot === s.id ? "linear-gradient(135deg, #5C6BC0, #7986CB)" : t.inputBg, color: data.spot === s.id ? "white" : t.text, border: data.spot === s.id ? "2px solid #5C6BC0" : `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "12px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 18, marginRight: 6 }}>{s.emoji}<</span>{s.name}
                  <div style={{ fontSize: 11, color: data.spot === s.id ? "rgba(255,255,255,0.8)" : "#90A4AE", marginTop: 2, fontFamily: "'Space Mono', monospace" }}>{s.waveType}<</div>
                  <div style={{ fontSize: 10, color: data.spot === s.id ? "rgba(255,255,255,0.6)" : "#B0BEC5", marginTop: 1 }}>{s.season} · {s.water}<</div>
                <</button>
              ))}
            <</div>
          <</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(3)} style={{ background: t.inputBg, color: t.text2, border: `2px solid ${t.inputBorder}`, borderRadius: 14, padding: "16px 20px", fontSize: 14, cursor: "pointer" }}>{_("g.back")}</button>
            <button onClick={build} disabled={!data.spot} style={{ flex: 1, background: data.spot ? "linear-gradient(135deg, #009688, #00796B)" : "#E0E0E0", color: data.spot ? "white" : "#9E9E9E", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: data.spot ? "pointer" : "not-allowed", fontFamily: "'Playfair Display', serif", boxShadow: data.spot ? "0 8px 30px rgba(0,150,136,0.3)" : "none" }}>{_("builder.generate")}</button>
          <</div>
        <</div>
      )}
    <</div>
  );
}
