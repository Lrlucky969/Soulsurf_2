// SoulSurf – HomeScreen v6.3.4 (Sprint 32: Strategic Onboarding + Bugfixes)
import React, { useState, useEffect, useMemo } from "react";
import { SURF_SPOTS, GOALS } from "../data.js";

const ONBOARDING_KEY = "soulsurf_onboarded";

// v6.3: SKILL LEVELS for new onboarding
const SKILL_LEVELS = [
  { id: "beginner", emoji: "🌱", key: "skill.beginner", descKey: "skill.beginnerDesc", color: "#4CAF50" },
  { id: "lower_intermediate", emoji: "🌿", key: "skill.lowerIntermediate", descKey: "skill.lowerIntermediateDesc", color: "#FF9800" },
  { id: "intermediate", emoji: "🌳", key: "skill.intermediate", descKey: "skill.intermediateDesc", color: "#E91E63" },
];

const SURF_GOALS = [
  { id: "first_waves", emoji: "🌊", key: "goal.firstWaves", descKey: "goal.firstWavesDesc", color: "#009688" },
  { id: "improve_takeoff", emoji: "⚡", key: "goal.improveTakeoff", descKey: "goal.improveTakeoffDesc", color: "#FF9800" },
  { id: "learn_turns", emoji: "🔄", key: "goal.learnTurns", descKey: "goal.learnTurnsDesc", color: "#5C6BC0" },
  { id: "surf_independently", emoji: "🏄", key: "goal.surfIndependently", descKey: "goal.surfIndependentlyDesc", color: "#E91E63" },
];

export default function HomeScreen({ data, t, dm, i18n, navigate, spotObj, savedGoal, notifications }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [onboarded, setOnboarded] = useState(true);
  const [obStep, setObStep] = useState(0);
  const [obSkill, setObSkill] = useState(null);
  const [obGoal, setObGoal] = useState(null);
  const [obSpot, setObSpot] = useState(null);
  const [obSchoolHelp, setObSchoolHelp] = useState(null);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  useEffect(() => {
    try { const v = localStorage.getItem(ONBOARDING_KEY); if (!v) setOnboarded(false); } catch {}
  }, []);

  const finishOnboarding = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
    if (data.saveProfile) {
      data.saveProfile({
        skillLevel: obSkill || "beginner",
        primaryGoal: obGoal || "first_waves",
        wantsSchoolHelp: obSchoolHelp !== false,
      });
    }
    if (obSpot && data.setSpot) data.setSpot(obSpot);
    setOnboarded(true);
  };

  const nextBadge = useMemo(() => {
    const BADGES = [
      { name: "Paddler", threshold: 10, cat: "lessons", emoji: "📗" },
      { name: "Wave Catcher", threshold: 25, cat: "lessons", emoji: "📘" },
      { name: "Shredder", threshold: 50, cat: "lessons", emoji: "📕" },
    ];
    return BADGES.find(b => data.done < b.threshold);
  }, [data.done]);

  const coachingTip = useMemo(() => {
    if (data.coaching?.tips?.length > 0) return data.coaching.tips[0];
    return null;
  }, [data.coaching]);

  const progressPct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;

  const [seenTooltips, setSeenTooltips] = useState(() => {
    try { return JSON.parse(localStorage.getItem("soulsurf_tooltips") || "{}"); } catch { return {}; }
  });
  const dismissTooltip = (id) => {
    const next = { ...seenTooltips, [id]: true };
    setSeenTooltips(next);
    try { localStorage.setItem("soulsurf_tooltips", JSON.stringify(next)); } catch {}
  };

  const milestone = useMemo(() => {
    if (data.done === 1) return { emoji: "🎉", text: _("home.ms.first") };
    if (data.done === 10) return { emoji: "📗", text: _("home.ms.10") };
    if (data.done === 25) return { emoji: "📘", text: _("home.ms.25") };
    if (data.streak === 2) return { emoji: "🔥", text: _("streak.ms.2", "Hot Start! 2 Tage Streak!") };
    if (data.streak === 5) return { emoji: "💪", text: _("streak.ms.5", "Committed! 5 Tage am Stück!") };
    if (data.streak === 7) return { emoji: "⚡", text: _("streak.ms.7", "On Fire! 1 Woche non-stop!") };
    if (data.streak === 14) return { emoji: "🌊", text: _("streak.ms.14", "Unstoppable! 2 Wochen Streak!") };
    if (data.streak === 30) return { emoji: "🏆", text: _("streak.ms.30", "Legend! 30 Tage Streak!") };
    if (data.diaryCount === 1) return { emoji: "✏️", text: _("home.ms.diary1") };
    if (progressPct >= 50 && progressPct < 55) return { emoji: "🏅", text: _("home.ms.half") };
    if (progressPct === 100) return { emoji: "🏆", text: _("home.ms.complete") };
    return null;
  }, [data.done, data.streak, data.diaryCount, progressPct, _]);

  const handleFreezeStreak = () => {
    if (data.freezeStreak && data.freezeStreak()) setShowFreezeConfirm(false);
  };

  // ═══════════════════════════════════════════
  // v6.3: NEW 4-STEP STRATEGIC ONBOARDING
  // ═══════════════════════════════════════════
  if (!onboarded && !data.skillLevel) {
    const totalSteps = 4;
    const StepDots = () => (
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, marginBottom: 12 }}>
        {Array.from({ length: totalSteps }, (_, s) => (
          <div key={s} style={{ width: s === obStep ? 24 : 8, height: 8, borderRadius: 4, background: s <= obStep ? t.accent : (dm ? "#2d3f50" : "#E0E0E0"), opacity: s < obStep ? 0.5 : 1, transition: "all 0.3s ease" }} />
        ))}
      </div>
    );
    const stepLabel = `${_("ob.step")} ${obStep + 1}/${totalSteps}`;

    return (
      <div style={{ paddingTop: 20, textAlign: "center" }}>
        {/* Step 0: Welcome + Skill Level */}
        {obStep === 0 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <img src="/icon-192.png" alt="SoulSurf" style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 14, animation: "float 4s ease-in-out infinite", boxShadow: "0 12px 40px rgba(0,150,136,0.2)" }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 6 }}>{_("ob.welcome")}</h1>
            <p style={{ fontSize: 14, color: t.text2, maxWidth: 340, margin: "0 auto 20px", lineHeight: 1.6 }}>{_("ob.welcomeDesc")}</p>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{_("ob.skillTitle")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, margin: "0 auto" }}>
              {SKILL_LEVELS.map((level, i) => (
                <button key={level.id} onClick={() => setObSkill(level.id)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16,
                  background: obSkill === level.id ? (dm ? `${level.color}20` : `${level.color}12`) : t.card,
                  border: obSkill === level.id ? `2px solid ${level.color}` : `2px solid ${t.cardBorder}`,
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                  animation: "slideUp 0.3s ease both", animationDelay: `${i * 70}ms`,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `${level.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{level.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: obSkill === level.id ? level.color : t.text }}>{_(level.key)}</div>
                    <div style={{ fontSize: 12, color: t.text2, marginTop: 2 }}>{_(level.descKey)}</div>
                  </div>
                  {obSkill === level.id && <span style={{ fontSize: 18, color: level.color }}>✓</span>}
                </button>
              ))}
            </div>
            <button onClick={() => { if (obSkill) setObStep(1); }} disabled={!obSkill} style={{
              marginTop: 20, background: obSkill ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
              color: obSkill ? "white" : t.text3, border: "none", borderRadius: 50, padding: "16px 44px",
              fontSize: 16, fontWeight: 700, cursor: obSkill ? "pointer" : "not-allowed",
              fontFamily: "'Playfair Display', serif", boxShadow: obSkill ? "0 8px 30px rgba(0,150,136,0.3)" : "none", transition: "all 0.3s ease",
            }}>{_("ob.next")} →</button>
            <StepDots />
          </div>
        )}

        {/* Step 1: Goal */}
        {obStep === 1 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 8 }}>{stepLabel}</div>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("ob.goalTitle")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, margin: "20px auto 0" }}>
              {SURF_GOALS.map((goal, i) => (
                <button key={goal.id} onClick={() => setObGoal(goal.id)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16,
                  background: obGoal === goal.id ? (dm ? `${goal.color}20` : `${goal.color}12`) : t.card,
                  border: obGoal === goal.id ? `2px solid ${goal.color}` : `2px solid ${t.cardBorder}`,
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                  animation: "slideUp 0.3s ease both", animationDelay: `${i * 70}ms`,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${goal.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{goal.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: obGoal === goal.id ? goal.color : t.text }}>{_(goal.key)}</div>
                    {goal.descKey && <div style={{ fontSize: 12, color: t.text2, marginTop: 2 }}>{_(goal.descKey)}</div>}
                  </div>
                  {obGoal === goal.id && <span style={{ fontSize: 18, color: goal.color }}>✓</span>}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setObStep(0)} style={{ background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>←</button>
              <button onClick={() => { if (obGoal) setObStep(2); }} disabled={!obGoal} style={{
                flex: 1, maxWidth: 200, background: obGoal ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
                color: obGoal ? "white" : t.text3, border: "none", borderRadius: 50, padding: "14px 28px",
                fontSize: 16, fontWeight: 700, cursor: obGoal ? "pointer" : "not-allowed",
                fontFamily: "'Playfair Display', serif", transition: "all 0.3s ease",
              }}>{_("ob.next")} →</button>
            </div>
            <StepDots />
          </div>
        )}

        {/* Step 2: Location */}
        {obStep === 2 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 8 }}>{stepLabel}</div>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📍</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("ob.locationTitle")}</h2>
            <p style={{ fontSize: 13, color: t.text2, marginBottom: 20 }}>{_("ob.locationDesc")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 380, margin: "0 auto" }}>
              {SURF_SPOTS.map((spot, i) => (
                <button key={spot.id} onClick={() => setObSpot(spot.id)} style={{
                  padding: "14px 10px", borderRadius: 14, textAlign: "center",
                  background: obSpot === spot.id ? (dm ? "rgba(0,150,136,0.15)" : "#E0F2F1") : t.card,
                  border: obSpot === spot.id ? `2px solid ${t.accent}` : `2px solid ${t.cardBorder}`,
                  cursor: "pointer", transition: "all 0.2s ease",
                  animation: "slideUp 0.3s ease both", animationDelay: `${i * 50}ms`,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{spot.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: obSpot === spot.id ? t.accent : t.text }}>{spot.name.split(",")[0]}</div>
                  <div style={{ fontSize: 9, color: t.text3, marginTop: 2 }}>{spot.difficulty === "beginner" ? "🟢" : spot.difficulty === "intermediate" ? "🟡" : "🔴"} {spot.waveType}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setObStep(1)} style={{ background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>←</button>
              <button onClick={() => { if (obSpot) setObStep(3); }} disabled={!obSpot} style={{
                flex: 1, maxWidth: 200, background: obSpot ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
                color: obSpot ? "white" : t.text3, border: "none", borderRadius: 50, padding: "14px 28px",
                fontSize: 16, fontWeight: 700, cursor: obSpot ? "pointer" : "not-allowed",
                fontFamily: "'Playfair Display', serif", transition: "all 0.3s ease",
              }}>{_("ob.next")} →</button>
            </div>
            <StepDots />
          </div>
        )}

        {/* Step 3: Surf School Opt-In + Summary */}
        {obStep === 3 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 8 }}>{stepLabel}</div>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏫</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("ob.schoolTitle")}</h2>
            <p style={{ fontSize: 13, color: t.text2, maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.6 }}>{_("ob.schoolDesc")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340, margin: "0 auto" }}>
              <button onClick={() => setObSchoolHelp(true)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 16,
                background: obSchoolHelp === true ? (dm ? "rgba(0,150,136,0.15)" : "#E0F2F1") : t.card,
                border: obSchoolHelp === true ? `2px solid ${t.accent}` : `2px solid ${t.cardBorder}`,
                cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 28 }}>👍</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: obSchoolHelp === true ? t.accent : t.text }}>{_("ob.schoolYes")}</div>
                </div>
                {obSchoolHelp === true && <span style={{ fontSize: 18, color: t.accent }}>✓</span>}
              </button>
              <button onClick={() => setObSchoolHelp(false)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 16,
                background: obSchoolHelp === false ? (dm ? "rgba(158,158,158,0.1)" : "#F5F5F5") : t.card,
                border: obSchoolHelp === false ? `2px solid ${t.text3}` : `2px solid ${t.cardBorder}`,
                cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 28 }}>🤙</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{_("ob.schoolNo")}</div>
                </div>
                {obSchoolHelp === false && <span style={{ fontSize: 18, color: t.text3 }}>✓</span>}
              </button>
            </div>
            {obSchoolHelp !== null && (
              <div style={{ maxWidth: 340, margin: "20px auto 0", background: dm ? "rgba(0,150,136,0.06)" : "#F1F8F7", border: `1px solid ${dm ? "rgba(0,150,136,0.12)" : "#C8E6C9"}`, borderRadius: 14, padding: "14px 16px", textAlign: "left", animation: "slideUp 0.3s ease both" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{_("ob.yourProfile", "Dein Profil")}</div>
                <div style={{ fontSize: 13, color: t.text, lineHeight: 1.8 }}>
                  {SKILL_LEVELS.find(s => s.id === obSkill)?.emoji} {_(SKILL_LEVELS.find(s => s.id === obSkill)?.key || "")}<br />
                  🎯 {_(SURF_GOALS.find(g => g.id === obGoal)?.key || "")}<br />
                  📍 {SURF_SPOTS.find(s => s.id === obSpot)?.emoji} {SURF_SPOTS.find(s => s.id === obSpot)?.name?.split(",")[0]}<br />
                  🏫 {obSchoolHelp ? _("ob.schoolYes") : _("ob.schoolNo")}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
              <button onClick={() => setObStep(2)} style={{ background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>←</button>
              <button onClick={() => { if (obSchoolHelp !== null) finishOnboarding(); }} disabled={obSchoolHelp === null} style={{
                flex: 1, maxWidth: 200, background: obSchoolHelp !== null ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
                color: obSchoolHelp !== null ? "white" : t.text3, border: "none", borderRadius: 50, padding: "14px 28px",
                fontSize: 16, fontWeight: 700, cursor: obSchoolHelp !== null ? "pointer" : "not-allowed",
                fontFamily: "'Playfair Display', serif", boxShadow: obSchoolHelp !== null ? "0 8px 30px rgba(0,150,136,0.3)" : "none", transition: "all 0.3s ease",
              }}>{_("ob.finish")}</button>
            </div>
            <StepDots />
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // DASHBOARD (returning users with program)
  // ═══════════════════════════════════════════
  if (data.hasSaved && spotObj) {
    const today = new Date().toISOString().slice(0, 10);
    const surfedToday = (data.surfDays || []).includes(today);
    const hour = new Date().getHours();
    const timeGreeting = hour < 10 ? _("home.morning") : hour < 14 ? _("home.midday") : hour < 18 ? _("home.afternoon") : _("home.evening");
    const dateLang = i18n?.lang === "pt" ? "pt-BR" : i18n?.lang === "en" ? "en-US" : "de-DE";
    const streakMilestones = data.streakMilestones || { achieved: [], current: null, next: null, progress: 0 };

    return (
      <div style={{ paddingTop: 20 }}>
        {/* Greeting + Skill Badge */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString(dateLang, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginTop: 4 }}>
            {data.streak > 2 ? _("home.onFire") : progressPct >= 80 ? _("home.almostDone") : progressPct >= 50 ? _("home.keepGoing") : timeGreeting}
          </h2>
          {data.skillLevel && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", padding: "4px 10px", borderRadius: 8 }}>
              <span style={{ fontSize: 12 }}>{SKILL_LEVELS.find(s => s.id === data.skillLevel)?.emoji}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent }}>{_(SKILL_LEVELS.find(s => s.id === data.skillLevel)?.key || data.skillLevel)}</span>
            </div>
          )}
        </div>

        {/* Notification Card (collapsed) */}
        {notifications && notifications.isSupported && !notifications.isGranted && (
          <button onClick={async () => await notifications.requestPermission()} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, background: dm ? "rgba(255,183,77,0.08)" : "#FFF8E1",
            border: `1px solid ${dm ? "rgba(255,183,77,0.15)" : "#FFE0B2"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 12, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{_("home.notifEnable", "Benachrichtigungen aktivieren")}</div>
              <div style={{ fontSize: 11, color: t.text2 }}>{_("home.notifEnableDesc", "Streak-Reminder & Forecast-Alerts")}</div>
            </div>
            <span style={{ fontSize: 12, color: t.accent, fontWeight: 700 }}>→</span>
          </button>
        )}

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
            <button onClick={() => navigate("lessons")} style={{ flex: 1, background: "white", color: "#004D40", border: "none", borderRadius: 12, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>▶ {_("home.continueSurf", "Weiter surfen")}</button>
            <button onClick={() => setShowResetConfirm(true)} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 14, cursor: "pointer" }}>🗑</button>
          </div>
        </div>

        {showResetConfirm && (
          <div style={{ background: dm ? "#2d2010" : "#FFF3E0", border: "2px solid #FFB74D", borderRadius: 14, padding: "16px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: dm ? "#e8eaed" : "#4E342E", marginBottom: 12 }}>{_("home.resetConfirm", "Programm und Fortschritt löschen?")}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => { data.resetProgram(); setShowResetConfirm(false); }} style={{ background: "#E53935", color: "white", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{_("g.delete", "Löschen")}</button>
              <button onClick={() => setShowResetConfirm(false)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>{_("g.cancel", "Abbrechen")}</button>
            </div>
          </div>
        )}

        {/* Streak Card */}
        {data.streak >= 2 && streakMilestones.current && (
          <div style={{ background: "linear-gradient(135deg, #FFB74D, #FF7043)", borderRadius: 16, padding: "16px 18px", marginBottom: 12, color: "white", position: "relative", overflow: "hidden", animation: "slideUp 0.4s ease both" }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 60, opacity: 0.15 }}>🔥</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", opacity: 0.9 }}>Streak</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, marginTop: 2 }}>{streakMilestones.current.badge} {streakMilestones.current.title}</div>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{streakMilestones.current.desc}</div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 900 }}>{data.streak}</div>
            </div>
            {streakMilestones.next && (
              <>
                <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ background: "white", height: "100%", borderRadius: 6, width: `${Math.round(streakMilestones.progress * 100)}%`, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 10, opacity: 0.9, textAlign: "right" }}>{streakMilestones.next.badge} {streakMilestones.next.title} ({streakMilestones.next.day - data.streak} {_("general.days", "Tage")})</div>
              </>
            )}
            {data.canFreezeStreak && data.streak >= 3 && (
              <button onClick={() => setShowFreezeConfirm(true)} style={{ marginTop: 10, width: "100%", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "10px", fontSize: 12, fontWeight: 700, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                🧊 {_("home.freezeAvailable", "Streak Freeze (1x/Monat)")}
              </button>
            )}
          </div>
        )}

        {showFreezeConfirm && (
          <div style={{ background: dm ? "rgba(92,107,192,0.1)" : "#E8EAF6", border: `1px solid ${dm ? "rgba(92,107,192,0.2)" : "#C5CAE9"}`, borderRadius: 14, padding: "16px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧊</div>
            <p style={{ fontSize: 14, color: t.text, marginBottom: 4, fontWeight: 700 }}>{_("home.freezeTitle", "Streak Freeze aktivieren?")}</p>
            <p style={{ fontSize: 12, color: t.text2, marginBottom: 12, lineHeight: 1.5 }}>{_("home.freezeDesc", "Dein Streak bleibt 1 Tag erhalten. 1x pro Monat möglich.")}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={handleFreezeStreak} style={{ background: "#7986CB", color: "white", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{_("g.activate", "Aktivieren")}</button>
              <button onClick={() => setShowFreezeConfirm(false)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>{_("g.cancel", "Abbrechen")}</button>
            </div>
          </div>
        )}

        {milestone && !seenTooltips[`ms-${data.done}-${data.streak}`] && (
          <div style={{ background: dm ? "rgba(255,183,77,0.1)" : "#FFF8E1", border: `1px solid ${dm ? "rgba(255,183,77,0.2)" : "#FFE0B2"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, animation: "slideUp 0.4s ease both" }}>
            <span style={{ fontSize: 28 }}>{milestone.emoji}</span>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: dm ? "#FFB74D" : "#E65100" }}>{milestone.text}</div>
            <button onClick={() => dismissTooltip(`ms-${data.done}-${data.streak}`)} style={{ background: "none", border: "none", color: t.text3, fontSize: 16, cursor: "pointer", padding: 4 }}>✕</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { emoji: "🔥", value: data.streak, label: _("home.streak"), color: "#FFB74D" },
            { emoji: "📓", value: data.diaryCount, label: _("home.entries"), color: "#7986CB" },
            { emoji: "📚", value: data.total - data.done, label: _("home.open"), color: t.accent },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{s.emoji}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Gamification (implicit feature flag) */}
        {data.gamification?.currentLevel && (
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{data.gamification.currentLevel.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{data.gamification.currentLevel.name}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent }}>{data.gamification.totalXP} XP</div>
                </div>
              </div>
            </div>
            <div style={{ background: dm ? "rgba(255,255,255,0.08)" : "#ECEFF1", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #009688, #4DB6AC, #80CBC4)", width: `${Math.round(data.gamification.levelProgress * 100)}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}

        {/* Surf Today */}
        <button onClick={data.toggleSurfDay} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", marginBottom: 12, borderRadius: 14, cursor: "pointer", textAlign: "left",
          background: surfedToday ? (dm ? "rgba(255,183,77,0.12)" : "#FFF8E1") : t.card,
          border: `1px solid ${surfedToday ? "#FFB74D" : t.cardBorder}`,
        }}>
          <span style={{ fontSize: 24 }}>{surfedToday ? "🏄‍♂️" : "🏖️"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: surfedToday ? "#E65100" : t.text }}>{surfedToday ? _("home.surfedToday") : _("home.surfedTodayQ")}</div>
            <div style={{ fontSize: 11, color: t.text2 }}>{surfedToday ? `${_("home.streak")}: ${data.streak} 🔥` : _("home.tapToLog")}</div>
          </div>
        </button>

        {/* Coach Tip */}
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

        {/* Quick Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
          {[
            { icon: "🌊", label: _("nav.surf", "Surf"), screen: "forecast" },
            { icon: "✈️", label: _("nav.trip", "Trip"), screen: "trip" },
            { icon: "🏫", label: _("nav.schools", "Schulen"), screen: "schools" },
            { icon: "🏄", label: _("nav.equipment", "Gear"), screen: "equipment" },
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

  // ═══════════════════════════════════════════
  // DEFAULT HOME (onboarded but no program)
  // ═══════════════════════════════════════════
  return (
    <div style={{ paddingTop: 40, textAlign: "center" }}>
      <div style={{ fontSize: 70, marginBottom: 12, animation: "float 4s ease-in-out infinite" }}>🌊</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 10 }}>{_("home.heroTitle", "Lerne Surfen.")}<br /><span style={{ color: t.accent }}>{_("home.heroSub", "Finde deinen Flow.")}</span></h2>
      <p style={{ fontSize: 16, color: t.text2, maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>{_("home.heroDesc", "Erstelle dein persönliches Surf-Programm oder plane deinen nächsten Trip.")}</p>
      {data.skillLevel && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", padding: "8px 16px", borderRadius: 12 }}>
          <span style={{ fontSize: 16 }}>{SKILL_LEVELS.find(s => s.id === data.skillLevel)?.emoji}</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: t.accent, fontWeight: 700 }}>{_(SKILL_LEVELS.find(s => s.id === data.skillLevel)?.key || data.skillLevel)}</span>
        </div>
      )}
      <button onClick={() => navigate("builder")} style={{ display: "block", margin: "0 auto 32px", background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "18px 44px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)" }}>{_("home.createProgram", "Programm erstellen")} 🤙</button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { icon: "🌊", title: _("nav.surf", "Surf"), desc: _("home.checkForecastDesc", "Surf-Bedingungen"), screen: "forecast" },
          { icon: "🏫", title: _("nav.schools", "Schulen"), desc: _("home.findSchool", "Surfschulen finden"), screen: "schools" },
          { icon: "🏄", title: _("nav.equipment", "Equipment"), desc: _("home.findBoardDesc", "Finde dein Board"), screen: "equipment" },
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
