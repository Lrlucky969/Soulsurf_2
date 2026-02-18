// SoulSurf – LessonsScreen
import React, { useState } from "react";
import { SURF_SPOTS, GOALS } from "../data.js";
import { LessonCard } from "../components.jsx";

export default function LessonsScreen({ data, t, dm, spotObj, setOpenLesson }) {
  const [filter, setFilter] = useState("all");
  const [activeDay, setActiveDay] = useState(data.activeDay);
  const { program, completed, toggle, total, done, streak, toggleSurfDay, surfDays } = data;
  const today = new Date().toISOString().slice(0, 10);
  const surfedToday = surfDays.includes(today);
  const savedGoal = GOALS.find(g => g.id === data.goal);

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Header Card */}
      <div style={{ background: "linear-gradient(135deg, #004D40, #00695C, #00897B)", borderRadius: 24, padding: "24px 20px", color: "white", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: 100, opacity: 0.1, transform: "rotate(-15deg)" }}>🌊</div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7 }}>Dein Surf-Programm</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, margin: "6px 0 10px", lineHeight: 1.2 }}>{data.days} Tage · {savedGoal?.emoji} {savedGoal?.name}</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>{spotObj?.emoji} {spotObj?.name}</span>
          <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>✓ {done}/{total}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, height: 7, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg, #FFB74D, #FF7043)", height: "100%", borderRadius: 10, transition: "width 0.5s ease", width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={toggleSurfDay} style={{ background: surfedToday ? "rgba(255,183,77,0.3)" : "rgba(255,255,255,0.15)", border: `1px solid ${surfedToday ? "#FFB74D" : "rgba(255,255,255,0.3)"}`, borderRadius: 12, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "white" }}>
            {surfedToday ? "🏄 Heute gesurft! ✓" : "🏄 Heute gesurft?"}
          </button>
          {streak > 0 && <span style={{ fontSize: 12, opacity: 0.8 }}>🔥 {streak} Tage Streak</span>}
        </div>
      </div>

      {/* Spot Warning */}
      {program.spotWarning && (
        <div style={{ background: dm ? "rgba(255,112,67,0.15)" : "#FFF3E0", border: `1px solid ${dm ? "rgba(255,112,67,0.3)" : "#FFB74D"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: dm ? "#FFB74D" : "#E65100", lineHeight: 1.4 }}>{program.spotWarning.replace("⚠️ ", "")}</span>
        </div>
      )}

      {/* Spot Tips */}
      {spotObj?.tips && spotObj.tips.length > 0 && (
        <div style={{ background: dm ? "rgba(30,45,61,0.6)" : "rgba(255,248,225,0.6)", borderRadius: 14, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {spotObj.tips.map((tip, i) => <span key={i} style={{ fontSize: 12, color: t.text2, lineHeight: 1.4 }}>💡 {tip}</span>)}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[{ k: "all", l: "Alle", e: "📚" }, { k: "equipment", l: "Equipment", e: "🎒" }, { k: "warmup", l: "Warm-Up", e: "🔥" }, { k: "theory", l: "Theorie", e: "📖" }, { k: "practice", l: "Praxis", e: "🏄" }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{ background: filter === f.k ? (dm ? "#4DB6AC" : "#263238") : t.inputBg, color: filter === f.k ? "white" : t.text2, border: `1px solid ${filter === f.k ? (dm ? "#4DB6AC" : "#263238") : t.inputBorder}`, borderRadius: 20, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{f.e} {f.l}</button>
        ))}
      </div>

      {/* Day Accordions */}
      {program.program.map(dayData => {
        const fl = dayData.lessons.filter(l => filter === "all" || l.type === filter);
        if (fl.length === 0) return null;
        return (
          <div key={dayData.day} style={{ marginBottom: 20 }}>
            <button onClick={() => { const next = activeDay === dayData.day ? null : dayData.day; setActiveDay(next); data.setActiveDay(next); data.saveAll({ activeDay: next }); }} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "12px 16px", cursor: "pointer" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tag {dayData.day}</span>
                {dayData.focus && <span style={{ fontSize: 12, color: t.text2, marginLeft: 8 }}>{dayData.focus}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3 }}>
                  {fl.filter(l => completed[l.id]).length}/{fl.length}
                </span>
                <span style={{ fontSize: 14, transform: activeDay === dayData.day ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}>▼</span>
              </div>
            </button>
            {activeDay === dayData.day && (
              <div style={{ paddingTop: 10 }}>
                {fl.map(lesson => (
                  <LessonCard key={lesson.id} lesson={lesson} done={!!completed[lesson.id]}
                    onToggle={() => toggle(lesson.id)}
                    onOpen={() => setOpenLesson(lesson)} dm={dm} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: "center", padding: "36px 20px", borderTop: `1px dashed ${dm ? "#2d3f50" : "#CFD8DC"}` }}>
        <span style={{ fontSize: 46, display: "block", marginBottom: 10, animation: "wave 2s ease-in-out infinite" }}>🤙</span>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 4 }}>
          {done === total && total > 0 ? "Gnarly! Alle Lektionen abgeschlossen! 🎉" : "Keep paddling, die perfekte Welle kommt!"}
        </p>
      </div>
    </div>
  );
}
