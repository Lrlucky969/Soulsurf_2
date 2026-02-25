// SoulSurf v6.4.1 – App Shell (Sprint 33: Decision Engine)
import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import useSurfData from "./useSurfData.js";
import useAuth from "./useAuth.js";
import useSync from "./useSync.js";
import usePhotoSync from "./usePhotoSync.js";
import useNotifications from "./useNotifications.js";
import { useI18n, LANGUAGES } from "./i18n.js";
import { SURF_SPOTS, GOALS } from "./data.js";
import { WaveBackground, LessonModal } from "./components.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";

// Lazy-loaded screens (code-split chunks)
const HomeScreen = lazy(() => import("./screens/HomeScreen.jsx"));
const BuilderScreen = lazy(() => import("./screens/BuilderScreen.jsx"));
const LessonsScreen = lazy(() => import("./screens/LessonsScreen.jsx"));
const TripScreen = lazy(() => import("./screens/TripScreen.jsx"));
const DiaryScreen = lazy(() => import("./screens/DiaryScreen.jsx"));
const ProgressScreen = lazy(() => import("./screens/ProgressScreen.jsx"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen.jsx"));
const EquipmentScreen = lazy(() => import("./screens/EquipmentScreen.jsx"));
const CommunityScreen = lazy(() => import("./screens/CommunityScreen.jsx"));
const ForecastScreen = lazy(() => import("./screens/ForecastScreen.jsx"));
const SchoolsScreen = lazy(() => import("./screens/SchoolsScreen.jsx"));
const InstructorScreen = lazy(() => import("./screens/InstructorScreen.jsx"));

const THEMES = {
  light: { bg: "#FFFDF7", text: "#263238", text2: "#546E7A", text3: "#90A4AE", accent: "#009688", card: "rgba(255,255,255,0.9)", cardBorder: "rgba(0,0,0,0.06)", inputBg: "#F5F5F5", inputBorder: "#E0E0E0" },
  dark: { bg: "#0d1820", text: "#e8eaed", text2: "#9aa0a6", text3: "#5f6368", accent: "#4DB6AC", card: "rgba(30,45,61,0.8)", cardBorder: "rgba(255,255,255,0.06)", inputBg: "rgba(255,255,255,0.05)", inputBorder: "#2d3f50" },
};

// ═══════════════════════════════════════════════════════
// v6.4.1: NEW 5-TAB NAVIGATION (Strategic Refocus)
// Old screens remain accessible via burger menu
// ═══════════════════════════════════════════════════════
const PRIMARY_TABS = [
  { id: "home", icon: "🏠", key: "nav.home" },
  { id: "lessons", icon: "📚", key: "nav.learn" },
  { id: "forecast", icon: "🗺️", key: "nav.surf" },
  { id: "diary", icon: "📓", key: "nav.log" },
  { id: "profile", icon: "👤", key: "nav.profile" },
];

// Full menu items (accessible via burger menu)
const ALL_NAV_KEYS = [
  { id: "home", icon: "🏠", key: "nav.home" },
  { id: "lessons", icon: "📚", key: "nav.learn" },
  { id: "forecast", icon: "🗺️", key: "nav.surf" },
  { id: "diary", icon: "📓", key: "nav.log" },
  { id: "profile", icon: "👤", key: "nav.profile" },
  // --- Below: accessible via menu only ---
  { id: "schools", icon: "🏫", key: "nav.schools", menuOnly: true },
  { id: "trip", icon: "✈️", key: "nav.trip", menuOnly: true },
  { id: "builder", icon: "✎", key: "nav.builder", menuOnly: true },
  { id: "equipment", icon: "🏄", key: "nav.equipment", menuOnly: true },
  { id: "progress", icon: "📊", key: "nav.progress", menuOnly: true },
  { id: "community", icon: "🤝", key: "nav.community", menuOnly: true },
  { id: "instructor", icon: "👨‍🏫", key: "nav.instructor", instructorOnly: true, menuOnly: true },
];

export default function SurfApp() {
  const i18n = useI18n();
  const auth = useAuth();
  const sync = useSync(auth.user?.id);
  const photoSync = usePhotoSync(auth.user?.id);
  const data = useSurfData(sync);
  const notifications = useNotifications(data);
  
  const [screen, setScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openLesson, setOpenLesson] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [screenKey, setScreenKey] = useState(0);
  const [syncToast, setSyncToast] = useState(null);
  const mainRef = useRef(null);
  const hasAutoSynced = useRef(false);

  const dm = data.darkMode;
  const th = useMemo(() => dm ? THEMES.dark : THEMES.light, [dm]);
  const spotObj = useMemo(() => SURF_SPOTS.find(s => s.id === data.spot), [data.spot]);
  const savedGoal = useMemo(() => data.hasSaved ? GOALS.find(g => g.id === data.goal) : null, [data.hasSaved, data.goal]);
  const remaining = data.total - data.done;

  const isInstructor = useMemo(() => {
    try { return localStorage.getItem("soulsurf_instructor") === "true"; } catch { return false; }
  }, []);

  // v6.4.1: Build nav items from new structure
  const NAV_ITEMS = useMemo(() =>
    ALL_NAV_KEYS.filter(n => !n.instructorOnly || isInstructor).map(n => ({ ...n, label: i18n.t(n.key) })),
  [i18n.lang, isInstructor]);

  const TAB_ITEMS = useMemo(() =>
    PRIMARY_TABS.map(n => ({ ...n, label: i18n.t(n.key) })),
  [i18n.lang]);

  const navigate = useCallback((s) => {
    if (s === screen) { setMenuOpen(false); return; }
    setTransitioning(true);
    setMenuOpen(false);
    setTimeout(() => {
      setScreen(s);
      setScreenKey(k => k + 1);
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 150);
  }, [screen]);

  const renderScreen = () => {
    if ((screen === "lessons" || screen === "diary") && !data.hasSaved) {
      return <EmptyState icon={screen === "lessons" ? "📚" : "📓"} title={screen === "lessons" ? i18n.t("app.noLessons") : i18n.t("app.noDiary")} desc={i18n.t("app.emptyDesc")} cta={i18n.t("app.createProgram")} onCta={() => navigate("builder")} t={th} dm={dm} i18n={i18n} />;
    }
    if (screen === "progress" && !data.hasSaved) {
      return <EmptyState icon="📊" title={i18n.t("app.noProgress")} desc={i18n.t("app.emptyProgDesc")} cta={i18n.t("app.createProgram")} onCta={() => navigate("builder")} t={th} dm={dm} i18n={i18n} />;
    }
    switch (screen) {
      case "home": return <HomeScreen data={data} t={th} dm={dm} i18n={i18n} navigate={navigate} spotObj={spotObj} savedGoal={savedGoal} notifications={notifications} />;
      case "builder": return <BuilderScreen data={data} t={th} dm={dm} i18n={i18n} navigate={navigate} />;
      case "lessons": return <LessonsScreen data={data} t={th} dm={dm} i18n={i18n} spotObj={spotObj} setOpenLesson={setOpenLesson} navigate={navigate} />;
      case "trip": return <TripScreen data={data} t={th} dm={dm} i18n={i18n} spotObj={spotObj} navigate={navigate} />;
      case "diary": return <DiaryScreen data={data} t={th} dm={dm} i18n={i18n} setOpenLesson={setOpenLesson} photoSync={photoSync} />;
      case "progress": return <ProgressScreen data={data} t={th} dm={dm} i18n={i18n} setOpenLesson={setOpenLesson} />;
      case "profile": return <ProfileScreen data={data} auth={auth} t={th} dm={dm} i18n={i18n} navigate={navigate} notifications={notifications} />;
      case "equipment": return <EquipmentScreen data={data} t={th} dm={dm} i18n={i18n} />;
      case "community": return <CommunityScreen data={data} auth={auth} t={th} dm={dm} i18n={i18n} navigate={navigate} />;
      case "forecast": return <ForecastScreen data={data} t={th} dm={dm} i18n={i18n} />;
      case "schools": return <SchoolsScreen data={data} t={th} dm={dm} i18n={i18n} navigate={navigate} />;
      case "instructor": return <InstructorScreen data={data} auth={auth} t={th} dm={dm} i18n={i18n} navigate={navigate} />;
      default: return null;
    }
  };

  useEffect(() => {
    try {
      if (!document.querySelector('link[data-soulsurf-fonts]')) {
        const link = document.createElement("link"); link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap";
        link.setAttribute("data-soulsurf-fonts", "1"); document.head.appendChild(link);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!auth.isLoggedIn || !sync.isEnabled || hasAutoSynced.current || !data.hydrated) return;
    hasAutoSynced.current = true;
    (async () => {
      const cloud = await sync.downloadAll();
      if (!cloud) return;
      if (!data.hasSaved && cloud.program) {
        data.restoreFromCloud(cloud);
        setSyncToast("☁️ Daten aus der Cloud geladen!");
        setTimeout(() => setSyncToast(null), 3000);
      } else if (data.hasSaved && !cloud.program) {
        sync.forceUpload(data.getProgramSnapshot(), data.getTripsSnapshot());
        setSyncToast("☁️ Lokale Daten in die Cloud gesichert!");
        setTimeout(() => setSyncToast(null), 3000);
      }
    })();
  }, [auth.isLoggedIn, sync.isEnabled, data.hydrated]);

  const screenLabel = NAV_ITEMS.find(n => n.id === screen);

  return (
    <div style={{ background: th.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: th.text, transition: "background 0.3s ease" }}>
      <WaveBackground dm={dm} />
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes wave { 0% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-15deg); } 100% { transform: rotate(0deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes screenIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes menuSlideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,150,136,0.3); border-radius: 10px; }
        input[type=range] { accent-color: #009688; }
      `}</style>

      {/* v6.2: Notification Permission Banner */}
      {notifications.showBanner && notifications.isSupported && (
        <div style={{
          position: "fixed",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 110,
          maxWidth: 360,
          width: "calc(100% - 40px)",
          background: dm ? "#1a2332" : "white",
          border: `2px solid ${th.accent}`,
          borderRadius: 16,
          padding: "16px 18px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          animation: "slideDown 0.4s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: th.text, marginBottom: 4 }}>
                Verpasse nie wieder deinen Streak!
              </div>
              <div style={{ fontSize: 13, color: th.text2, lineHeight: 1.5 }}>
                Erhalte tägliche Erinnerungen und Forecast-Alerts.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={notifications.requestPermission}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #009688, #4DB6AC)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "12px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Aktivieren
            </button>
            <button
              onClick={notifications.dismissBanner}
              style={{
                background: th.inputBg,
                color: th.text2,
                border: `1px solid ${th.inputBorder}`,
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Später
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: dm ? "rgba(13,24,32,0.95)" : "rgba(255,253,247,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${th.cardBorder}`, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4, color: th.text, transition: "transform 0.2s ease", transform: menuOpen ? "rotate(90deg)" : "none" }}>{menuOpen ? "✕" : "☰"}</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("home")}>
            <img src="/icon-192.png" alt="SoulSurf" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: th.text, display: "block", lineHeight: 1 }}>SoulSurf</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: th.text3 }}>v6.4.1</span>
            </div>
          </div>
          {screen !== "home" && screen !== "builder" && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: th.accent, background: dm ? "rgba(77,182,172,0.12)" : "#E0F2F1", padding: "3px 10px", borderRadius: 8, marginLeft: 4 }}>{screenLabel?.icon} {screenLabel?.label}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {data.gamification?.currentLevel && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: th.accent }}>{data.gamification.currentLevel.emoji} {data.gamification.totalXP}</span>}
          {data.streak > 0 && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#FFB74D" }}>🔥 {data.streak}</span>}
          {notifications.isGranted && (
            <button
              onClick={() => navigate("home")}
              style={{
                background: "none",
                border: "none",
                fontSize: 18,
                cursor: "pointer",
                padding: 4,
                color: th.text2,
                position: "relative",
              }}
            >
              🔔
              {notifications.history.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#FF7043",
                }} />
              )}
            </button>
          )}
          {auth.isLoggedIn ? (
            <button onClick={() => setMenuOpen(true)} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 12, fontWeight: 700, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {auth.displayName?.charAt(0).toUpperCase() || "U"}
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ background: dm ? "rgba(77,182,172,0.12)" : "#E0F2F1", border: `1px solid ${th.accent}`, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: th.accent, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>Login</button>
          )}
          <button onClick={data.toggleDark} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: 4, transition: "transform 0.3s ease" }} onMouseEnter={e => e.currentTarget.style.transform = "rotate(30deg)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>{dm ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* Slide-out Menu (v6.4.1: Scrollable + Fixed Footer) */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.4)", animation: "overlayIn 0.2s ease" }}>
          <nav onClick={e => e.stopPropagation()} style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            bottom: 0, 
            width: 280, 
            background: dm ? "#1a2332" : "#FFFDF7", 
            borderRight: `1px solid ${th.cardBorder}`, 
            paddingTop: 70, 
            boxShadow: "4px 0 24px rgba(0,0,0,0.15)", 
            animation: "menuSlideIn 0.25s ease",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Scrollable Content (Top) */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              {/* Program Progress Card */}
              {data.hasSaved && spotObj && (
                <div style={{ padding: "0 20px 16px", borderBottom: `1px solid ${th.cardBorder}`, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: th.text3, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>{i18n.t("lessons.yourProgram")}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>{data.days} {i18n.t("general.days")} · {savedGoal?.emoji} {savedGoal?.name}</div>
                  <div style={{ fontSize: 12, color: th.accent }}>{spotObj?.emoji} {spotObj?.name}</div>
                  <div style={{ background: dm ? "rgba(255,255,255,0.1)" : "#E0E0E0", borderRadius: 6, height: 4, marginTop: 8, overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(90deg, #FFB74D, #FF7043)", height: "100%", borderRadius: 6, width: `${data.total > 0 ? (data.done / data.total) * 100 : 0}%`, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: th.text3, marginTop: 4 }}>{data.done}/{data.total} {i18n.t("g.done")}</div>
                </div>
              )}

              {/* Navigation Items */}
              {NAV_ITEMS.map((item, i) => {
                const isActive = screen === item.id;
                const needsProgram = ["lessons", "diary"].includes(item.id);
                const disabled = needsProgram && !data.hasSaved;
                const isFirstMenuOnly = item.menuOnly && (i === 0 || !NAV_ITEMS[i - 1]?.menuOnly);
                return (
                  <React.Fragment key={item.id}>
                    {isFirstMenuOnly && (
                      <div style={{ padding: "8px 24px 4px", borderTop: `1px solid ${th.cardBorder}`, marginTop: 4 }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: th.text3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{i18n.t("nav.more")}</span>
                      </div>
                    )}
                    <button onClick={() => !disabled && navigate(item.id)} style={{
                      display: "flex", alignItems: "center", gap: 12, width: "100%", padding: item.menuOnly ? "11px 24px" : "14px 24px",
                      background: isActive ? (dm ? "rgba(77,182,172,0.12)" : "#E0F2F1") : "transparent",
                      border: "none", borderLeft: isActive ? "3px solid #009688" : "3px solid transparent",
                      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : item.menuOnly ? 0.8 : 1,
                      fontSize: item.menuOnly ? 14 : 15, fontWeight: isActive ? 700 : 500, color: isActive ? th.accent : th.text,
                      fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                      animation: `slideUp 0.3s ease both`, animationDelay: `${i * 40}ms`,
                    }}>
                      <span style={{ fontSize: item.menuOnly ? 16 : 18 }}>{item.icon}</span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {disabled && <span style={{ fontSize: 9, color: th.text3 }}>🔒</span>}
                      {item.id === "lessons" && remaining > 0 && !disabled && (
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: th.accent, background: dm ? "rgba(77,182,172,0.15)" : "#E0F2F1", padding: "2px 8px", borderRadius: 10 }}>{remaining}</span>
                      )}
                      {item.id === "diary" && data.diaryCount > 0 && !disabled && (
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: th.text3 }}>{data.diaryCount}</span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Fixed Footer (Bottom) */}
            <div style={{ 
              borderTop: `1px solid ${th.cardBorder}`, 
              padding: "16px 24px",
              background: dm ? "#1a2332" : "#FFFDF7",
            }}>
              {/* Language Switcher - ALWAYS VISIBLE */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: th.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  🌐 {i18n.t("nav.home") === "Home" ? "Language" : i18n.t("nav.home") === "Início" ? "Idioma" : "Sprache"}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => i18n.setLang(l.code)} style={{
                      flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: i18n.lang === l.code ? 700 : 500, cursor: "pointer",
                      background: i18n.lang === l.code ? th.accent : th.inputBg,
                      color: i18n.lang === l.code ? "white" : th.text2,
                      border: `1px solid ${i18n.lang === l.code ? th.accent : th.inputBorder}`,
                    }}>{l.short}</button>
                  ))}
                </div>
              </div>

              {/* Auth section */}
              {auth.isLoggedIn && (
                <div style={{ marginBottom: 12, padding: "10px 12px", background: dm ? "rgba(77,182,172,0.08)" : "#E0F2F1", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #009688, #4DB6AC)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700 }}>{auth.displayName?.charAt(0).toUpperCase() || "U"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: th.text }}>{auth.displayName}</div>
                    <div style={{ fontSize: 10, color: sync.syncStatus === "syncing" ? "#FFB74D" : sync.syncStatus === "error" ? "#E53935" : "#4DB6AC" }}>
                      {sync.syncStatus === "syncing" ? i18n.t("app.syncing") : sync.syncStatus === "error" ? i18n.t("app.syncError") : i18n.t("app.syncActive")}
                    </div>
                  </div>
                </div>
              )}
              {!auth.isLoggedIn && (
                <button onClick={() => { setShowAuth(true); setMenuOpen(false); }} style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #009688, #4DB6AC)", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "white", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>🔐 {i18n.t("auth.login")}</button>
              )}
              <button onClick={() => { data.exportData(); setMenuOpen(false); }} style={{ width: "100%", padding: "10px", background: th.inputBg, border: `1px solid ${th.inputBorder}`, borderRadius: 10, fontSize: 12, cursor: "pointer", color: th.text2, fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>💾 Backup</button>
              {auth.isLoggedIn && (
                <button onClick={() => { auth.logout(); setMenuOpen(false); }} style={{ width: "100%", padding: "10px", background: dm ? "rgba(229,57,53,0.08)" : "#FFEBEE", border: `1px solid ${dm ? "rgba(229,57,53,0.2)" : "#FFCDD2"}`, borderRadius: 10, fontSize: 12, cursor: "pointer", color: "#E53935", fontFamily: "'Space Mono', monospace" }}>🚪 {i18n.t("auth.logout")}</button>
              )}
            </div>

            {/* Version Badge */}
            <div style={{ padding: "12px 0", textAlign: "center", background: dm ? "#1a2332" : "#FFFDF7", borderTop: `1px solid ${th.cardBorder}` }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: th.text3 }}>v6.4.1 · ride the vibe ☮</span>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main ref={mainRef} style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 100px", position: "relative" }}>
        <Suspense fallback={<ScreenSkeleton t={th} dm={dm} i18n={i18n} />}>
          <div key={screenKey} style={{ animation: transitioning ? "none" : "screenIn 0.3s ease both", opacity: transitioning ? 0 : undefined }}>
            {renderScreen()}
          </div>
        </Suspense>
      </main>

      {/* Bottom Tab Bar (v6.4.1: 5 tabs) */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 80, background: dm ? "rgba(13,24,32,0.97)" : "rgba(255,253,247,0.97)", backdropFilter: "blur(12px)", borderTop: `1px solid ${th.cardBorder}`, display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 6px)" }}>
        {TAB_ITEMS.map(item => {
          const isActive = screen === item.id || (item.id === "lessons" && screen === "builder") || (item.id === "profile" && ["progress", "equipment", "community", "instructor"].includes(screen));
          const showBadge = item.id === "lessons" && remaining > 0 && data.hasSaved;
          return (
            <button key={item.id} onClick={() => navigate(item.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative",
              background: "none", border: "none", cursor: "pointer", padding: "4px 12px",
              color: isActive ? th.accent : th.text3, fontSize: 10, fontWeight: isActive ? 700 : 500,
              fontFamily: "'Space Mono', monospace", transition: "color 0.2s ease",
            }}>
              <span style={{ fontSize: 20, transition: "transform 0.2s ease", transform: isActive ? "scale(1.2) translateY(-2px)" : "scale(1)" }}>{item.icon}</span>
              <span>{item.label}</span>
              {showBadge && (
                <span style={{ position: "absolute", top: 0, right: 4, background: "#FF7043", color: "white", fontSize: 8, fontWeight: 700, borderRadius: 8, padding: "1px 5px", minWidth: 16, textAlign: "center" }}>{remaining}</span>
              )}
              {isActive && <div style={{ position: "absolute", bottom: -6, width: 20, height: 3, borderRadius: 2, background: th.accent }} />}
            </button>
          );
        })}
      </div>

      {openLesson && <LessonModal lesson={openLesson} onClose={() => setOpenLesson(null)} dm={dm} />}
      {showAuth && <AuthScreen auth={auth} t={th} dm={dm} i18n={i18n} onClose={() => setShowAuth(false)} />}
      {syncToast && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", zIndex: 1200, background: dm ? "#1a2332" : "white", border: `1px solid ${th.accent}`, borderRadius: 14, padding: "10px 20px", fontSize: 13, fontWeight: 600, color: th.accent, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", animation: "slideUp 0.3s ease both" }}>
          {syncToast}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc, cta, onCta, t, dm }) {
  return (
    <div style={{ paddingTop: 80, textAlign: "center", animation: "screenIn 0.4s ease both" }}>
      <div style={{ fontSize: 64, marginBottom: 16, animation: "float 4s ease-in-out infinite" }}>{icon}</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 15, color: t.text2, maxWidth: 320, margin: "0 auto 28px", lineHeight: 1.6 }}>{desc}</p>
      <button onClick={onCta} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "16px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif", boxShadow: "0 8px 30px rgba(0,150,136,0.3)" }}>{cta} →</button>
    </div>
  );
}

function ScreenSkeleton({ t, dm }) {
  const bg = dm ? "rgba(255,255,255,0.05)" : "#F0F0F0";
  return (
    <div style={{ paddingTop: 24, animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ background: bg, borderRadius: 12, height: 32, width: "60%", marginBottom: 8 }} />
      <div style={{ background: bg, borderRadius: 8, height: 16, width: "40%", marginBottom: 24 }} />
      <div style={{ background: bg, borderRadius: 18, height: 140, marginBottom: 16 }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, background: bg, borderRadius: 12, height: 44 }} />
        <div style={{ flex: 1, background: bg, borderRadius: 12, height: 44 }} />
        <div style={{ flex: 1, background: bg, borderRadius: 12, height: 44 }} />
      </div>
      <div style={{ background: bg, borderRadius: 16, height: 80, marginBottom: 12 }} />
      <div style={{ background: bg, borderRadius: 16, height: 80, marginBottom: 12 }} />
    </div>
  );
}
