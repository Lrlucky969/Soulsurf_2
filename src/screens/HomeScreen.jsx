// SoulSurf – HomeScreen 2.0 (Onboarding + Dashboard) – v6.2 Notifications
import React, { useState, useEffect, useMemo } from "react";
import { SURF_SPOTS, GOALS } from "../data.js";

const ONBOARDING_KEY = "soulsurf_onboarded";

export default function HomeScreen({ data, t, dm, i18n, navigate, spotObj, savedGoal, notifications }) { // ← v6.2: Added notifications prop
  const _ = i18n?.t || ((k, f) => f || k);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [onboarded, setOnboarded] = useState(true);
  const [obStep, setObStep] = useState(0);
  const [obRoute, setObRoute] = useState(null);
  
  // v6.1: Streak Freeze UI state
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);
  
  // v6.2: Notification Settings UI state
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

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

  // Tooltip system
  const [seenTooltips, setSeenTooltips] = useState(() => {
    try { return JSON.parse(localStorage.getItem("soulsurf_tooltips") || "{}"); } catch { return {}; }
  });

  const dismissTooltip = (id) => {
    const next = { ...seenTooltips, [id]: true };
    setSeenTooltips(next);
    try { localStorage.setItem("soulsurf_tooltips", JSON.stringify(next)); } catch {}
  };

  // Milestone nudge (v6.1: Enhanced with new streak milestones)
  const milestone = useMemo(() => {
    if (data.done === 1) return { emoji: "🎉", text: _("home.ms.first") };
    if (data.done === 10) return { emoji: "📗", text: _("home.ms.10") };
    if (data.done === 25) return { emoji: "📘", text: _("home.ms.25") };
    
    // v6.1: New Streak Milestones
    if (data.streak === 2) return { emoji: "🔥", text: "Hot Start! 2 Tage Streak!" };
    if (data.streak === 5) return { emoji: "💪", text: "Committed! 5 Tage am Stück!" };
    if (data.streak === 7) return { emoji: "⚡", text: "On Fire! 1 Woche non-stop!" };
    if (data.streak === 14) return { emoji: "🌊", text: "Unstoppable! 2 Wochen Streak!" };
    if (data.streak === 30) return { emoji: "🏆", text: "Legend! 30 Tage Streak!" };
    
    // Old milestones (kept for backward compat)
    if (data.streak === 3) return { emoji: "🔥", text: _("home.ms.streak3") };
    
    if (data.diaryCount === 1) return { emoji: "✏️", text: _("home.ms.diary1") };
    if (progressPct >= 50 && progressPct < 55) return { emoji: "🏅", text: _("home.ms.half") };
    if (progressPct === 100) return { emoji: "🏆", text: _("home.ms.complete") };
    return null;
  }, [data.done, data.streak, data.diaryCount, progressPct, _]);

  // v6.1: Streak Freeze Handler
  const handleFreezeStreak = () => {
    if (data.freezeStreak && data.freezeStreak()) {
      setShowFreezeConfirm(false);
    }
  };

  // === ONBOARDING FLOW ===
  if (!onboarded && !data.hasSaved) {
    const features = [
      { emoji: "📚", title: _("home.feat1"), desc: _("home.feat1d") },
      { emoji: "🌊", title: _("home.feat2"), desc: _("home.feat2d") },
      { emoji: "🎮", title: _("home.feat3"), desc: _("home.feat3d") },
      { emoji: "☁️", title: _("home.feat4"), desc: _("home.feat4d") },
    ];
    return (
      <div style={{ paddingTop: 20, textAlign: "center" }}>
        {obStep === 0 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <img src="/icon-192.png" alt="SoulSurf" style={{ width: 88, height: 88, borderRadius: 22, marginBottom: 16, animation: "float 4s ease-in-out infinite", boxShadow: "0 12px 40px rgba(0,150,136,0.2)" }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 900, color: t.text, lineHeight: 1.1, marginBottom: 8 }}>{_("home.welcome")}<br /><span style={{ color: t.accent }}>SoulSurf</span></h1>
            <p style={{ fontSize: 15, color: t.text2, maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.6 }}>{_("home.subtitle")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 320, margin: "0 auto 28px" }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "12px 10px", animation: "slideUp 0.3s ease both", animationDelay: `${i * 80}ms` }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{f.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{f.title}</div>
                  <div style={{ fontSize: 9, color: t.text3, marginTop: 2 }}>{f.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setObStep(1)} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "16px 44px", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)" }}>{_("home.getStarted")}</button>
          </div>
        )}
        {obStep === 1 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("home.whatToDo")}</h2>
            <p style={{ fontSize: 14, color: t.text2, marginBottom: 24 }}>{_("home.chooseEntry")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, margin: "0 auto" }}>
              {[
                { icon: "📚", title: _("home.learnSurf"), desc: _("home.learnSurfDesc"), route: "builder", color: "#009688" },
                { icon: "🌊", title: _("home.checkForecast"), desc: _("home.checkForecastDesc"), route: "forecast", color: "#0288D1" },
                { icon: "✈️", title: _("home.planTrip"), desc: _("home.planTripDesc"), route: "trip", color: "#5C6BC0" },
                { icon: "🏄", title: _("home.findBoard"), desc: _("home.findBoardDesc"), route: "equipment", color: "#FF7043" },
              ].map((opt, i) => (
                <button key={i} onClick={() => { setObStep(2); setObRoute(opt.route); }} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16,
                  background: t.card, border: `2px solid ${t.cardBorder}`, cursor: "pointer", textAlign: "left",
                  animation: "slideUp 0.3s ease both", animationDelay: `${i * 70}ms`,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${opt.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: t.text }}>{opt.title}</div>
                    <div style={{ fontSize: 11, color: t.text2, marginTop: 1 }}>{opt.desc}</div>
                  </div>
                  <span style={{ fontSize: 14, color: t.text3 }}>→</span>
                </button>
              ))}
            </div>
            <button onClick={() => setObStep(0)} style={{ marginTop: 16, background: "none", border: "none", color: t.text3, fontSize: 12, cursor: "pointer" }}>{_("home.back")}</button>
          </div>
        )}
        {obStep === 2 && (
          <div style={{ animation: "screenIn 0.4s ease both" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✨</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("home.ready")}</h2>
            <p style={{ fontSize: 14, color: t.text2, maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.6 }}>{_("home.readyDesc")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "0 auto" }}>
              <button onClick={() => finishOnboarding(obRoute || "builder")} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 16, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 6px 20px rgba(0,150,136,0.3)" }}>
                {_("home.startNow")}
              </button>
              <button onClick={() => finishOnboarding(null)} style={{ background: t.card, color: t.text, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {_("home.exploreFree")}
              </button>
            </div>
            <button onClick={() => setObStep(1)} style={{ marginTop: 16, background: "none", border: "none", color: t.text3, fontSize: 12, cursor: "pointer" }}>{_("home.back")}</button>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {[0, 1, 2].map(s => <div key={s} style={{ width: s === obStep ? 24 : 8, height: 8, borderRadius: 4, background: s <= obStep ? t.accent : (dm ? "#2d3f50" : "#E0E0E0"), transition: "all 0.3s ease", cursor: s < obStep ? "pointer" : "default" }} onClick={() => { if (s < obStep) setObStep(s); }} />)}
        </div>
      </div>
    );
  }

  // === DASHBOARD (returning users with program) ===
  if (data.hasSaved && spotObj) {
    const today = new Date().toISOString().slice(0, 10);
    const surfedToday = (data.surfDays || []).includes(today);
    const hour = new Date().getHours();
    const timeGreeting = hour < 10 ? _("home.morning") : hour < 14 ? _("home.midday") : hour < 18 ? _("home.afternoon") : _("home.evening");
    const dateLang = i18n?.lang === "pt" ? "pt-BR" : i18n?.lang === "en" ? "en-US" : "de-DE";

    // v6.1: Streak Milestone data
    const streakMilestones = data.streakMilestones || { achieved: [], current: null, next: null, progress: 0 };

    return (
      <div style={{ paddingTop: 20 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString(dateLang, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginTop: 4 }}>
            {data.streak > 2 ? _("home.onFire") : progressPct >= 80 ? _("home.almostDone") : progressPct >= 50 ? _("home.keepGoing") : timeGreeting}
          </h2>
        </div>

        {/* v6.2: Notification Settings Card (NEW!) */}
        {notifications && notifications.isSupported && (
          <div style={{
            background: notifications.isGranted
              ? (dm ? "rgba(77,182,172,0.08)" : "#E0F2F1")
              : (dm ? "rgba(255,183,77,0.08)" : "#FFF8E1"),
            border: `1px solid ${notifications.isGranted ? (dm ? "rgba(77,182,172,0.15)" : "#B2DFDB") : (dm ? "rgba(255,183,77,0.15)" : "#FFE0B2")}`,
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 12,
            cursor: "pointer",
          }}
          onClick={() => setShowNotificationSettings(!showNotificationSettings)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🔔</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
                  {notifications.isGranted ? "Benachrichtigungen aktiv" : "Benachrichtigungen aktivieren"}
                </div>
                <div style={{ fontSize: 11, color: t.text2, marginTop: 2 }}>
                  {notifications.isGranted
                    ? "Täglich um 22 Uhr • Forecast-Alerts"
                    : "Verpasse nie wieder deinen Streak"}
                </div>
              </div>
              <span style={{ fontSize: 14, color: t.text3 }}>
                {showNotificationSettings ? "▼" : "▶"}
              </span>
            </div>

            {/* Expanded Notification Settings */}
            {showNotificationSettings && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: `1px dashed ${dm ? "#2d3f50" : "#CFD8DC"}`,
                  animation: "slideUp 0.3s ease both",
                }}
              >
                {!notifications.isGranted ? (
                  <>
                    <p style={{ fontSize: 12, color: t.text2, marginBottom: 12, lineHeight: 1.5 }}>
                      Aktiviere Benachrichtigungen und erhalte:
                    </p>
                    <ul style={{ fontSize: 12, color: t.text2, marginBottom: 12, paddingLeft: 20, lineHeight: 1.6 }}>
                      <li>🔥 Tägliche Streak-Erinnerung (22 Uhr)</li>
                      <li>🌊 Forecast-Alerts bei guten Bedingungen</li>
                      <li>🏆 Milestone-Benachrichtigungen</li>
                      <li>✅ Buchungsbestätigungen</li>
                    </ul>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await notifications.requestPermission();
                        setShowNotificationSettings(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "linear-gradient(135deg, #009688, #4DB6AC)",
                        color: "white",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Jetzt aktivieren
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: t.text3, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Aktive Benachrichtigungen
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                      {[
                        { emoji: "🔥", label: "Streak-Reminder", desc: "Täglich um 22 Uhr" },
                        { emoji: "🌊", label: "Forecast-Alerts", desc: "Bei guten Bedingungen" },
                        { emoji: "🏆", label: "Milestones", desc: "Wenn du ein Ziel erreichst" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            background: dm ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            borderRadius: 10,
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{item.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{item.label}</div>
                            <div style={{ fontSize: 10, color: t.text3 }}>{item.desc}</div>
                          </div>
                          <span style={{ fontSize: 16, color: "#4CAF50" }}>✓</span>
                        </div>
                      ))}
                    </div>

                    {/* Notification History */}
                    {notifications.history && notifications.history.length > 0 && (
                      <>
                        <div style={{ fontSize: 11, color: t.text3, marginBottom: 8, marginTop: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Letzte Benachrichtigungen
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {notifications.history.slice(0, 3).map((notif, i) => (
                            <div
                              key={i}
                              style={{
                                padding: "8px 10px",
                                background: dm ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                borderRadius: 8,
                                fontSize: 11,
                              }}
                            >
                              <div style={{ fontWeight: 600, color: t.text, marginBottom: 2 }}>
                                {notif.title}
                              </div>
                              <div style={{ color: t.text3, fontSize: 10 }}>
                                {new Date(notif.timestamp).toLocaleString(dateLang, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Disable Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Benachrichtigungen wirklich deaktivieren? Du kannst sie jederzeit wieder aktivieren.")) {
                          if (notifications.clearScheduledNotifications) {
                            notifications.clearScheduledNotifications();
                          }
                          alert("Benachrichtigungen deaktiviert. Du kannst sie in den Browser-Einstellungen wieder aktivieren.");
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        marginTop: 12,
                        background: "transparent",
                        color: "#E53935",
                        border: `1px solid ${dm ? "rgba(229,57,53,0.2)" : "#FFCDD2"}`,
                        borderRadius: 10,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Benachrichtigungen deaktivieren
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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

        {/* v6.1: Streak Milestone Card */}
        {data.streak >= 2 && streakMilestones.current && (
          <div style={{ 
            background: "linear-gradient(135deg, #FFB74D, #FF7043)", 
            borderRadius: 16, 
            padding: "16px 18px", 
            marginBottom: 12, 
            color: "white",
            position: "relative",
            overflow: "hidden",
            animation: "slideUp 0.4s ease both"
          }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 60, opacity: 0.15 }}>🔥</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", opacity: 0.9 }}>Streak Milestone</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, marginTop: 2 }}>
                  {streakMilestones.current.badge} {streakMilestones.current.title}
                </div>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{streakMilestones.current.desc}</div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 900 }}>{data.streak}</div>
            </div>
            {streakMilestones.next && (
              <>
                <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ background: "white", height: "100%", borderRadius: 6, width: `${Math.round(streakMilestones.progress * 100)}%`, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 10, opacity: 0.9, textAlign: "right" }}>
                  Nächster: {streakMilestones.next.badge} {streakMilestones.next.title} ({streakMilestones.next.day - data.streak} Tage)
                </div>
              </>
            )}
            {data.canFreezeStreak && data.streak >= 3 && (
              <button 
                onClick={() => setShowFreezeConfirm(true)} 
                style={{ 
                  marginTop: 10, 
                  width: "100%", 
                  background: "rgba(255,255,255,0.2)", 
                  border: "1px solid rgba(255,255,255,0.4)", 
                  borderRadius: 10, 
                  padding: "10px", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  color: "white", 
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                🧊 Streak Freeze verfügbar (1x pro Monat)
              </button>
            )}
          </div>
        )}

        {showFreezeConfirm && (
          <div style={{ background: dm ? "rgba(92,107,192,0.1)" : "#E8EAF6", border: `1px solid ${dm ? "rgba(92,107,192,0.2)" : "#C5CAE9"}`, borderRadius: 14, padding: "16px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧊</div>
            <p style={{ fontSize: 14, color: t.text, marginBottom: 4, fontWeight: 700 }}>Streak Freeze aktivieren?</p>
            <p style={{ fontSize: 12, color: t.text2, marginBottom: 12, lineHeight: 1.5 }}>
              Dein Streak bleibt 1 Tag erhalten, auch wenn du nicht surfst. Du kannst dies 1x pro Monat nutzen.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={handleFreezeStreak} style={{ background: "#7986CB", color: "white", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Aktivieren</button>
              <button onClick={() => setShowFreezeConfirm(false)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
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

        {!seenTooltips["dashboard-intro"] && (
          <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 12, animation: "slideUp 0.3s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.accent, marginBottom: 4 }}>{_("tip.dashboardTitle")}</div>
                <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.5 }}>{_("tip.dashboard")}</div>
              </div>
              <button onClick={() => dismissTooltip("dashboard-intro")} style={{ background: "none", border: "none", color: t.text3, fontSize: 16, cursor: "pointer", padding: 4, marginLeft: 8, flexShrink: 0 }}>✕</button>
            </div>
          </div>
        )}

        {data.gamification && (
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{data.gamification.currentLevel.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{data.gamification.currentLevel.name}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent }}>{data.gamification.totalXP} XP</div>
                </div>
              </div>
              {data.gamification.nextLevel && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: t.text3 }}>{_("home.nextLevel")}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text2 }}>{data.gamification.nextLevel.emoji} {data.gamification.nextLevel.name}</div>
                </div>
              )}
            </div>
            <div style={{ background: dm ? "rgba(255,255,255,0.08)" : "#ECEFF1", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #009688, #4DB6AC, #80CBC4)", width: `${Math.round(data.gamification.levelProgress * 100)}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}

        {data.gamification && (
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{_("home.dailyGoals")}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: data.gamification.dailyDone === 3 ? "#4CAF50" : t.text3 }}>{data.gamification.dailyDone}/3 {data.gamification.dailyDone === 3 ? "✨ +20 Bonus-XP" : ""}</span>
            </div>
            {data.gamification.dailyGoals.map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <span style={{ fontSize: 16, opacity: g.done ? 1 : 0.4 }}>{g.done ? "✅" : g.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, color: g.done ? t.text3 : t.text, textDecoration: g.done ? "line-through" : "none" }}>{g.label}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: g.done ? "#4CAF50" : t.text3 }}>+{g.xp} XP</span>
              </div>
            ))}
          </div>
        )}

        {data.gamification?.weeklyChallenges?.length > 0 && (
          <div style={{ background: dm ? "rgba(92,107,192,0.08)" : "#E8EAF6", border: `1px solid ${dm ? "rgba(92,107,192,0.15)" : "#C5CAE9"}`, borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#7986CB" : "#3949AB", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{_("home.weeklyChallenge")}</div>
            {data.gamification.weeklyChallenges.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                <span style={{ fontSize: 16 }}>{c.completed ? "🏆" : c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.completed ? "#4CAF50" : t.text }}>{c.label}</div>
                  <div style={{ background: dm ? "rgba(255,255,255,0.06)" : "#E0E0E0", borderRadius: 4, height: 4, marginTop: 4 }}>
                    <div style={{ height: "100%", borderRadius: 4, background: c.completed ? "#4CAF50" : "#7986CB", width: `${Math.min(100, (c.current / c.target) * 100)}%`, transition: "width 0.3s" }} />
                  </div>
                </div>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: c.completed ? "#4CAF50" : t.text3, fontWeight: 600 }}>{c.current}/{c.target}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
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

        <button onClick={data.toggleSurfDay} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", marginBottom: 12, borderRadius: 14, cursor: "pointer", textAlign: "left",
          background: surfedToday ? (dm ? "rgba(255,183,77,0.12)" : "#FFF8E1") : t.card,
          border: `1px solid ${surfedToday ? "#FFB74D" : t.cardBorder}`,
        }}>
          <span style={{ fontSize: 24 }}>{surfedToday ? "🏄‍♂️" : "🏖️"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: surfedToday ? "#E65100" : t.text }}>{surfedToday ? _("home.surfedToday") : _("home.surfedTodayQ")}</div>
            <div style={{ fontSize: 11, color: t.text2 }}>{surfedToday ? `${_("home.streak")}: ${data.streak} ${data.streak > 1 ? _("general.days") : _("general.day")} 🔥` : _("home.tapToLog")}</div>
          </div>
        </button>

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
