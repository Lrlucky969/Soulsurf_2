// SoulSurf – HomeScreen
import React, { useState } from "react";

export default function HomeScreen({ data, t, dm, navigate, spotObj, savedGoal }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importMsg, setImportMsg] = useState(null);

  return (
    <div style={{ paddingTop: 40, textAlign: "center" }}>
      <div style={{ fontSize: 70, marginBottom: 12, animation: "float 4s ease-in-out infinite" }}>🌊</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 10 }}>Lerne Surfen.<br /><span style={{ color: t.accent }}>Finde deinen Flow.</span></h2>
      <p style={{ fontSize: 16, color: t.text2, maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.6 }}>Dein persönliches Surf-Programm – angepasst an dein Level, Ziel und deinen Spot.</p>

      {data.hasSaved && spotObj && (
        <div style={{ background: "linear-gradient(135deg, #004D40, #00695C)", borderRadius: 20, padding: "24px 20px", marginBottom: 24, textAlign: "left", color: "white", position: "relative", overflow: "hidden", animation: "slideUp 0.5s ease forwards", opacity: 0 }}>
          <div style={{ position: "absolute", top: -15, right: -15, fontSize: 80, opacity: 0.1 }}>🏄</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7, marginBottom: 8 }}>💾 Gespeichertes Programm</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{data.days} Tage · {savedGoal?.emoji} {savedGoal?.name}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "4px 10px", fontSize: 12 }}>{spotObj?.emoji} {spotObj?.name}</span>
            <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "4px 10px", fontSize: 12 }}>✓ {data.done}/{data.total} erledigt</span>
            {data.diaryCount > 0 && <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "4px 10px", fontSize: 12 }}>📓 {data.diaryCount} Einträge</span>}
            {data.streak > 0 && <span style={{ background: "rgba(255,183,77,0.25)", borderRadius: 16, padding: "4px 10px", fontSize: 12 }}>🔥 {data.streak} Tage Streak</span>}
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, height: 6, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: "linear-gradient(90deg, #FFB74D, #FF7043)", height: "100%", borderRadius: 10, width: `${data.total > 0 ? (data.done / data.total) * 100 : 0}%` }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("lessons")} style={{ flex: 1, background: "white", color: "#004D40", border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>▶ Weiter surfen</button>
            <button onClick={() => setShowResetConfirm(true)} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 14, padding: "14px 18px", fontSize: 14, cursor: "pointer" }}>🗑</button>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div style={{ background: dm ? "#2d2010" : "#FFF3E0", border: "2px solid #FFB74D", borderRadius: 16, padding: "20px", marginBottom: 24, textAlign: "center" }}>
          <p style={{ fontSize: 15, color: dm ? "#e8eaed" : "#4E342E", marginBottom: 14 }}>Programm und Fortschritt wirklich löschen?</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => { data.resetProgram(); setShowResetConfirm(false); }} style={{ background: "#E53935", color: "white", border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Ja, löschen</button>
            <button onClick={() => setShowResetConfirm(false)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Abbrechen</button>
          </div>
        </div>
      )}

      <button onClick={() => navigate("builder")} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "18px 44px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)", marginBottom: 40 }}>{data.hasSaved ? "Neues Programm erstellen" : "Programm erstellen 🤙"}</button>

      {/* Quick Nav Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 40 }}>
        {[
          { icon: "✈️", title: "Trip planen", desc: "Karte, Wetter & Packliste", screen: "trip" },
          { icon: "📊", title: "Fortschritt", desc: "Badges & Skill Tree", screen: "progress" },
          { icon: "🏄", title: "Board-Berater", desc: "Finde dein perfektes Board", screen: "equipment" },
          { icon: "📓", title: "Tagebuch", desc: "Deine Surf-Sessions", screen: "diary", needsProgram: true },
        ].map((card, i) => {
          const disabled = card.needsProgram && !data.hasSaved;
          return (
            <button key={i} onClick={() => !disabled && navigate(card.screen)} style={{
              background: t.card, borderRadius: 18, padding: "20px 16px", border: `1px solid ${t.cardBorder}`,
              cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, textAlign: "left",
              animation: "slideUp 0.5s ease forwards", animationDelay: `${i * 100}ms`, opacity: 0,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: t.text3, lineHeight: 1.4 }}>{card.desc}</div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: 24, background: t.card, borderRadius: 20, border: `1px dashed ${dm ? "#2d3f50" : "#CFD8DC"}`, marginBottom: 20 }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: t.text3, fontStyle: "italic" }}>☮ "The best surfer out there is the one having the most fun." — Phil Edwards</p>
      </div>

      <label style={{ display: "inline-block", background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 12, padding: "10px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
        📂 Backup importieren
        <input type="file" accept=".json" onChange={e => { if (e.target.files?.[0]) { /* TODO: import handler */ } e.target.value = ""; }} style={{ display: "none" }} />
      </label>
      {importMsg && <div style={{ marginTop: 12, textAlign: "center", padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, color: importMsg.startsWith("✅") ? "#4DB6AC" : "#E65100" }}>{importMsg}</div>}
    </div>
  );
}
