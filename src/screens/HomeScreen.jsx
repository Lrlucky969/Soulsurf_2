// SoulSurf – HomeScreen v6.9 (V4: Decision Dominance – Hero Card, BeginnerZone, Crowd-aware)
import React, { useState, useEffect, useMemo, useRef } from "react";
import { SURF_SPOTS, GOALS } from "../data.js";
import useForecast from "../useForecast.js";
import { getTodayRecommendation, confidenceDisplay, actionDisplay } from "../decisionEngine.js";
import { trackEvent } from "../analytics.js";

const ONBOARDING_KEY = "soulsurf_onboarded";

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

  // v6.4: Decision Engine data
  const { conditions, loading: forecastLoading, bestWindow } = useForecast(spotObj || null);
  // v6.4.1: Granular userData to avoid re-renders on unrelated data changes
  const userData = useMemo(() => ({
    skillLevel: data.skillLevel,
    primaryGoal: data.primaryGoal,
    wantsSchoolHelp: data.wantsSchoolHelp,
    done: data.done,
    streak: data.streak,
    hasSaved: data.hasSaved,
  }), [data.skillLevel, data.primaryGoal, data.wantsSchoolHelp, data.done, data.streak, data.hasSaved]);

  const recommendation = useMemo(() => {
    return getTodayRecommendation(userData, conditions, spotObj);
  }, [userData, conditions, spotObj]);

  // v6.6: Track decision shown (once per recommendation change)
  const lastTrackedRef = useRef(null);
  useEffect(() => {
    if (recommendation.action !== "check_later" && recommendation.action !== lastTrackedRef.current) {
      lastTrackedRef.current = recommendation.action;
      trackEvent("decision_shown", {
        action: recommendation.action,
        confidence: recommendation.confidence,
        spot: spotObj?.id,
      });
    }
  }, [recommendation.action, recommendation.confidence, spotObj?.id]);

  useEffect(() => {
    try { const v = localStorage.getItem(ONBOARDING_KEY); if (!v) setOnboarded(false); } catch {}
  }, []);

  const finishOnboarding = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch {}
    if (data.saveProfile) {
      data.saveProfile({ skillLevel: obSkill || "beginner", primaryGoal: obGoal || "first_waves", wantsSchoolHelp: obSchoolHelp !== false });
    }
    if (obSpot && data.setSpot) data.setSpot(obSpot);
    setOnboarded(true);
  };

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
  // 4-STEP ONBOARDING – v6.6.2: No-scroll layout (buttons always visible)
  // ═══════════════════════════════════════════
  if (!onboarded && !data.skillLevel) {
    const totalSteps = 4;
    const StepDots = () => (
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
        {Array.from({ length: totalSteps }, (_, s) => (
          <div key={s} style={{ width: s === obStep ? 24 : 8, height: 8, borderRadius: 4, background: s <= obStep ? t.accent : (dm ? "#2d3f50" : "#E0E0E0"), opacity: s < obStep ? 0.5 : 1, transition: "all 0.3s ease" }} />
        ))}
      </div>
    );
    const stepLabel = `${_("ob.step")} ${obStep + 1}/${totalSteps}`;

    // v6.6.2: Outer wrapper = full viewport height, flex column, buttons at bottom
    const ObWrap = ({ children, buttons }) => (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 120px)", paddingTop: 10 }}>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", textAlign: "center", paddingBottom: 8 }}>{children}</div>
        <div style={{ flexShrink: 0, paddingTop: 10, paddingBottom: 8 }}>
          {buttons}
          <StepDots />
        </div>
      </div>
    );

    return (
      <div>
        {obStep === 0 && (
          <ObWrap buttons={
            <button onClick={() => { if (obSkill) setObStep(1); }} disabled={!obSkill} style={{
              width: "100%", background: obSkill ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
              color: obSkill ? "white" : t.text3, border: "none", borderRadius: 50, padding: "16px 44px",
              fontSize: 16, fontWeight: 700, cursor: obSkill ? "pointer" : "not-allowed",
              fontFamily: "'Playfair Display', serif", boxShadow: obSkill ? "0 8px 30px rgba(0,150,136,0.3)" : "none", transition: "all 0.3s ease",
            }}>{_("ob.next")} →</button>
          }>
            <img src="/icon-192.png" alt="SoulSurf" style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 14, animation: "float 4s ease-in-out infinite", boxShadow: "0 12px 40px rgba(0,150,136,0.2)" }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 6 }}>{_("ob.welcome")}</h1>
            <p style={{ fontSize: 14, color: t.text2, maxWidth: 340, margin: "0 auto 16px", lineHeight: 1.6 }}>{_("ob.welcomeDesc")}</p>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{_("ob.skillTitle")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 380, margin: "0 auto" }}>
              {SKILL_LEVELS.map((level, i) => (
                <button key={level.id} onClick={() => setObSkill(level.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14,
                  background: obSkill === level.id ? (dm ? `${level.color}20` : `${level.color}12`) : t.card,
                  border: obSkill === level.id ? `2px solid ${level.color}` : `2px solid ${t.cardBorder}`,
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                  animation: "slideUp 0.3s ease both", animationDelay: `${i * 70}ms`,
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${level.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{level.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: obSkill === level.id ? level.color : t.text }}>{_(level.key)}</div>
                    <div style={{ fontSize: 11, color: t.text2, marginTop: 1 }}>{_(level.descKey)}</div>
                  </div>
                  {obSkill === level.id && <span style={{ fontSize: 16, color: level.color }}>✓</span>}
                </button>
              ))}
            </div>
          </ObWrap>
        )}
        {obStep === 1 && (
          <ObWrap buttons={
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setObStep(0)} style={{ background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>←</button>
              <button onClick={() => { if (obGoal) setObStep(2); }} disabled={!obGoal} style={{
                flex: 1, maxWidth: 200, background: obGoal ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
                color: obGoal ? "white" : t.text3, border: "none", borderRadius: 50, padding: "14px 28px",
                fontSize: 16, fontWeight: 700, cursor: obGoal ? "pointer" : "not-allowed",
                fontFamily: "'Playfair Display', serif", transition: "all 0.3s ease",
              }}>{_("ob.next")} →</button>
            </div>
          }>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 8 }}>{stepLabel}</div>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎯</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("ob.goalTitle")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 380, margin: "16px auto 0" }}>
              {SURF_GOALS.map((goal, i) => (
                <button key={goal.id} onClick={() => setObGoal(goal.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14,
                  background: obGoal === goal.id ? (dm ? `${goal.color}20` : `${goal.color}12`) : t.card,
                  border: obGoal === goal.id ? `2px solid ${goal.color}` : `2px solid ${t.cardBorder}`,
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                  animation: "slideUp 0.3s ease both", animationDelay: `${i * 70}ms`,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${goal.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{goal.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: obGoal === goal.id ? goal.color : t.text }}>{_(goal.key)}</div>
                    {goal.descKey && <div style={{ fontSize: 11, color: t.text2, marginTop: 1 }}>{_(goal.descKey)}</div>}
                  </div>
                  {obGoal === goal.id && <span style={{ fontSize: 16, color: goal.color }}>✓</span>}
                </button>
              ))}
            </div>
          </ObWrap>
        )}
        {obStep === 2 && (
          <ObWrap buttons={
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setObStep(1)} style={{ background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>←</button>
              <button onClick={() => { if (obSpot) setObStep(3); }} disabled={!obSpot} style={{
                flex: 1, maxWidth: 200, background: obSpot ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
                color: obSpot ? "white" : t.text3, border: "none", borderRadius: 50, padding: "14px 28px",
                fontSize: 16, fontWeight: 700, cursor: obSpot ? "pointer" : "not-allowed",
                fontFamily: "'Playfair Display', serif", transition: "all 0.3s ease",
              }}>{_("ob.next")} →</button>
            </div>
          }>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 8 }}>{stepLabel}</div>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📍</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("ob.locationTitle")}</h2>
            <p style={{ fontSize: 12, color: t.text2, marginBottom: 14 }}>{_("ob.locationDesc")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, maxWidth: 380, margin: "0 auto" }}>
              {SURF_SPOTS.map((spot, i) => (
                <button key={spot.id} onClick={() => setObSpot(spot.id)} style={{
                  padding: "10px 6px", borderRadius: 12, textAlign: "center",
                  background: obSpot === spot.id ? (dm ? "rgba(0,150,136,0.15)" : "#E0F2F1") : t.card,
                  border: obSpot === spot.id ? `2px solid ${t.accent}` : `2px solid ${t.cardBorder}`,
                  cursor: "pointer", transition: "all 0.2s ease",
                  animation: "slideUp 0.2s ease both", animationDelay: `${i * 30}ms`,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 2 }}>{spot.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: obSpot === spot.id ? t.accent : t.text, lineHeight: 1.2 }}>{spot.name.split(",")[0]}</div>
                </button>
              ))}
            </div>
          </ObWrap>
        )}
        {obStep === 3 && (
          <ObWrap buttons={
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setObStep(2)} style={{ background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>←</button>
              <button onClick={() => { if (obSchoolHelp !== null) finishOnboarding(); }} disabled={obSchoolHelp === null} style={{
                flex: 1, maxWidth: 200, background: obSchoolHelp !== null ? "linear-gradient(135deg, #009688, #4DB6AC)" : (dm ? "#2d3f50" : "#E0E0E0"),
                color: obSchoolHelp !== null ? "white" : t.text3, border: "none", borderRadius: 50, padding: "14px 28px",
                fontSize: 16, fontWeight: 700, cursor: obSchoolHelp !== null ? "pointer" : "not-allowed",
                fontFamily: "'Playfair Display', serif", boxShadow: obSchoolHelp !== null ? "0 8px 30px rgba(0,150,136,0.3)" : "none", transition: "all 0.3s ease",
              }}>{_("ob.finish")}</button>
            </div>
          }>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 8 }}>{stepLabel}</div>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🏫</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("ob.schoolTitle")}</h2>
            <p style={{ fontSize: 12, color: t.text2, maxWidth: 340, margin: "0 auto 20px", lineHeight: 1.5 }}>{_("ob.schoolDesc")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 340, margin: "0 auto" }}>
              <button onClick={() => setObSchoolHelp(true)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16,
                background: obSchoolHelp === true ? (dm ? "rgba(0,150,136,0.15)" : "#E0F2F1") : t.card,
                border: obSchoolHelp === true ? `2px solid ${t.accent}` : `2px solid ${t.cardBorder}`,
                cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 28 }}>👍</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: obSchoolHelp === true ? t.accent : t.text }}>{_("ob.schoolYes")}</div></div>
                {obSchoolHelp === true && <span style={{ fontSize: 18, color: t.accent }}>✓</span>}
              </button>
              <button onClick={() => setObSchoolHelp(false)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16,
                background: obSchoolHelp === false ? (dm ? "rgba(158,158,158,0.1)" : "#F5F5F5") : t.card,
                border: obSchoolHelp === false ? `2px solid ${t.text3}` : `2px solid ${t.cardBorder}`,
                cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
              }}>
                <span style={{ fontSize: 28 }}>🤙</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{_("ob.schoolNo")}</div></div>
                {obSchoolHelp === false && <span style={{ fontSize: 18, color: t.text3 }}>✓</span>}
              </button>
            </div>
            {obSchoolHelp !== null && (
              <div style={{ maxWidth: 340, margin: "16px auto 0", background: dm ? "rgba(0,150,136,0.06)" : "#F1F8F7", border: `1px solid ${dm ? "rgba(0,150,136,0.12)" : "#C8E6C9"}`, borderRadius: 14, padding: "12px 14px", textAlign: "left", animation: "slideUp 0.3s ease both" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{_("ob.yourProfile", "Dein Profil")}</div>
                <div style={{ fontSize: 12, color: t.text, lineHeight: 1.8 }}>
                  {SKILL_LEVELS.find(s => s.id === obSkill)?.emoji} {_(SKILL_LEVELS.find(s => s.id === obSkill)?.key || "")}<br />
                  🎯 {_(SURF_GOALS.find(g => g.id === obGoal)?.key || "")}<br />
                  📍 {SURF_SPOTS.find(s => s.id === obSpot)?.emoji} {SURF_SPOTS.find(s => s.id === obSpot)?.name?.split(",")[0]}<br />
                  🏫 {obSchoolHelp ? _("ob.schoolYes") : _("ob.schoolNo")}
                </div>
              </div>
            )}
          </ObWrap>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // v6.4: DECISION ENGINE DASHBOARD
  // ═══════════════════════════════════════════
  if (data.hasSaved && spotObj) {
    const today = new Date().toISOString().slice(0, 10);
    const surfedToday = (data.surfDays || []).includes(today);
    const hour = new Date().getHours();
    const timeGreeting = hour < 10 ? _("home.morning") : hour < 14 ? _("home.midday") : hour < 18 ? _("home.afternoon") : _("home.evening");
    const dateLang = i18n?.lang === "pt" ? "pt-BR" : i18n?.lang === "en" ? "en-US" : "de-DE";
    const streakMilestones = data.streakMilestones || { achieved: [], current: null, next: null, progress: 0 };
    const conf = confidenceDisplay(recommendation.confidence);
    const act = actionDisplay(recommendation.action);

    return (
      <div style={{ paddingTop: 20 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString(dateLang, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginTop: 4 }}>
            {data.streak > 2 ? _("home.onFire") : progressPct >= 80 ? _("home.almostDone") : progressPct >= 50 ? _("home.keepGoing") : timeGreeting}
          </h2>
        </div>

        {/* ══════ V4: DECISION HERO (dominates screen) ══════ */}
        <div style={{
          borderRadius: 22, padding: "22px 20px", marginBottom: 14,
          position: "relative", overflow: "hidden",
          animation: "slideUp 0.4s ease both",
          ...(recommendation.action === "surf_solo" ? {
            background: dm ? "linear-gradient(135deg, #1B5E20, #2E7D32)" : "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
            border: "2px solid #4CAF5060",
          } : recommendation.action === "book_lesson" ? {
            background: dm ? "linear-gradient(135deg, #E65100, #BF360C)" : "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
            border: "2px solid #FF980060",
          } : recommendation.action === "no_surf" ? {
            background: dm ? "linear-gradient(135deg, #B71C1C, #880E4F)" : "linear-gradient(135deg, #FFEBEE, #FCE4EC)",
            border: "2px solid #F4433660",
          } : {
            background: `linear-gradient(135deg, ${conf.color}18, ${conf.color}08)`,
            border: `2px solid ${conf.color}40`,
          }),
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.07 }}>{act.emoji}</div>

          {/* State label */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em",
              color: recommendation.action === "surf_solo" ? (dm ? "#A5D6A7" : "#2E7D32") : recommendation.action === "book_lesson" ? (dm ? "#FFCC80" : "#E65100") : recommendation.action === "no_surf" ? (dm ? "#EF9A9A" : "#C62828") : t.text3,
            }}>
              {_("decision.todayFor")} · {spotObj.emoji} {spotObj.name.split(",")[0]}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${conf.color}20`, padding: "3px 8px", borderRadius: 6 }}>
              <span style={{ fontSize: 10 }}>{conf.emoji}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700, color: conf.color }}>{_(conf.label)}</span>
            </div>
          </div>

          {!conditions ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8, animation: forecastLoading ? "float 2s ease-in-out infinite" : "none" }}>🌊</div>
              <div style={{ fontSize: 13, color: dm ? "#ccc" : t.text2 }}>{forecastLoading ? _("decision.noData") : _("decision.noWaveData")}</div>
            </div>
          ) : (
            <>
              {/* v6.9: Large action headline */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
                  background: recommendation.action === "surf_solo" ? (dm ? "rgba(255,255,255,0.1)" : "#4CAF5018") : recommendation.action === "book_lesson" ? (dm ? "rgba(255,255,255,0.1)" : "#FF980018") : (dm ? "rgba(255,255,255,0.1)" : `${act.color}18`),
                }}>{act.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900,
                    color: recommendation.action === "surf_solo" ? (dm ? "#fff" : "#1B5E20") : recommendation.action === "book_lesson" ? (dm ? "#fff" : "#BF360C") : recommendation.action === "no_surf" ? (dm ? "#fff" : "#B71C1C") : t.text,
                  }}>{_(act.label)}</div>
                  <div style={{ fontSize: 12, marginTop: 2,
                    color: dm ? "rgba(255,255,255,0.75)" : t.text2,
                  }}>{_(recommendation.reasonKey)}</div>
                </div>
              </div>

              {/* v6.9: Beginner Zone tip (only for go-surf states) */}
              {recommendation.beginnerZone && (recommendation.action === "surf_solo" || recommendation.action === "surf_with_caution") && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 10, marginBottom: 10,
                  background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>📍</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: dm ? "#fff" : t.text }}>{_("decision.goHere", "Geh hierhin:")}</div>
                    <div style={{ fontSize: 11, color: dm ? "rgba(255,255,255,0.7)" : t.text2 }}>{recommendation.beginnerZone}</div>
                  </div>
                </div>
              )}

              {/* v6.9: Secondary note (crowd warning etc.) */}
              {recommendation.secondaryNote && (
                <div style={{ fontSize: 10, padding: "5px 10px", borderRadius: 8, marginBottom: 10,
                  background: dm ? "rgba(255,183,77,0.1)" : "#FFF8E1", color: dm ? "#FFB74D" : "#E65100",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>👥</span> {_(recommendation.secondaryNote)}
                </div>
              )}

              {/* Conditions mini-row */}
              {conditions.waveHeight != null && (
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {[
                    { label: _("decision.waves"), value: `${conditions.waveHeight.toFixed(1)}m`, sub: conditions.wavePeriod != null ? `${conditions.wavePeriod.toFixed(0)}s` : null },
                    { label: _("decision.wind"), value: `${conditions.wind != null ? Math.round(conditions.wind) : "–"}`, sub: "km/h" },
                    { label: "Score", value: conditions.surfScore, sub: null },
                  ].map((c, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: 10, padding: "7px 8px", textAlign: "center",
                      background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                    }}>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: dm ? "rgba(255,255,255,0.5)" : t.text3 }}>{c.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: i === 2 ? conf.color : (dm ? "#fff" : t.text) }}>{c.value}{c.sub && <span style={{ fontSize: 9, fontWeight: 400 }}>{c.sub}</span>}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Best window hint */}
              {bestWindow && bestWindow.score >= 60 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, marginBottom: 12,
                  background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                }}>
                  <span style={{ fontSize: 13 }}>⏰</span>
                  <span style={{ fontSize: 11, color: dm ? "rgba(255,255,255,0.7)" : t.text2 }}>
                    {_("decision.bestWindow")}: <strong style={{ color: dm ? "#fff" : t.text }}>{bestWindow.hour}:00</strong> (Score {bestWindow.score})
                  </span>
                </div>
              )}

              {/* Primary CTA */}
              {recommendation.cta && (
                <button onClick={() => {
                  trackEvent("decision_cta_clicked", { action: recommendation.action, confidence: recommendation.confidence, spot: spotObj?.id, ctaScreen: recommendation.cta.screen });
                  if (recommendation.cta.screen === "schools") {
                    navigate("schools", { fromDecision: true, spot: spotObj?.id, reason: recommendation.reasonKey, action: recommendation.action });
                  } else {
                    navigate(recommendation.cta.screen);
                  }
                }} style={{
                  width: "100%", padding: "14px", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Playfair Display', serif", color: "white", border: "none",
                  background: recommendation.action === "book_lesson" ? "linear-gradient(135deg, #FF9800, #FF7043)"
                    : recommendation.action === "no_surf" ? "linear-gradient(135deg, #5C6BC0, #7986CB)"
                    : "linear-gradient(135deg, #009688, #4DB6AC)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                }}>
                  {_(recommendation.cta.text)} →
                </button>
              )}
            </>
          )}
        </div>

        {/* Notification prompt (only if not granted) */}
        {notifications && notifications.isSupported && !notifications.isGranted && (
          <button onClick={async () => await notifications.requestPermission()} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, background: dm ? "rgba(255,183,77,0.06)" : "#FFF8E1",
            border: `1px solid ${dm ? "rgba(255,183,77,0.12)" : "#FFE0B2"}`, borderRadius: 14, padding: "10px 16px", marginBottom: 12, cursor: "pointer", textAlign: "left",
          }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{_("home.notifEnable", "Benachrichtigungen aktivieren")}</div>
            </div>
            <span style={{ fontSize: 11, color: t.accent, fontWeight: 700 }}>→</span>
          </button>
        )}

        {/* Streak Card (v6.9: more compact) */}
        {data.streak >= 2 && streakMilestones.current && (
          <div style={{ background: "linear-gradient(135deg, #FFB74D, #FF7043)", borderRadius: 12, padding: "10px 14px", marginBottom: 10, color: "white", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 800 }}>{data.streak} {_("general.days", "Tage")}</span>
              {streakMilestones.next && <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 8 }}>{streakMilestones.next.badge} in {streakMilestones.next.day - data.streak}d</span>}
            </div>
            {data.canFreezeStreak && data.streak >= 3 && (
              <button onClick={() => setShowFreezeConfirm(true)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 9, fontWeight: 700, color: "white", cursor: "pointer" }}>🧊</button>
            )}
          </div>
        )}

        {showFreezeConfirm && (
          <div style={{ background: dm ? "rgba(92,107,192,0.1)" : "#E8EAF6", border: `1px solid ${dm ? "rgba(92,107,192,0.2)" : "#C5CAE9"}`, borderRadius: 14, padding: "16px", marginBottom: 12, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: t.text, marginBottom: 8, fontWeight: 700 }}>{_("home.freezeTitle", "Streak Freeze aktivieren?")}</p>
            <p style={{ fontSize: 11, color: t.text2, marginBottom: 10 }}>{_("home.freezeDesc", "Dein Streak bleibt 1 Tag erhalten. 1x pro Monat.")}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={handleFreezeStreak} style={{ background: "#7986CB", color: "white", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{_("g.activate", "Aktivieren")}</button>
              <button onClick={() => setShowFreezeConfirm(false)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, cursor: "pointer" }}>{_("g.cancel", "Abbrechen")}</button>
            </div>
          </div>
        )}

        {/* Milestone toast */}
        {milestone && !seenTooltips[`ms-${data.done}-${data.streak}`] && (
          <div style={{ background: dm ? "rgba(255,183,77,0.1)" : "#FFF8E1", border: `1px solid ${dm ? "rgba(255,183,77,0.2)" : "#FFE0B2"}`, borderRadius: 14, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{milestone.emoji}</span>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: dm ? "#FFB74D" : "#E65100" }}>{milestone.text}</div>
            <button onClick={() => dismissTooltip(`ms-${data.done}-${data.streak}`)} style={{ background: "none", border: "none", color: t.text3, fontSize: 14, cursor: "pointer", padding: 2 }}>✕</button>
          </div>
        )}

        {/* Next Lesson Card (compact) */}
        {data.hasSaved && (
          <button onClick={() => navigate("lessons")} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            background: "linear-gradient(135deg, #004D40, #00695C)", borderRadius: 16,
            padding: "14px 16px", marginBottom: 12, cursor: "pointer", textAlign: "left",
            color: "white", border: "none", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 50, opacity: 0.08 }}>📚</div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>{_("home.continueSurf", "Weiter surfen")}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: 0.7 }}>{data.done}/{data.total} · {progressPct}%</div>
            </div>
            <span style={{ fontSize: 14, opacity: 0.7 }}>→</span>
          </button>
        )}

        {/* Surf Today toggle */}
        <button onClick={data.toggleSurfDay} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 12, borderRadius: 14, cursor: "pointer", textAlign: "left",
          background: surfedToday ? (dm ? "rgba(255,183,77,0.12)" : "#FFF8E1") : t.card,
          border: `1px solid ${surfedToday ? "#FFB74D" : t.cardBorder}`,
        }}>
          <span style={{ fontSize: 22 }}>{surfedToday ? "🏄‍♂️" : "🏖️"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: surfedToday ? "#E65100" : t.text }}>{surfedToday ? _("home.surfedToday") : _("home.surfedTodayQ")}</div>
            <div style={{ fontSize: 10, color: t.text2 }}>{surfedToday ? `${_("home.streak")}: ${data.streak} 🔥` : _("home.tapToLog")}</div>
          </div>
        </button>

        {/* Reset program (hidden behind tap) */}
        {showResetConfirm && (
          <div style={{ background: dm ? "#2d2010" : "#FFF3E0", border: "2px solid #FFB74D", borderRadius: 14, padding: "14px", marginBottom: 12, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: dm ? "#e8eaed" : "#4E342E", marginBottom: 10 }}>{_("home.resetConfirm", "Programm löschen?")}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => { data.resetProgram(); setShowResetConfirm(false); }} style={{ background: "#E53935", color: "white", border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{_("g.delete", "Löschen")}</button>
              <button onClick={() => setShowResetConfirm(false)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 10, padding: "7px 18px", fontSize: 12, cursor: "pointer" }}>{_("g.cancel", "Abbrechen")}</button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
          {[
            { icon: "🌊", label: _("nav.surf", "Surf"), screen: "forecast" },
            { icon: "🏫", label: _("nav.schools", "Schulen"), screen: "schools" },
            { icon: "📓", label: _("nav.log", "Log"), screen: "diary" },
            { icon: "👤", label: _("nav.profile", "Profil"), screen: "profile" },
          ].map((card, i) => (
            <button key={i} onClick={() => navigate(card.screen)} style={{ background: t.card, borderRadius: 12, padding: "12px 6px", border: `1px solid ${t.cardBorder}`, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{card.icon}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, fontWeight: 600, color: t.text2 }}>{card.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // DEFAULT HOME (onboarded, no program yet)
  // v6.4: Also shows Decision Card if spot set
  // ═══════════════════════════════════════════
  const conf2 = confidenceDisplay(recommendation.confidence);
  const act2 = actionDisplay(recommendation.action);

  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌊</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 4 }}>{_("home.heroTitle", "Lerne Surfen.")}</h2>
        <p style={{ fontSize: 13, color: t.text2, maxWidth: 360, margin: "0 auto", lineHeight: 1.5 }}>{_("home.heroDesc", "Erstelle dein persönliches Surf-Programm oder plane deinen nächsten Trip.")}</p>
      </div>

      {/* v6.9: Decision Hero for no-program users */}
      {spotObj && conditions && (
        <div style={{
          borderRadius: 20, padding: "18px", marginBottom: 16,
          ...(recommendation.action === "surf_solo" ? {
            background: dm ? "linear-gradient(135deg, #1B5E20, #2E7D32)" : "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
            border: "2px solid #4CAF5060",
          } : recommendation.action === "book_lesson" ? {
            background: dm ? "linear-gradient(135deg, #E65100, #BF360C)" : "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
            border: "2px solid #FF980060",
          } : {
            background: `linear-gradient(135deg, ${conf2.color}18, ${conf2.color}08)`,
            border: `2px solid ${conf2.color}40`,
          }),
          position: "relative", overflow: "hidden", textAlign: "left",
        }}>
          <div style={{ position: "absolute", top: -15, right: -15, fontSize: 70, opacity: 0.06 }}>{act2.emoji}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              background: dm ? "rgba(255,255,255,0.1)" : `${act2.color}15`,
            }}>{act2.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900,
                color: recommendation.action === "surf_solo" ? (dm ? "#fff" : "#1B5E20") : recommendation.action === "book_lesson" ? (dm ? "#fff" : "#BF360C") : t.text,
              }}>{_(act2.label)}</div>
              <div style={{ fontSize: 11, color: dm ? "rgba(255,255,255,0.7)" : t.text2, marginTop: 1 }}>
                {_(recommendation.reasonKey)} · {spotObj.emoji} {spotObj.name.split(",")[0]} · {conditions.waveHeight?.toFixed(1)}m
              </div>
            </div>
            <div style={{ background: `${conf2.color}20`, padding: "3px 8px", borderRadius: 6 }}>
              <span style={{ fontSize: 10 }}>{conf2.emoji}</span>
            </div>
          </div>
          {recommendation.beginnerZone && (
            <div style={{ fontSize: 11, padding: "6px 10px", borderRadius: 8, marginBottom: 8,
              background: dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)", display: "flex", gap: 6, alignItems: "center",
              color: dm ? "rgba(255,255,255,0.8)" : t.text2,
            }}>
              <span>📍</span> {recommendation.beginnerZone}
            </div>
          )}
          {recommendation.cta && (
            <button onClick={() => {
              trackEvent("decision_cta_clicked", { action: recommendation.action, spot: spotObj?.id, source: "hero_no_program" });
              if (recommendation.cta.screen === "schools") {
                navigate("schools", { fromDecision: true, spot: spotObj?.id, reason: recommendation.reasonKey, action: recommendation.action });
              } else {
                navigate(recommendation.cta.screen);
              }
            }} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", color: "white", border: "none",
              background: recommendation.action === "book_lesson" ? "linear-gradient(135deg, #FF9800, #FF7043)" : "linear-gradient(135deg, #009688, #4DB6AC)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}>
              {_(recommendation.cta.text)} →
            </button>
          )}
        </div>
      )}

      <button onClick={() => navigate("builder")} style={{ display: "block", width: "100%", margin: "0 auto 20px", background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "16px", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)" }}>{_("home.createProgram", "Programm erstellen")} 🤙</button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { icon: "🌊", title: _("nav.surf", "Surf"), desc: _("home.checkForecastDesc", "Surf-Bedingungen"), screen: "forecast" },
          { icon: "🏫", title: _("nav.schools", "Schulen"), desc: _("home.findSchool", "Surfschulen finden"), screen: "schools" },
          { icon: "🏄", title: _("nav.equipment", "Equipment"), desc: _("home.findBoardDesc", "Finde dein Board"), screen: "equipment" },
        ].map((card, i) => (
          <button key={i} onClick={() => navigate(card.screen)} style={{
            background: t.card, borderRadius: 18, padding: "18px 14px", border: `1px solid ${t.cardBorder}`,
            cursor: "pointer", textAlign: "left", animation: "slideUp 0.4s ease both", animationDelay: `${i * 100}ms`,
          }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{card.icon}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: t.text, marginBottom: 3 }}>{card.title}</div>
            <div style={{ fontSize: 11, color: t.text3, lineHeight: 1.3 }}>{card.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
