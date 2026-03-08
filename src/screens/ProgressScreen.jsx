// SoulSurf – ProgressScreen v7.7.4 (Feedback: Streak badges clean, XP bar fix)
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

// v6.1: Streak Badges (NEW!)
const STREAK_BADGES = [
  { id: "streak-2", emoji: "🔥", name: "Hot Start", desc: "2 Tage Streak", threshold: 2 },
  { id: "streak-5", emoji: "💪", name: "Committed", desc: "5 Tage Streak", threshold: 5 },
  { id: "streak-7", emoji: "⚡", name: "On Fire", desc: "7 Tage Streak", threshold: 7 },
  { id: "streak-14", emoji: "🌊", name: "Unstoppable", desc: "14 Tage Streak", threshold: 14 },
  { id: "streak-30", emoji: "🏆", name: "Legend", desc: "30 Tage Streak", threshold: 30 },
];

export default function ProgressScreen({ data, t, dm, i18n, setOpenLesson }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const { done, diaryCount, coaching, completed, program, gamification, streak } = data;
  
  const earned = BADGES.filter(b => b.cat === "lessons" ? done >= b.threshold : diaryCount >= b.threshold);
  const nextBadge = BADGES.find(b => b.cat === "lessons" ? done < b.threshold : diaryCount < b.threshold);
  
  // v6.1: Streak Badges
  const earnedStreakBadges = STREAK_BADGES.filter(b => streak >= b.threshold);
  const nextStreakBadge = STREAK_BADGES.find(b => streak < b.threshold);
  
  const gm = gamification || {};

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("prog.title")}</h2>
      <p style={{ fontSize: 14, color: t.text2, marginBottom: 20 }}>{done} {_("prog.lessonsN")} · {diaryCount} {_("prog.entriesN")} · 🔥 {data.streak} {_("prog.xpStreak")}</p>

      {/* XP & Level Card */}
      {gm.currentLevel && (
        <div style={{ background: "linear-gradient(135deg, #0C4A6E, #0369A1)", borderRadius: 20, padding: "20px", color: "white", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -15, right: -15, fontSize: 70, opacity: 0.08 }}>{gm.currentLevel.emoji}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", opacity: 0.7 }}>Dein Level</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, marginTop: 2 }}>{gm.currentLevel.emoji} {gm.currentLevel.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 900 }}>{gm.totalXP}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.7 }}>XP total</div>
            </div>
          </div>
          {gm.nextLevel && (
            <>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", borderRadius: 6, background: t.gradient, width: `${Math.round(gm.levelProgress * 100)}%`, transition: "width 0.8s ease" }} />
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
            { color: t.accent, value: gm.xpBreakdown.lessonXP, label: _("prog.xpLessons") },
            { color: dm ? "#FBBF24" : "#D97706", value: gm.xpBreakdown.diaryXP, label: _("prog.xpDiary") },
            { color: dm ? "#34D399" : "#10B981", value: gm.xpBreakdown.surfDayXP, label: _("prog.xpSurfDays") },
            { color: dm ? "#F87171" : "#EF4444", value: gm.xpBreakdown.streakBonus, label: _("prog.xpStreak") },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "10px 8px", textAlign: "center", boxShadow: t.cardShadow }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color, margin: "0 auto 6px" }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.text3, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* v7.7.4: Streak Badges – clean card style */}
      {streak >= 2 && (
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px 18px", marginBottom: 20, boxShadow: t.cardShadow }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: dm ? "#FBBF24" : "#D97706", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>🔥 Streak Badges</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: nextStreakBadge ? 12 : 0 }}>
            {STREAK_BADGES.map(b => {
              const isEarned = earnedStreakBadges.includes(b);
              const progress = streak / b.threshold;
              return (
                <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    background: isEarned ? (dm ? "rgba(251,191,36,0.12)" : "rgba(245,158,11,0.08)") : (dm ? "rgba(255,255,255,0.03)" : "#F8FAFC"),
                    border: `2px solid ${isEarned ? (dm ? "#FBBF24" : "#F59E0B") : (dm ? "rgba(255,255,255,0.06)" : "#E2E8F0")}`,
                    opacity: isEarned ? 1 : 0.3, transition: "all 0.3s ease",
                    animation: isEarned ? "badgeUnlock 0.5s ease both" : "none",
                  }}>
                    {b.emoji}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: isEarned ? t.text : t.text3, textAlign: "center" }}>{b.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: isEarned ? (dm ? "#FBBF24" : "#D97706") : t.text3 }}>{isEarned ? "✓" : `${Math.round(progress * 100)}%`}</div>
                </div>
              );
            })}
          </div>
          {nextStreakBadge && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10, borderTop: `1px solid ${t.cardBorder}` }}>
              <span style={{ fontSize: 12 }}>🎯</span>
              <span style={{ fontSize: 11, color: t.text2 }}>
                {_("prog.next", "Nächstes")}: <strong style={{ color: dm ? "#FBBF24" : "#D97706" }}>{nextStreakBadge.name}</strong> – {nextStreakBadge.threshold - streak} {_("prog.daysLeft", "Tage")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Standard Badges – v7.7.3: Ring design */}
      <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px 18px", marginBottom: 24, boxShadow: t.cardShadow }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>{_("prog.badges")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: nextBadge ? 14 : 0 }}>
          {BADGES.map(b => {
            const isEarned = earned.includes(b);
            const progress = b.cat === "lessons" ? done / b.threshold : diaryCount / b.threshold;
            return (
              <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", animation: isEarned ? "badgeUnlock 0.5s ease both" : "none" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                  background: isEarned ? (dm ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.06)") : (dm ? "rgba(255,255,255,0.03)" : "#F8FAFC"),
                  border: `3px solid ${isEarned ? t.accent : (dm ? "rgba(255,255,255,0.06)" : "#E2E8F0")}`,
                  opacity: isEarned ? 1 : 0.3, transition: "all 0.3s ease",
                }}>
                  {b.emoji}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isEarned ? t.text : t.text3 }}>{b.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: isEarned ? t.accent : t.text3 }}>{isEarned ? _("prog.earned") : `${Math.round(progress * 100)}%`}</div>
                </div>
              </div>
            );
          })}
        </div>
        {nextBadge && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: `1px solid ${t.cardBorder}` }}>
            <span style={{ fontSize: 12 }}>🎯</span>
            <span style={{ fontSize: 11, color: t.text2 }}>{_("prog.next", "Nächstes")}: <strong style={{ color: t.accent }}>{nextBadge.name}</strong> – {nextBadge.cat === "lessons" ? `${nextBadge.threshold - done} ${_("prog.lessonsLeft", "Lektionen")}` : `${nextBadge.threshold - diaryCount} ${_("prog.entriesLeft", "Einträge")}`}</span>
          </div>
        )}
      </div>

      {/* Smart Coaching */}
      {coaching.tips.length > 0 && (
        <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #E8F5E9, #F1F8E9)", border: `1px solid ${dm ? "rgba(102,187,106,0.2)" : "#C8E6C9"}`, borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: dm ? "#66BB6A" : "#2E7D32", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{_("prog.coach")}</div>
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
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>{_("prog.skillTree")}</div>
        {[1, 2, 3, 4].map(tier => {
          const tierSkills = SKILL_TREE.filter(s => s.tier === tier);
          const labels = ["", _("prog.basics"), _("prog.buildup"), _("prog.intermediate"), _("prog.advanced")];
          return (
            <div key={tier} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.text2, marginBottom: 8 }}>{labels[tier]}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {tierSkills.map(skill => {
                  const cl = skill.lessons.filter(title => Object.keys(completed).some(key => { const l = program?.program?.flatMap(d => d.lessons).find(x => x.id === key); return l && l.title === title && completed[key]; }));
                  const progress = skill.lessons.length > 0 ? cl.length / skill.lessons.length : 0;
                  const unlocked = progress >= 1;
                  return (
                    <div key={skill.id} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 130, background: unlocked ? (dm ? "rgba(14,165,233,0.15)" : "#E0F2FE") : t.inputBg, border: `1px solid ${unlocked ? t.accent : t.inputBorder}`, borderRadius: 14, padding: "12px" }}>
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
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: t.text3, marginTop: 4 }}>{cl.length}/{skill.lessons.length}</div>
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
