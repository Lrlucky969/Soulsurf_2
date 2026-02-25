// SoulSurf – ProfileScreen v6.3.4 (Sprint 32: Strategic Refocus)
// New "Profile" tab combining: User Profile, Settings, Progress, Equipment, Instructor links
import React, { useState, useMemo } from "react";
import { SURF_SPOTS } from "../data.js";

const SKILL_LEVELS = [
  { id: "beginner", emoji: "🌱", key: "skill.beginner", color: "#4CAF50" },
  { id: "lower_intermediate", emoji: "🌿", key: "skill.lowerIntermediate", color: "#FF9800" },
  { id: "intermediate", emoji: "🌳", key: "skill.intermediate", color: "#E91E63" },
];

const SURF_GOALS = [
  { id: "first_waves", emoji: "🌊", key: "goal.firstWaves" },
  { id: "improve_takeoff", emoji: "⚡", key: "goal.improveTakeoff" },
  { id: "learn_turns", emoji: "🔄", key: "goal.learnTurns" },
  { id: "surf_independently", emoji: "🏄", key: "goal.surfIndependently" },
];

const BADGES = [
  { id: "lessons-10", emoji: "📗", name: "Paddler", threshold: 10, cat: "lessons" },
  { id: "lessons-25", emoji: "📘", name: "Wave Catcher", threshold: 25, cat: "lessons" },
  { id: "lessons-50", emoji: "📕", name: "Shredder", threshold: 50, cat: "lessons" },
  { id: "diary-3", emoji: "✏️", name: "Tagebuch-Starter", threshold: 3, cat: "diary" },
  { id: "diary-7", emoji: "📓", name: "Reflector", threshold: 7, cat: "diary" },
];

const STREAK_BADGES = [
  { id: "streak-2", emoji: "🔥", name: "Hot Start", threshold: 2 },
  { id: "streak-5", emoji: "💪", name: "Committed", threshold: 5 },
  { id: "streak-7", emoji: "⚡", name: "On Fire", threshold: 7 },
  { id: "streak-14", emoji: "🌊", name: "Unstoppable", threshold: 14 },
  { id: "streak-30", emoji: "🏆", name: "Legend", threshold: 30 },
];

export default function ProfileScreen({ data, auth, t, dm, i18n, navigate, notifications }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editSkill, setEditSkill] = useState(data.skillLevel || "beginner");
  const [editGoal, setEditGoal] = useState(data.primaryGoal || "first_waves");
  const [editSchool, setEditSchool] = useState(data.wantsSchoolHelp !== false);

  const skillObj = useMemo(() => SKILL_LEVELS.find(s => s.id === data.skillLevel) || SKILL_LEVELS[0], [data.skillLevel]);
  const goalObj = useMemo(() => SURF_GOALS.find(g => g.id === data.primaryGoal) || SURF_GOALS[0], [data.primaryGoal]);
  const spotObj = useMemo(() => SURF_SPOTS.find(s => s.id === data.spot), [data.spot]);

  const progressPct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

  // Badges
  const earnedBadges = BADGES.filter(b => b.cat === "lessons" ? data.done >= b.threshold : data.diaryCount >= b.threshold);
  const earnedStreakBadges = STREAK_BADGES.filter(b => data.streak >= b.threshold);
  const allEarned = [...earnedBadges, ...earnedStreakBadges];

  const isInstructor = useMemo(() => {
    try { return localStorage.getItem("soulsurf_instructor") === "true"; } catch { return false; }
  }, []);

  const handleSaveProfile = () => {
    if (data.saveProfile) {
      data.saveProfile({ skillLevel: editSkill, primaryGoal: editGoal, wantsSchoolHelp: editSchool });
    }
    setEditingProfile(false);
  };

  // Card style helper
  const card = { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px 18px", marginBottom: 12 };
  const sectionLabel = { fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 };
  const linkBtn = (onClick, icon, label, desc, accent) => (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent || t.text }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: t.text2, marginTop: 2 }}>{desc}</div>}
      </div>
      <span style={{ fontSize: 14, color: t.text3 }}>→</span>
    </button>
  );

  return (
    <div style={{ paddingTop: 20 }}>
      {/* Profile Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 12px",
          background: "linear-gradient(135deg, #009688, #4DB6AC)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, color: "white", fontWeight: 800,
          boxShadow: "0 8px 30px rgba(0,150,136,0.25)",
        }}>
          {auth?.displayName?.charAt(0).toUpperCase() || "🏄"}
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text }}>
          {auth?.displayName || _("profile.surfer", "Surfer")}
        </h2>
        {auth?.isLoggedIn && (
          <div style={{ fontSize: 12, color: t.text3, marginTop: 2 }}>{auth.user?.email}</div>
        )}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, background: `${skillObj.color}15`, padding: "6px 14px", borderRadius: 10, border: `1px solid ${skillObj.color}30` }}>
          <span style={{ fontSize: 14 }}>{skillObj.emoji}</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: skillObj.color }}>{_(skillObj.key)}</span>
        </div>
      </div>

      {/* Surf Profile Card */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={sectionLabel}>{_("profile.surfProfile", "Surf-Profil")}</div>
          <button onClick={() => { if (editingProfile) handleSaveProfile(); else setEditingProfile(true); }} style={{
            background: editingProfile ? "linear-gradient(135deg, #009688, #4DB6AC)" : t.inputBg,
            color: editingProfile ? "white" : t.accent,
            border: editingProfile ? "none" : `1px solid ${t.inputBorder}`,
            borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Space Mono', monospace",
          }}>
            {editingProfile ? _("g.save", "Speichern") : _("g.edit", "Bearbeiten")}
          </button>
        </div>

        {!editingProfile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{skillObj.emoji}</span>
              <div>
                <div style={{ fontSize: 10, color: t.text3 }}>{_("profile.level", "Level")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{_(skillObj.key)}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{goalObj.emoji}</span>
              <div>
                <div style={{ fontSize: 10, color: t.text3 }}>{_("profile.goal", "Ziel")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{_(goalObj.key)}</div>
              </div>
            </div>
            {spotObj && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{spotObj.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, color: t.text3 }}>{_("profile.spot", "Spot")}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{spotObj.name}</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🏫</span>
              <div>
                <div style={{ fontSize: 10, color: t.text3 }}>{_("profile.schoolHelp", "Surfschul-Empfehlungen")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{data.wantsSchoolHelp !== false ? _("ob.schoolYes") : _("ob.schoolNo")}</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: t.text3, marginBottom: 6 }}>{_("profile.level", "Level")}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {SKILL_LEVELS.map(s => (
                  <button key={s.id} onClick={() => setEditSkill(s.id)} style={{
                    flex: 1, padding: "10px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "center",
                    background: editSkill === s.id ? `${s.color}15` : t.inputBg,
                    border: editSkill === s.id ? `2px solid ${s.color}` : `2px solid ${t.inputBorder}`,
                    color: editSkill === s.id ? s.color : t.text2,
                  }}>
                    {s.emoji}<br />{_(s.key)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: t.text3, marginBottom: 6 }}>{_("profile.goal", "Ziel")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SURF_GOALS.map(g => (
                  <button key={g.id} onClick={() => setEditGoal(g.id)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    background: editGoal === g.id ? (dm ? "rgba(0,150,136,0.1)" : "#E0F2F1") : t.inputBg,
                    border: editGoal === g.id ? `2px solid ${t.accent}` : `2px solid ${t.inputBorder}`,
                    fontSize: 13, fontWeight: editGoal === g.id ? 700 : 500, color: editGoal === g.id ? t.accent : t.text,
                  }}>
                    <span>{g.emoji}</span> {_(g.key)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: t.text3, marginBottom: 6 }}>{_("profile.schoolHelp", "Surfschul-Empfehlungen")}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditSchool(true)} style={{
                  flex: 1, padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  background: editSchool ? (dm ? "rgba(0,150,136,0.1)" : "#E0F2F1") : t.inputBg,
                  border: editSchool ? `2px solid ${t.accent}` : `2px solid ${t.inputBorder}`,
                  color: editSchool ? t.accent : t.text2,
                }}>👍 {_("ob.schoolYes")}</button>
                <button onClick={() => setEditSchool(false)} style={{
                  flex: 1, padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  background: !editSchool ? (dm ? "rgba(158,158,158,0.1)" : "#F5F5F5") : t.inputBg,
                  border: !editSchool ? `2px solid ${t.text3}` : `2px solid ${t.inputBorder}`,
                  color: !editSchool ? t.text : t.text2,
                }}>🤙 {_("ob.schoolNo")}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Card */}
      <div style={card}>
        <div style={sectionLabel}>{_("profile.stats", "Statistiken")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { emoji: "📚", value: data.done, label: _("profile.lessons", "Lektionen") },
            { emoji: "📓", value: data.diaryCount, label: _("profile.entries", "Einträge") },
            { emoji: "🔥", value: data.streak, label: _("home.streak", "Streak") },
            { emoji: "⭐", value: data.gamification?.totalXP || 0, label: "XP" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{s.emoji}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: t.accent }}>{s.value}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: t.text3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {data.hasSaved && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.text3, marginBottom: 4 }}>
              <span>{_("profile.progress", "Fortschritt")}</span>
              <span>{progressPct}%</span>
            </div>
            <div style={{ background: dm ? "rgba(255,255,255,0.08)" : "#ECEFF1", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #009688, #4DB6AC)", width: `${progressPct}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}
      </div>

      {/* Badges – always visible (earned + locked) */}
      <div style={card}>
        <div style={sectionLabel}>{_("profile.badges", "Badges")} ({allEarned.length}/{BADGES.length + STREAK_BADGES.length})</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[...BADGES, ...STREAK_BADGES].map(b => {
            const isEarned = allEarned.some(e => e.id === b.id);
            return (
              <div key={b.id} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10,
                background: isEarned ? (dm ? "rgba(255,183,77,0.08)" : "#FFF8E1") : (dm ? "rgba(255,255,255,0.03)" : "#F5F5F5"),
                border: `1px solid ${isEarned ? (dm ? "rgba(255,183,77,0.15)" : "#FFE0B2") : (dm ? "rgba(255,255,255,0.06)" : "#E0E0E0")}`,
                opacity: isEarned ? 1 : 0.5,
              }}>
                <span style={{ fontSize: 16, filter: isEarned ? "none" : "grayscale(1)" }}>{b.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: isEarned ? 700 : 500, color: isEarned ? (dm ? "#FFB74D" : "#E65100") : t.text3 }}>{b.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ marginTop: 8 }}>
        <div style={{ ...sectionLabel, padding: "0 4px" }}>{_("profile.more", "Weitere")}</div>
        {linkBtn(() => navigate("equipment"), "🏄", _("nav.equipment", "Equipment"), _("profile.equipmentDesc", "Board-Beratung & Gear"), null)}
        {linkBtn(() => navigate("progress"), "📊", _("nav.progress", "Fortschritt"), _("profile.progressDesc", "Badges, Skill Tree, Coaching"), null)}
        {linkBtn(() => navigate("community"), "🤝", _("nav.community", "Community"), _("profile.communityDesc", "Spots & Leute"), null)}
        {isInstructor && linkBtn(() => navigate("instructor"), "👨‍🏫", _("nav.instructor", "Instructor"), _("profile.instructorDesc", "Surfschul-Dashboard"), t.accent)}
      </div>

      {/* App Info */}
      <div style={{ marginTop: 20, padding: 16, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, textAlign: "center" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3 }}>
          SoulSurf v6.3.4 · {_("profile.madeWith", "Made with")} ☮ & 🌊
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, marginTop: 4 }}>
          {data.done} {_("profile.lessons", "Lektionen")} · {data.diaryCount} {_("profile.entries", "Einträge")} · {data.streak} {_("home.streak", "Streak")}
        </div>
      </div>
    </div>
  );
}
