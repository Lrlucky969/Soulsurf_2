// SoulSurf – HomeScreen v7.7.2 (Design Sprint 2: Gamification Upgrade)
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
  { id: "first_waves", emoji: "🌊", key: "goal.firstWaves", descKey: "goal.firstWavesDesc", color: "#0EA5E9" },
  { id: "improve_takeoff", emoji: "⚡", key: "goal.improveTakeoff", descKey: "goal.improveTakeoffDesc", color: "#FF9800" },
  { id: "learn_turns", emoji: "🔄", key: "goal.learnTurns", descKey: "goal.learnTurnsDesc", color: "#5C6BC0" },
  { id: "surf_independently", emoji: "🏄", key: "goal.surfIndependently", descKey: "goal.surfIndependentlyDesc", color: "#E91E63" },
];

export default function HomeScreen({ data, t, dm, i18n, navigate, spotObj, savedGoal, notifications, showXpToast }) {
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
  const { conditions, loading: forecastLoading, bestWindow, tomorrowBest, lastUpdated } = useForecast(spotObj || null);
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
    const totalSteps = 2;
    const StepDots = () => (
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
        {Array.from({ length: totalSteps }, (_, s) => (
          <div key={s} style={{ width: s === obStep ? 24 : 8, height: 8, borderRadius: 4, background: s <= obStep ? t.accent : (dm ? "#2d3f50" : "#E0E0E0"), opacity: s < obStep ? 0.5 : 1, transition: "all 0.3s ease" }} />
        ))}
      </div>
    );

    // v7.6.1: Simplified wrapper
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
        {/* v7.6.1: STEP 0 – Welcome + Skill Level */}
        {obStep === 0 && (
          <ObWrap buttons={
            <button onClick={() => { if (obSkill) setObStep(1); }} disabled={!obSkill} style={{
              width: "100%", background: obSkill ? "linear-gradient(135deg, #0EA5E9, #38BDF8)" : (dm ? "#2d3f50" : "#E0E0E0"),
              color: obSkill ? "white" : t.text3, border: "none", borderRadius: 50, padding: "16px 44px",
              fontSize: 16, fontWeight: 700, cursor: obSkill ? "pointer" : "not-allowed",
              fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: obSkill ? "0 8px 30px rgba(14,165,233,0.3)" : "none", transition: "all 0.3s ease",
            }}>{_("ob.next")} →</button>
          }>
            <img src="/icon-192.png" alt="SoulSurf" style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 14, animation: "float 4s ease-in-out infinite", boxShadow: "0 12px 40px rgba(14,165,233,0.2)" }} />
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 30, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 6 }}>{_("ob.welcome")}</h1>
            <p style={{ fontSize: 14, color: t.text2, maxWidth: 340, margin: "0 auto 16px", lineHeight: 1.6 }}>{_("ob.welcomeDesc")}</p>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{_("ob.skillTitle")}</div>
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
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: obSkill === level.id ? level.color : t.text }}>{_(level.key)}</div>
                    <div style={{ fontSize: 11, color: t.text2, marginTop: 1 }}>{_(level.descKey)}</div>
                  </div>
                  {obSkill === level.id && <span style={{ fontSize: 16, color: level.color }}>✓</span>}
                </button>
              ))}
            </div>
          </ObWrap>
        )}

        {/* v7.6.1: STEP 1 – Spot Selection → Finish */}
        {obStep === 1 && (
          <ObWrap buttons={
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setObStep(0)} style={{ background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}`, borderRadius: 50, padding: "14px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>←</button>
              <button onClick={() => { if (obSpot) finishOnboarding(); }} disabled={!obSpot} style={{
                flex: 1, maxWidth: 240, background: obSpot ? "linear-gradient(135deg, #0EA5E9, #38BDF8)" : (dm ? "#2d3f50" : "#E0E0E0"),
                color: obSpot ? "white" : t.text3, border: "none", borderRadius: 50, padding: "14px 28px",
                fontSize: 16, fontWeight: 700, cursor: obSpot ? "pointer" : "not-allowed",
                fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: obSpot ? "0 8px 30px rgba(14,165,233,0.3)" : "none", transition: "all 0.3s ease",
              }}>{_("ob.finish")} 🤙</button>
            </div>
          }>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.accent, marginBottom: 8 }}>{_("ob.step")} 2/2</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("ob.locationTitle")}</h2>
            <p style={{ fontSize: 12, color: t.text2, marginBottom: 14 }}>{_("ob.locationDesc")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, maxWidth: 380, margin: "0 auto" }}>
              {SURF_SPOTS.map((spot, i) => (
                <button key={spot.id} onClick={() => setObSpot(spot.id)} style={{
                  padding: "6px 6px 10px", borderRadius: 12, textAlign: "center", overflow: "hidden",
                  background: obSpot === spot.id ? (dm ? "rgba(14,165,233,0.15)" : "#E0F2FE") : t.card,
                  border: obSpot === spot.id ? `2px solid ${t.accent}` : `2px solid ${t.cardBorder}`,
                  cursor: "pointer", transition: "all 0.2s ease",
                  animation: "slideUp 0.2s ease both", animationDelay: `${i * 30}ms`,
                }}>
                  {spot.image ? (
                    <img src={spot.image} alt="" loading="lazy" style={{ width: "100%", height: 48, objectFit: "cover", borderRadius: 8, marginBottom: 4 }} />
                  ) : (
                    <div style={{ fontSize: 20, marginBottom: 2 }}>{spot.emoji}</div>
                  )}
                  <div style={{ fontSize: 10, fontWeight: 700, color: obSpot === spot.id ? t.accent : t.text, lineHeight: 1.2 }}>{spot.name.split(",")[0]}</div>
                </button>
              ))}
            </div>
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
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString(dateLang, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: t.text, marginTop: 4 }}>
            {data.streak > 2 ? _("home.onFire") : progressPct >= 80 ? _("home.almostDone") : progressPct >= 50 ? _("home.keepGoing") : timeGreeting}
          </h2>
        </div>

        {/* ══════ v7.5.5: DECISION HERO – Score-centric Redesign ══════ */}
        <div style={{
          borderRadius: 22, padding: "22px 20px", marginBottom: 14,
          position: "relative", overflow: "hidden",
          animation: "scaleIn 0.4s ease both",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          ...(recommendation.action === "surf_solo" ? {
            background: dm ? "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(6,182,212,0.15))" : "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(14,165,233,0.08))",
            border: `2px solid ${dm ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.25)"}`,
          } : recommendation.action === "book_lesson" ? {
            background: dm ? "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(249,115,22,0.15))" : "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.06))",
            border: `2px solid ${dm ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.25)"}`,
          } : recommendation.action === "no_surf" ? {
            background: dm ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(107,114,128,0.15))" : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(107,114,128,0.04))",
            border: `2px solid ${dm ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.15)"}`,
          } : {
            background: dm ? "rgba(30,41,59,0.6)" : "rgba(255,255,255,0.7)",
            border: `2px solid ${dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
          }),
          boxShadow: dm ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
        }}>
          {spotObj.image && <img src={spotObj.image} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: dm ? 0.1 : 0.06, pointerEvents: "none" }} />}

          {/* Top row: Spot + Confidence */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {spotObj.image ? (
                <img src={spotObj.image} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 18 }}>{spotObj.emoji}</span>
              )}
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: dm ? "rgba(255,255,255,0.5)" : t.text3 }}>
                  {_("decision.todayFor")}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: dm ? "#fff" : t.text }}>{spotObj.name.split(",")[0]}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: `${conf.color}15`, backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: 8, border: `1px solid ${conf.color}25` }}>
              <span style={{ fontSize: 11 }}>{conf.emoji}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: conf.color }}>{_(conf.label)}</span>
            </div>
          </div>

          {!conditions ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 8, animation: forecastLoading ? "float 2s ease-in-out infinite" : "none" }}>🌊</div>
              <div style={{ fontSize: 13, color: dm ? "#ccc" : t.text2 }}>{forecastLoading ? _("decision.noData") : _("decision.noWaveData")}</div>
            </div>
          ) : (
            <>
              {/* Score + Action: Visual Center */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                {/* Large Score Circle */}
                <div style={{
                  width: 72, height: 72, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  background: recommendation.action === "surf_solo" ? (dm ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)")
                    : recommendation.action === "book_lesson" ? (dm ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.1)")
                    : (dm ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)"),
                  border: `2px solid ${conf.color}30`,
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 800, lineHeight: 1, color: conf.color }}>
                    {conditions.surfScore != null ? conditions.surfScore : "–"}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: dm ? "rgba(255,255,255,0.4)" : t.text3, marginTop: 2 }}>Score</div>
                </div>
                {/* Action + Reason */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, lineHeight: 1.15,
                    color: dm ? "#fff" : t.text,
                  }}>
                    {act.emoji} {_(act.label)}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 3, color: dm ? "rgba(255,255,255,0.65)" : t.text2, lineHeight: 1.4 }}>
                    {_(recommendation.reasonKey)}
                  </div>
                </div>
              </div>

              {/* v7.7.2: Score Range Bar – Aware-style */}
              {conditions.surfScore != null && (
                <div style={{ marginBottom: 14, padding: "0 4px" }}>
                  <div style={{ height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${dm ? "#F87171" : "#EF4444"}, ${dm ? "#FBBF24" : "#F59E0B"}, ${dm ? "#34D399" : "#10B981"})`, position: "relative" }}>
                    <div style={{
                      position: "absolute", top: -5, width: 16, height: 16, borderRadius: "50%",
                      background: conf.color, border: `3px solid ${dm ? "#1E293B" : "#fff"}`, boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      left: `calc(${Math.min(Math.max(conditions.surfScore, 0), 100)}% - 8px)`,
                      transition: "left 0.6s ease",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: dm ? "rgba(255,255,255,0.3)" : t.text3 }}>0</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: dm ? "rgba(255,255,255,0.3)" : t.text3 }}>100</span>
                  </div>
                </div>
              )}

              {/* Conditions Pill Row */}
              {conditions.waveHeight != null && recommendation.action !== "no_surf" && recommendation.action !== "check_later" && (
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {[
                    { icon: "🌊", value: `${conditions.waveHeight.toFixed(1)}m`, sub: conditions.wavePeriod != null ? `${conditions.wavePeriod.toFixed(0)}s` : null },
                    { icon: "💨", value: `${conditions.wind != null ? Math.round(conditions.wind) : "–"}`, sub: "km/h" },
                    bestWindow && bestWindow.score >= 60 ? { icon: "⏰", value: `${bestWindow.hour}:00`, sub: `Score ${bestWindow.score}` } : null,
                  ].filter(Boolean).map((c, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: 10, padding: "8px", textAlign: "center",
                      background: dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.025)",
                      border: `1px solid ${dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                    }}>
                      <span style={{ fontSize: 12 }}>{c.icon}</span>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: dm ? "#fff" : t.text, marginTop: 2 }}>
                        {c.value}{c.sub && <span style={{ fontSize: 9, fontWeight: 400, opacity: 0.6 }}> {c.sub}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Beginner Zone tip */}
              {recommendation.beginnerZone && recommendation.action !== "no_surf" && recommendation.action !== "check_later" && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 10, marginBottom: 10,
                  background: dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>📍</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: dm ? "#fff" : t.text }}>{_("decision.goHere", "Geh hierhin:")}</div>
                    <div style={{ fontSize: 11, color: dm ? "rgba(255,255,255,0.6)" : t.text2 }}>{recommendation.beginnerZone}</div>
                  </div>
                </div>
              )}

              {/* Secondary note */}
              {recommendation.secondaryNote && (
                <div style={{ fontSize: 11, padding: "6px 10px", borderRadius: 8, marginBottom: 10,
                  background: dm ? "rgba(251,191,36,0.08)" : "#FFF8E1", color: dm ? "#FBBF24" : "#92400E",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>👥</span> {_(recommendation.secondaryNote)}
                </div>
              )}

              {/* Tomorrow hint */}
              {tomorrowBest && tomorrowBest.score >= 60 && (recommendation.action === "no_surf" || recommendation.action === "wait_better_day" || (recommendation.confidence === "low" && recommendation.action !== "check_later")) && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, marginBottom: 12,
                  background: dm ? "rgba(52,211,153,0.08)" : "rgba(16,185,129,0.06)", border: `1px solid ${dm ? "rgba(52,211,153,0.15)" : "rgba(16,185,129,0.15)"}`,
                }}>
                  <span style={{ fontSize: 14 }}>🌅</span>
                  <span style={{ fontSize: 11, color: dm ? t.accentGreen : "#065F46", lineHeight: 1.4 }}>
                    {_("decision.tomorrowBetter", "Morgen sieht besser aus!")}{" "}
                    <strong>{tomorrowBest.hour}:00</strong> – Score {tomorrowBest.score}
                    {tomorrowBest.waveHeight != null && <span style={{ fontWeight: 400 }}> · {tomorrowBest.waveHeight.toFixed(1)}m</span>}
                  </span>
                </div>
              )}

              {/* Last updated */}
              {lastUpdated && (() => {
                const mins = Math.round((Date.now() - lastUpdated.getTime()) / 60000);
                const label = mins < 3 ? _("decision.justUpdated", "Gerade aktualisiert ✓")
                  : mins < 60 ? `↻ ${mins} min`
                  : `↻ ${lastUpdated.toLocaleTimeString(i18n?.lang === "en" ? "en-GB" : i18n?.lang === "pt" ? "pt-PT" : "de-DE", { hour: "2-digit", minute: "2-digit" })}`;
                return (
                  <div style={{ textAlign: "right", marginBottom: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: mins > 60 ? (dm ? "#FBBF24" : "#92400E") : (dm ? "rgba(255,255,255,0.3)" : t.text3) }}>{label}</span>
                  </div>
                );
              })()}

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
                  fontFamily: "'Plus Jakarta Sans', sans-serif", color: "white", border: "none",
                  background: recommendation.action === "book_lesson" ? "linear-gradient(135deg, #F59E0B, #F97316)"
                    : recommendation.action === "surf_solo" ? "linear-gradient(135deg, #10B981, #06B6D4)"
                    : recommendation.action === "no_surf" ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                    : "linear-gradient(135deg, #0EA5E9, #38BDF8)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                  animation: "pulseGlow 3s ease-in-out infinite",
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

        {/* ══════ v7.7.2: STREAK WIDGET (Duolingo-style) ══════ */}
        <div style={{ background: t.card, borderRadius: 16, padding: "16px 18px", marginBottom: 12, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28, animation: data.streak > 0 ? "flicker 3s ease-in-out infinite" : "none" }}>🔥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1 }}>{data.streak}</div>
              <div style={{ fontSize: 12, color: t.text2, fontWeight: 500 }}>{_("home.streakDays", "Tage am Stück")}</div>
            </div>
            {data.canFreezeStreak && data.streak >= 3 && (
              <button onClick={() => setShowFreezeConfirm(true)} style={{ background: dm ? "rgba(255,255,255,0.06)" : "#F1F5F9", border: `1px solid ${t.cardBorder}`, borderRadius: 10, padding: "6px 10px", fontSize: 10, fontWeight: 600, color: t.text3, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>🧊 Freeze</button>
            )}
          </div>
          {/* Week dots */}
          <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day, i) => {
              const now = new Date();
              const dayOfWeek = (now.getDay() + 6) % 7;
              const dateForDot = new Date(now);
              dateForDot.setDate(now.getDate() - dayOfWeek + i);
              const dateStr = dateForDot.toISOString().slice(0, 10);
              const active = (data.surfDays || []).includes(dateStr);
              const isToday = i === dayOfWeek;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: isToday ? t.accent : t.text3, fontWeight: isToday ? 700 : 400 }}>{day}</div>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: active ? (dm ? "rgba(251,191,36,0.2)" : "rgba(245,158,11,0.15)") : (dm ? "rgba(255,255,255,0.04)" : "#F1F5F9"),
                    border: isToday ? `2px solid ${t.accent}` : `1px solid ${active ? (dm ? "rgba(251,191,36,0.3)" : "rgba(245,158,11,0.25)") : "transparent"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <span style={{ fontSize: 12 }}>🔥</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Surf today toggle */}
          <button onClick={() => { data.toggleSurfDay(); if (!surfedToday && showXpToast) showXpToast(15); }} className="btn-tap" style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginTop: 12, borderRadius: 12, cursor: "pointer", textAlign: "left",
            background: surfedToday ? (dm ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)") : (dm ? "rgba(255,255,255,0.04)" : "#F8FAFC"),
            border: `1px solid ${surfedToday ? (dm ? "rgba(52,211,153,0.2)" : "rgba(16,185,129,0.15)") : t.cardBorder}`,
          }}>
            <span style={{ fontSize: 18 }}>{surfedToday ? "🏄‍♂️" : "🏖️"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: surfedToday ? (dm ? "#34D399" : "#065F46") : t.text }}>{surfedToday ? _("home.surfedToday") : _("home.surfedTodayQ")}</div>
            </div>
            {surfedToday && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: dm ? "#34D399" : "#10B981", fontWeight: 700 }}>+15 XP</span>}
          </button>
        </div>

        {/* v7.7.2: Level Progress */}
        {data.gamification?.currentLevel && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: t.accent }}>Lv.{data.gamification.currentLevel.level}</span>
            <span style={{ fontSize: 11, color: t.text2, fontWeight: 600 }}>{data.gamification.currentLevel.title}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: dm ? "rgba(255,255,255,0.06)" : "#F1F5F9", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, background: t.accent, width: `${Math.min(100, ((data.gamification.totalXP % 100) / 100) * 100)}%`, transition: "width 0.8s ease", animation: "fillBar 0.8s ease" }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.text3 }}>{data.gamification.totalXP} XP</span>
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
            background: "linear-gradient(135deg, #0C4A6E, #0369A1)", borderRadius: 16,
            padding: "14px 16px", marginBottom: 12, cursor: "pointer", textAlign: "left",
            color: "white", border: "none", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 50, opacity: 0.08 }}>📚</div>
            <img src="https://images.pexels.com/photos/1654489/pexels-photo-1654489.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=1" alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, pointerEvents: "none" }} />
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700 }}>{_("home.continueSurf", "Weiter surfen")}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.7 }}>{data.done}/{data.total} · {progressPct}%</div>
            </div>
            <span style={{ fontSize: 14, opacity: 0.7 }}>→</span>
          </button>
        )}

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
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 600, color: t.text2 }}>{card.label}</div>
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
        {/* v7.5.1: Surf hero image */}
        <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 20, position: "relative" }}>
          <img src="https://images.pexels.com/photos/390051/pexels-photo-390051.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1" alt="" loading="lazy" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 18, right: 18 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 4 }}>{_("home.heroTitle", "Lerne Surfen.")}</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", maxWidth: 340, lineHeight: 1.5 }}>{_("home.heroDesc", "Erstelle dein persönliches Surf-Programm oder plane deinen nächsten Trip.")}</p>
          </div>
        </div>
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
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 900,
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
            }} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "white", border: "none",
              background: recommendation.action === "book_lesson" ? "linear-gradient(135deg, #FF9800, #FF7043)" : "linear-gradient(135deg, #0EA5E9, #38BDF8)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}>
              {_(recommendation.cta.text)} →
            </button>
          )}
        </div>
      )}

      <button onClick={() => navigate("builder")} style={{ display: "block", width: "100%", margin: "0 auto 20px", background: "linear-gradient(135deg, #0EA5E9, #38BDF8)", color: "white", border: "none", borderRadius: 50, padding: "16px", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: "0 8px 30px rgba(14,165,233,0.3)" }}>{_("home.createProgram", "Programm erstellen")} 🤙</button>

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
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: t.text, marginBottom: 3 }}>{card.title}</div>
            <div style={{ fontSize: 11, color: t.text3, lineHeight: 1.3 }}>{card.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
