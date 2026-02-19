// SoulSurf – ProgressScreen (Badges, Skill Tree, Coaching)
import React from "react";
import { CONTENT_POOL, SKILL_TREE } from "../data.js";

const BADGES = [
  { id: "lessons-10", emoji: "📗", name: "Paddler", desc: "10 Lektionen", cat: "lessons", threshold: 10 },
  { id: "lessons-25", emoji: "📘", name: "Wave Catcher", desc: "25 Lektionen", cat: "lessons", threshold: 25 },
  { id: "lessons-50", emoji: "📕", name: "Shredder", desc: "50 Lektionen", cat: "lessons", threshold: 50 },
  { id: "diary-3", emoji: "✏️", name: "Tagebuch-Starter", desc: "3 Einträge", cat: "diary", threshold: 3 },
  { id: "diary-7", emoji: "📓", name: "Reflector", desc: "7 Einträge", cat: "diary", threshold: 7 },
  { id: "diary-14", emoji: "📖", name: "Soul Surfer", desc: "14 Einträge", cat: "diary", threshold: 14 },
];

export default function ProgressScreen({ data, t, dm, setOpenLesson }) {
  const { done, diaryCount, coaching, completed, program, gamification } = data;
  const earned = BADGES.filter(b => b.cat === "lessons" ? done >= b.threshold : diaryCount >= b.threshold);
  const nextBadge = BADGES.find(b => b.cat === "lessons" ? done < b.threshold : diaryCount < b.threshold);
  const gm = gamification || {};

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>📊 Fortschritt</h2>
      <p style={{ fontSize: 14, color: t.text2, marginBottom: 20 }}>{done} Lektionen · {diaryCount} Einträge · 🔥 {data.streak} Streak</p>

      {/* XP & Level Card */}
      {gm.currentLevel && (
        <div style={{ background: "linear-gradient(135deg, #004D40, #00695C)", borderRadius: 20, padding: "20px", color: "white", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -15, right: -15, fontSize: 70, opacity: 0.08 }}>{gm.currentLevel.emoji}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", opacity: 0.7 }}>Dein Level</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, marginTop: 2 }}>{gm.currentLevel.emoji} {gm.currentLevel.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900 }}>{gm.totalXP}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.7 }}>XP total</div>
            </div>
          </div>
          {gm.nextLevel && (
            <>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #FFB74D, #FF7043)", width: `${Math.round(gm.levelProgress * 100)}%` }} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, textAlign: "right" }}>{gm.nextLevel.emoji} {gm.nextLevel.name} in {gm.nextLevel.minXP - gm.totalXP} XP</div>
            </>
          )}
        </div>
      )}

      {/* XP Breakdown */}
      {gm.xpBreakdown && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto" }}>
          {[
            { emoji: "📚", value: gm.xpBreakdown.lessonXP, label: "Lektionen" },
            { emoji: "📓", value: gm.xpBreakdown.diaryXP, label: "Tagebuch" },
            { emoji: "🏄", value: gm.xpBreakdown.surfDayXP, label: "Surf-Tage" },
            { emoji: "🔥", value: gm.xpBreakdown.streakBonus, label: "Streak" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{s.emoji}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, color: t.accent }}>{s.value}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: t.text3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #FFF8E1, #FFF3E0)", border: `1px solid ${dm ? "rgba(255,183,77,0.15)" : "#FFE0B2"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#FFB74D" : "#E65100", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>🏆 Badges</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: nextBadge ? 12 : 0 }}>
          {BADGES.map(b => {
            const isEarned = earned.includes(b);
            const progress = b.cat === "lessons" ? done / b.threshold : diaryCount / b.threshold;
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, background: isEarned ? (dm ? "rgba(255,183,77,0.15)" : "rgba(255,183,77,0.2)") : (dm ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"), borderRadius: 10, padding: "8px 12px", border: isEarned ? `1px solid ${dm ? "rgba(255,183,77,0.3)" : "#FFB74D"}` : `1px dashed ${dm ? "#2d3f50" : "#CFD8DC"}`, opacity: isEarned ? 1 : 0.5 }}>
                <span style={{ fontSize: 20, filter: isEarned ? "none" : "grayscale(1)" }}>{b.emoji}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isEarned ? (dm ? "#e8eaed" : "#4E342E") : t.text3 }}>{b.name}</div>
                  <div style={{ fontSize: 9, color: t.text3 }}>{isEarned ? "✓ Verdient" : `${Math.round(progress * 100)}%`}</div>
                </div>
              </div>
            );
          })}
        </div>
        {nextBadge && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: `1px dashed ${dm ? "#2d3f50" : "#FFE0B2"}` }}>
            <span style={{ fontSize: 12 }}>🎯</span>
            <span style={{ fontSize: 11, color: t.text2 }}>Nächstes: <strong style={{ color: dm ? "#FFB74D" : "#E65100" }}>{nextBadge.name}</strong> – {nextBadge.cat === "lessons" ? `noch ${nextBadge.threshold - done} Lektionen` : `noch ${nextBadge.threshold - diaryCount} Einträge`}</span>
          </div>
        )}
      </div>

      {/* Smart Coaching */}
      {coaching.tips.length > 0 && (
        <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #E8F5E9, #F1F8E9)", border: `1px solid ${dm ? "rgba(102,187,106,0.2)" : "#C8E6C9"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#66BB6A" : "#2E7D32", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🧠 Dein persönlicher Coach</div>
          {coaching.patterns.length > 0 && (
            <div style={{ fontSize: 12, color: t.text2, marginBottom: 10 }}>
              Du erwähnst oft: {coaching.patterns.map((p, i) => <strong key={i} style={{ color: dm ? "#66BB6A" : "#2E7D32" }}>{i > 0 ? ", " : ""}{p.keyword}</strong>)}
            </div>
          )}
          {coaching.tips.map((tip, i) => (
            <div key={i} style={{ background: dm ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{tip.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>{tip.tip}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {tip.lessons.map((l, j) => (
                      <button key={j} onClick={() => setOpenLesson(l)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: dm ? "rgba(102,187,106,0.15)" : "#E8F5E9", border: `1px solid ${dm ? "rgba(102,187,106,0.3)" : "#A5D6A7"}`, color: dm ? "#66BB6A" : "#2E7D32", cursor: "pointer", fontWeight: 600 }}>
                        {l.icon} {l.title} →
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Tree */}
      <div style={{ background: dm ? "rgba(30,45,61,0.8)" : t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px 18px" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>🌳 Skill Tree</div>
        {[1, 2, 3, 4].map(tier => {
          const tierSkills = SKILL_TREE.filter(s => s.tier === tier);
          const labels = ["", "🌱 Grundlagen", "🌿 Aufbau", "🌳 Intermediate", "🏔 Advanced"];
          return (
            <div key={tier} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.text2, marginBottom: 8 }}>{labels[tier]}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {tierSkills.map(skill => {
                  const cl = skill.lessons.filter(title => Object.keys(completed).some(key => { const l = program?.program?.flatMap(d => d.lessons).find(x => x.id === key); return l && l.title === title && completed[key]; }));
                  const progress = skill.lessons.length > 0 ? cl.length / skill.lessons.length : 0;
                  const unlocked = progress >= 1;
                  return (
                    <div key={skill.id} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 130, background: unlocked ? (dm ? "rgba(0,150,136,0.15)" : "#E0F2F1") : t.inputBg, border: `1px solid ${unlocked ? t.accent : t.inputBorder}`, borderRadius: 14, padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 22, filter: unlocked ? "none" : "grayscale(0.5)" }}>{skill.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? t.accent : t.text }}>{skill.name}</div>
                          {unlocked && <span style={{ fontSize: 10, color: t.accent }}>✓</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: t.text2, marginBottom: 6, lineHeight: 1.4 }}>{skill.desc}</div>
                      <div style={{ background: dm ? "rgba(255,255,255,0.1)" : "#E0E0E0", borderRadius: 6, height: 5, overflow: "hidden" }}>
                        <div style={{ background: unlocked ? t.accent : "#FFB74D", height: "100%", borderRadius: 6, width: `${progress * 100}%` }} />
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, marginTop: 4 }}>{cl.length}/{skill.lessons.length}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ textAlign: "center", fontSize: 11, color: t.text3, paddingTop: 10, borderTop: `1px dashed ${dm ? "#2d3f50" : "#E0E0E0"}` }}>
          {SKILL_TREE.filter(s => s.lessons.every(title => Object.keys(completed).some(key => { const l = program?.program?.flatMap(d => d.lessons).find(x => x.id === key); return l && l.title === title && completed[key]; }))).length} / {SKILL_TREE.length} Skills gemeistert
        </div>
      </div>
    </div>
  );
}
