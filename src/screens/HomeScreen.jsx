// SoulSurf – HomeScreen 2.0 (Onboarding + Dashboard)
import React, { useState, useEffect, useMemo } from "react";
import { SURF_SPOTS, GOALS } from "../data.js";

const ONBOARDING_KEY = "soulsurf_onboarded";

export default function HomeScreen({ data, t, dm, navigate, spotObj, savedGoal }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [onboarded, setOnboarded] = useState(true); // assume true until checked
  const [obStep, setObStep] = useState(0); // onboarding step

  useEffect(() => {
    try { const v = localStorage.getItem(ONBOARDING_KEY); if (!v) setOnboarded(false); } catch {}
  }, []);

  const finishOnboarding = (route) => {
    try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
    setOnboarded(true);
    if (route) navigate(route);
  };

  // Dashboard data
  const nextBadge = useMemo(() => {
    const BADGES = [
      { name: "Paddler", threshold: 10, cat: "lessons", emoji: "📗" },
      { name: "Wave Catcher", threshold: 25, cat: "lessons", emoji: "📘" },
      { name: "Shredder", threshold: 50, cat: "lessons", emoji: "📕" },
      { name: "Tagebuch-Starter", threshold: 3, cat: "diary", emoji: "✏️" },
      { name: "Reflector", threshold: 7, cat: "diary", emoji: "📓" },
    ];
    return BADGES.find(b => b.cat === "lessons" ? data.done < b.threshold : data.diaryCount < b.threshold);
  }, [data.done, data.diaryCount]);

  const coachingTip = useMemo(() => {
    if (data.coaching?.tips?.length > 0) return data.coaching.tips[0];
    return null;
  }, [data.coaching]);

  const progressPct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

  // === ONBOARDING FLOW (first-time users) ===
  if (!onboarded && !data.hasSaved) {
    return (
      <div style={{ paddingTop: 30, textAlign: "center" }}>
        {obStep === 0 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <div style={{ fontSize: 80, marginBottom: 16, animation: "float 4s ease-in-out infinite" }}>🏄</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 10 }}>Willkommen bei<br /><span style={{ color: t.accent }}>SoulSurf</span></h1>
            <p style={{ fontSize: 16, color: t.text2, maxWidth: 380, margin: "0 auto 32px", lineHeight: 1.6 }}>Dein persönlicher Surf-Coach. Lerne Surfen, plane Trips und tracke deinen Fortschritt – alles in einer App.</p>
            <button onClick={() => setObStep(1)} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "18px 44px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)" }}>Los geht's 🤙</button>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {[0, 1, 2].map(s => <div key={s} style={{ width: s === obStep ? 24 : 8, height: 8, borderRadius: 4, background: s === obStep ? t.accent : (dm ? "#2d3f50" : "#E0E0E0"), transition: "all 0.3s ease" }} />)}
            </div>
          </div>
        )}

        {obStep === 1 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 8 }}>Was willst du machen?</h2>
            <p style={{ fontSize: 15, color: t.text2, marginBottom: 28 }}>Wähle deinen Einstieg – du kannst jederzeit alles nutzen.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380, margin: "0 auto" }}>
              {[
                { icon: "📚", title: "Surfen lernen", desc: "Personalisiertes Programm mit Lektionen, Videos & Tipps", route: "builder", color: "#009688" },
                { icon: "✈️", title: "Trip planen", desc: "Spots entdecken, Wetter checken, Packliste erstellen", route: "trip", color: "#5C6BC0" },
                { icon: "🏄", title: "Board finden", desc: "Board-Berater basierend auf Gewicht und Level", route: "equipment", color: "#FF7043" },
              ].map((opt, i) => (
                <button key={i} onClick={() => finishOnboarding(opt.route)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 16,
                  background: t.card, border: `2px solid ${t.cardBorder}`, cursor: "pointer", textAlign: "left",
                  animation: "slideUp 0.4s ease both", animationDelay: `${i * 100}ms`,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${opt.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: t.text }}>{opt.title}</div>
                    <div style={{ fontSize: 12, color: t.text2, marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <span style={{ fontSize: 16, color: t.text3 }}>→</span>
                </button>
              ))}
            </div>
            <button onClick={() => finishOnboarding(null)} style={{ marginTop: 20, background: "none", border: "none", color: t.text3, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Überspringen</button>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              {[0, 1, 2].map(s => <div key={s} style={{ width: s === obStep ? 24 : 8, height: 8, borderRadius: 4, background: s <= obStep ? t.accent : (dm ? "#2d3f50" : "#E0E0E0"), transition: "all 0.3s ease", cursor: s < obStep ? "pointer" : "default" }} onClick={() => { if (s < obStep) setObStep(s); }} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // === DASHBOARD (returning users with program) ===
  if (data.hasSaved && spotObj) {
    const today = new Date().toISOString().slice(0, 10);
    const surfedToday = (data.surfDays || []).includes(today);
    const hour = new Date().getHours();
    const timeGreeting = hour < 10 ? "Guten Morgen! ☀️" : hour < 14 ? "Moin! 🤙" : hour < 18 ? "Hey! 🌊" : "Guten Abend! 🌅";
    return (
      <div style={{ paddingTop: 20 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginTop: 4 }}>
            {data.streak > 2 ? "Du bist on fire! 🔥" : progressPct >= 80 ? "Fast geschafft! 💪" : progressPct >= 50 ? "Weiter so! 🤙" : timeGreeting}
          </h2>
        </div>

        {/* Progress Card */}
        <div style={{ background: "linear-gradient(135deg, #004D40, #00695C)", borderRadius: 20, padding: "20px", color: "white", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.08 }}>🏄</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", opacity: 0.7 }}>{savedGoal?.emoji} {savedGoal?.name}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, marginTop: 4 }}>{spotObj.emoji} {spotObj.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900 }}>{progressPct}%</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.7 }}>{data.done}/{data.total}</div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, height: 6, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ background: "linear-gradient(90deg, #FFB74D, #FF7043)", height: "100%", borderRadius: 8, width: `${progressPct}%`, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => navigate("lessons")} style={{ flex: 1, background: "white", color: "#004D40", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>▶ Weiter surfen</button>
            <button onClick={() => setShowResetConfirm(true)} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 14, cursor: "pointer" }}>🗑</button>
          </div>
        </div>
        {showResetConfirm && (
          <div style={{ background: dm ? "#2d2010" : "#FFF3E0", border: "2px solid #FFB74D", borderRadius: 14, padding: "16px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: dm ? "#e8eaed" : "#4E342E", marginBottom: 12 }}>Programm und Fortschritt löschen?</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => { data.resetProgram(); setShowResetConfirm(false); }} style={{ background: "#E53935", color: "white", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Löschen</button>
              <button onClick={() => setShowResetConfirm(false)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
          {[
            { emoji: "🔥", value: data.streak, label: "Streak", color: "#FFB74D" },
            { emoji: "📓", value: data.diaryCount, label: "Einträge", color: "#7986CB" },
            { emoji: "📚", value: data.total - data.done, label: "Offen", color: t.accent },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{s.emoji}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Next Badge */}
        {nextBadge && (
          <button onClick={() => navigate("progress")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: dm ? "rgba(255,183,77,0.08)" : "#FFF8E1", border: `1px solid ${dm ? "rgba(255,183,77,0.15)" : "#FFE0B2"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 28 }}>{nextBadge.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: dm ? "#FFB74D" : "#E65100" }}>Nächstes Badge: {nextBadge.name}</div>
              <div style={{ fontSize: 11, color: t.text2 }}>
                {nextBadge.cat === "lessons" ? `Noch ${nextBadge.threshold - data.done} Lektionen` : `Noch ${nextBadge.threshold - data.diaryCount} Einträge`}
              </div>
            </div>
            <span style={{ fontSize: 14, color: t.text3 }}>→</span>
          </button>
        )}

        {/* Surf Today Toggle on Dashboard */}
        <button onClick={data.toggleSurfDay} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", marginBottom: 12, borderRadius: 14, cursor: "pointer", textAlign: "left",
          background: surfedToday ? (dm ? "rgba(255,183,77,0.12)" : "#FFF8E1") : t.card,
          border: `1px solid ${surfedToday ? "#FFB74D" : t.cardBorder}`,
        }}>
          <span style={{ fontSize: 24 }}>{surfedToday ? "🏄‍♂️" : "🏖️"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: surfedToday ? "#E65100" : t.text }}>{surfedToday ? "Heute gesurft! ✓" : "Heute gesurft?"}</div>
            <div style={{ fontSize: 11, color: t.text2 }}>{surfedToday ? `Streak: ${data.streak} Tag${data.streak > 1 ? "e" : ""} 🔥` : "Tippe um deinen Surf-Tag zu loggen"}</div>
          </div>
        </button>

        {/* Coaching Tip */}
        {coachingTip && (
          <button onClick={() => navigate("progress")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: dm ? "rgba(102,187,106,0.08)" : "#E8F5E9", border: `1px solid ${dm ? "rgba(102,187,106,0.15)" : "#C8E6C9"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 24 }}>{coachingTip.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#66BB6A" : "#2E7D32", textTransform: "uppercase" }}>Coach-Tipp</div>
              <div style={{ fontSize: 12, color: t.text2, marginTop: 2 }}>{coachingTip.tip}</div>
            </div>
            <span style={{ fontSize: 14, color: t.text3 }}>→</span>
          </button>
        )}

        {/* Quick Nav */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
          {[
            { icon: "🌊", label: "Forecast", screen: "forecast" },
            { icon: "✈️", label: "Trip", screen: "trip" },
            { icon: "📓", label: "Tagebuch", screen: "diary" },
            { icon: "🏄", label: "Equipment", screen: "equipment" },
          ].map((card, i) => (
            <button key={i} onClick={() => navigate(card.screen)} style={{ background: t.card, borderRadius: 14, padding: "14px 8px", border: `1px solid ${t.cardBorder}`, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{card.icon}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 600, color: t.text2 }}>{card.label}</div>
            </button>
          ))}
        </div>

        <div style={{ padding: 20, background: t.card, borderRadius: 16, border: `1px dashed ${dm ? "#2d3f50" : "#CFD8DC"}`, textAlign: "center" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, fontStyle: "italic" }}>☮ "The best surfer is the one having the most fun." — Phil Edwards</p>
        </div>
      </div>
    );
  }

  // === DEFAULT HOME (onboarded but no program) ===
  return (
    <div style={{ paddingTop: 40, textAlign: "center" }}>
      <div style={{ fontSize: 70, marginBottom: 12, animation: "float 4s ease-in-out infinite" }}>🌊</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 10 }}>Lerne Surfen.<br /><span style={{ color: t.accent }}>Finde deinen Flow.</span></h2>
      <p style={{ fontSize: 16, color: t.text2, maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.6 }}>Erstelle dein persönliches Surf-Programm oder plane deinen nächsten Trip.</p>

      <button onClick={() => navigate("builder")} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "18px 44px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)", marginBottom: 32 }}>Programm erstellen 🤙</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { icon: "✈️", title: "Trip planen", desc: "Spots & Packliste", screen: "trip" },
          { icon: "🌊", title: "Forecast", desc: "Surf-Bedingungen", screen: "forecast" },
          { icon: "🏄", title: "Board-Berater", desc: "Finde dein Board", screen: "equipment" },
        ].map((card, i) => (
          <button key={i} onClick={() => navigate(card.screen)} style={{
            background: t.card, borderRadius: 18, padding: "20px 16px", border: `1px solid ${t.cardBorder}`,
            cursor: "pointer", textAlign: "left", animation: "slideUp 0.4s ease both", animationDelay: `${i * 100}ms`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 4 }}>{card.title}</div>
            <div style={{ fontSize: 12, color: t.text3, lineHeight: 1.4 }}>{card.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: 20, background: t.card, borderRadius: 16, border: `1px dashed ${dm ? "#2d3f50" : "#CFD8DC"}` }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, fontStyle: "italic" }}>☮ "The best surfer is the one having the most fun." — Phil Edwards</p>
      </div>
    </div>
  );
}
