// SoulSurf v4.0 – App Shell with Navigation
import React, { useState, useEffect } from "react";
import useSurfData from "./useSurfData.js";
import { SURF_SPOTS, GOALS } from "./data.js";
import { WaveBackground, LessonCard, LessonModal } from "./components.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import BuilderScreen from "./screens/BuilderScreen.jsx";
import LessonsScreen from "./screens/LessonsScreen.jsx";
import TripScreen from "./screens/TripScreen.jsx";
import DiaryScreen from "./screens/DiaryScreen.jsx";
import ProgressScreen from "./screens/ProgressScreen.jsx";
import EquipmentScreen from "./screens/EquipmentScreen.jsx";

const THEMES = {
  light: { bg: "#FFFDF7", text: "#263238", text2: "#546E7A", text3: "#90A4AE", accent: "#009688", card: "rgba(255,255,255,0.9)", cardBorder: "rgba(0,0,0,0.06)", inputBg: "#F5F5F5", inputBorder: "#E0E0E0" },
  dark: { bg: "#0d1820", text: "#e8eaed", text2: "#9aa0a6", text3: "#5f6368", accent: "#4DB6AC", card: "rgba(30,45,61,0.8)", cardBorder: "rgba(255,255,255,0.06)", inputBg: "rgba(255,255,255,0.05)", inputBorder: "#2d3f50" },
};

const NAV_ITEMS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "lessons", icon: "📚", label: "Lektionen" },
  { id: "trip", icon: "✈️", label: "Trip" },
  { id: "diary", icon: "📓", label: "Tagebuch" },
  { id: "progress", icon: "📊", label: "Fortschritt" },
  { id: "equipment", icon: "🏄", label: "Equipment" },
];

export default function SurfApp() {
  const data = useSurfData();
  const [screen, setScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openLesson, setOpenLesson] = useState(null);

  const dm = data.darkMode;
  const t = dm ? THEMES.dark : THEMES.light;
  const spotObj = SURF_SPOTS.find(s => s.id === data.spot);
  const savedGoal = data.hasSaved ? GOALS.find(g => g.id === data.goal) : null;

  const navigate = (s) => { setScreen(s); setMenuOpen(false); };

  useEffect(() => {
    try {
      if (!document.querySelector('link[data-soulsurf-fonts]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap";
        link.setAttribute("data-soulsurf-fonts", "1");
        document.head.appendChild(link);
      }
    } catch {}
  }, []);

  const LessonModalEl = openLesson ? <LessonModal lesson={openLesson} onClose={() => setOpenLesson(null)} dm={dm} /> : null;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: t.text, transition: "background 0.3s ease" }}>
      <WaveBackground dm={dm} />
      <style>{`
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes wave { 0% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-15deg); } 100% { transform: rotate(0deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,150,136,0.3); border-radius: 10px; }
        input[type=range] { accent-color: #009688; }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: dm ? "rgba(13,24,32,0.95)" : "rgba(255,253,247,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${t.cardBorder}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4, color: t.text }}>{menuOpen ? "✕" : "☰"}</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("home")}>
            <span style={{ fontSize: 22 }}>🏄</span>
            <div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: t.text, display: "block", lineHeight: 1 }}>SoulSurf</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>v4.0.1</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {data.streak > 0 && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#FFB74D" }}>🔥 {data.streak}</span>}
          <button onClick={data.toggleDark} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4 }}>{dm ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.4)" }}>
          <nav onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 280, background: dm ? "#1a2332" : "#FFFDF7", borderRight: `1px solid ${t.cardBorder}`, paddingTop: 70, boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
            {data.hasSaved && spotObj && (
              <div style={{ padding: "0 20px 16px", borderBottom: `1px solid ${t.cardBorder}`, marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: t.text3, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>Aktuelles Programm</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{data.days} Tage · {savedGoal?.emoji} {savedGoal?.name}</div>
                <div style={{ fontSize: 12, color: t.accent }}>{spotObj?.emoji} {spotObj?.name}</div>
                <div style={{ background: dm ? "rgba(255,255,255,0.1)" : "#E0E0E0", borderRadius: 6, height: 4, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ background: "linear-gradient(90deg, #FFB74D, #FF7043)", height: "100%", borderRadius: 6, width: `${data.total > 0 ? (data.done / data.total) * 100 : 0}%` }} />
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, marginTop: 4 }}>{data.done}/{data.total} erledigt</div>
              </div>
            )}
            {NAV_ITEMS.map(item => {
              const isActive = screen === item.id;
              const needsProgram = ["lessons", "diary"].includes(item.id);
              const disabled = needsProgram && !data.hasSaved;
              return (
                <button key={item.id} onClick={() => !disabled && navigate(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 24px",
                  background: isActive ? (dm ? "rgba(77,182,172,0.12)" : "#E0F2F1") : "transparent",
                  border: "none", borderLeft: isActive ? "3px solid #009688" : "3px solid transparent",
                  cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
                  fontSize: 15, fontWeight: isActive ? 700 : 500, color: isActive ? t.accent : t.text,
                  fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {disabled && <span style={{ fontSize: 9, color: t.text3 }}>(Programm nötig)</span>}
                </button>
              );
            })}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${t.cardBorder}`, marginTop: 8 }}>
              <button onClick={() => { data.exportData(); setMenuOpen(false); }} style={{ width: "100%", padding: "10px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 10, fontSize: 12, cursor: "pointer", color: t.text2, fontFamily: "'Space Mono', monospace" }}>💾 Backup exportieren</button>
            </div>
            <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3 }}>v4.0.1 · ride the vibe ☮</span>
            </div>
          </nav>
        </div>
      )}

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 100px", position: "relative" }}>
        {screen === "home" && <HomeScreen data={data} t={t} dm={dm} navigate={navigate} spotObj={spotObj} savedGoal={savedGoal} />}
        {screen === "builder" && <BuilderScreen data={data} t={t} dm={dm} navigate={navigate} />}
        {screen === "lessons" && data.program && <LessonsScreen data={data} t={t} dm={dm} spotObj={spotObj} setOpenLesson={setOpenLesson} />}
        {screen === "trip" && <TripScreen data={data} t={t} dm={dm} spotObj={spotObj} navigate={navigate} />}
        {screen === "diary" && <DiaryScreen data={data} t={t} dm={dm} setOpenLesson={setOpenLesson} />}
        {screen === "progress" && <ProgressScreen data={data} t={t} dm={dm} setOpenLesson={setOpenLesson} />}
        {screen === "equipment" && <EquipmentScreen data={data} t={t} dm={dm} />}
      </main>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 80, background: dm ? "rgba(13,24,32,0.97)" : "rgba(255,253,247,0.97)", backdropFilter: "blur(12px)", borderTop: `1px solid ${t.cardBorder}`, display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 6px)" }}>
        {NAV_ITEMS.slice(0, 5).map(item => {
          const isActive = screen === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
              color: isActive ? t.accent : t.text3, fontSize: 10, fontWeight: isActive ? 700 : 500,
              fontFamily: "'Space Mono', monospace",
            }}>
              <span style={{ fontSize: 20, transform: isActive ? "scale(1.15)" : "scale(1)" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      {LessonModalEl}
    </div>
  );
}
