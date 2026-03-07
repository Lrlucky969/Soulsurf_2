// SoulSurf – UI Components v7.7.1 (Sprint 1: Visual Consistency)
import React from "react";

// ═══════════════════════════════════════════
// SVG ICON SYSTEM (Task 3)
// ═══════════════════════════════════════════
export const UI_ICONS = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  lessons: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  forecast: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  diary: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  profile: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  wave: "M3 15c2.483 0 4.345-3 6-3s3.517 3 6 3 4.345-3 6-3",
  school: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12 12 0 0121 12.017V17l-9 5-9-5v-4.983A12 12 0 015.84 10.578L12 14z",
  board: "M12 3v18m-4-4l4 4 4-4M4 8l8-5 8 5",
  fire: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A8 8 0 0117.657 18.657z",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  trophy: "M5 3h14l-1.405 8.426A5 5 0 0112.63 16H11.37a5 5 0 01-4.965-4.574L5 3zM9 21h6m-3-5v5",
  check: "M5 13l4 4L19 7",
  play: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z",
  link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101",
  close: "M6 18L18 6M6 6l12 12",
};

export const Icon = ({ name, size = 20, color = "currentColor", strokeWidth = 1.5, style }) => {
  const path = UI_ICONS[name];
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={path} />
    </svg>
  );
};

// ═══════════════════════════════════════════
// CARD COMPONENT (Task 1)
// ═══════════════════════════════════════════
const CARD_PADDINGS = { sm: "12px 14px", md: "16px 18px", lg: "20px 22px" };

export const Card = ({ children, t, padding = "md", shadow = true, border = true, onClick, style }) => (
  <div
    onClick={onClick}
    className={onClick ? "card-interactive" : undefined}
    style={{
      background: t?.card || "rgba(255,255,255,0.85)",
      borderRadius: 16,
      padding: CARD_PADDINGS[padding] || padding,
      border: border ? `1px solid ${t?.cardBorder || "rgba(0,0,0,0.04)"}` : "none",
      boxShadow: shadow ? (t?.cardShadow || "0 1px 3px rgba(0,0,0,0.04)") : "none",
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s ease, transform 0.15s ease",
      ...style,
    }}
  >
    {children}
  </div>
);

// ═══════════════════════════════════════════
// VIDEO EMBED
// ═══════════════════════════════════════════
export const VideoEmbed = React.memo(({ url }) => {
  if (!url) return null;
  return (
    <div style={{ margin: "16px 0", borderRadius: 16, overflow: "hidden", background: "#111", position: "relative", paddingBottom: "56.25%", height: 0 }}>
      <iframe src={`${url}?rel=0&modestbranding=1`} title="Tutorial Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
    </div>
  );
});

// ═══════════════════════════════════════════
// WAVE BACKGROUND
// ═══════════════════════════════════════════
export const WaveBackground = React.memo(() => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200, background: "linear-gradient(0deg, rgba(14,165,233,0.06) 0%, transparent 100%)" }} />
    <svg style={{ position: "absolute", bottom: -5, left: 0, width: "200%", height: 80 }} viewBox="0 0 1440 80">
      <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,0 1620,40 L1620,80 L0,80 Z" fill="rgba(14,165,233,0.05)">
        <animateTransform attributeName="transform" type="translate" values="0,0;-720,0" dur="12s" repeatCount="indefinite" />
      </path>
    </svg>
    <svg style={{ position: "absolute", bottom: 10, left: 0, width: "200%", height: 50 }} viewBox="0 0 1440 50">
      <path d="M0,25 C200,50 400,0 600,25 C800,50 1000,0 1200,25 C1400,50 1440,25 1620,25 L1620,50 L0,50 Z" fill="rgba(14,165,233,0.03)">
        <animateTransform attributeName="transform" type="translate" values="-360,0;-1080,0" dur="18s" repeatCount="indefinite" />
      </path>
    </svg>
  </div>
));

// ═══════════════════════════════════════════
// LESSON CARD – Redesigned (Task 2)
// Left-border accent, unified card bg, tags below title
// ═══════════════════════════════════════════
const LESSON_COLORS = {
  practice: { border: "#10B981", tag: "#065F46", tagBg: "rgba(16,185,129,0.1)", tagBgDm: "rgba(52,211,153,0.12)", label: "Praxis" },
  theory:   { border: "#0EA5E9", tag: "#0C4A6E", tagBg: "rgba(14,165,233,0.08)", tagBgDm: "rgba(56,189,248,0.12)", label: "Theorie" },
  warmup:   { border: "#EF4444", tag: "#991B1B", tagBg: "rgba(239,68,68,0.08)", tagBgDm: "rgba(248,113,113,0.12)", label: "Warm-Up" },
  equipment:{ border: "#94A3B8", tag: "#475569", tagBg: "rgba(148,163,184,0.1)", tagBgDm: "rgba(148,163,184,0.12)", label: "Equipment" },
};

export const LessonCard = ({ lesson, index, onOpen, onToggle, done, dm }) => {
  const c = LESSON_COLORS[lesson.type] || LESSON_COLORS.theory;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
      {onToggle && (
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{
          marginTop: 16, width: 28, height: 28, minWidth: 28, borderRadius: 8,
          border: `2px solid ${done ? "#10B981" : (dm ? "#334155" : "#CBD5E1")}`,
          background: done ? (dm ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)") : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease",
        }}>
          {done && <Icon name="check" size={16} color="#10B981" strokeWidth={2.5} />}
        </button>
      )}
      <div onClick={() => onOpen(lesson)} className="card-interactive" style={{
        flex: 1, background: dm ? "rgba(30,41,59,0.6)" : "rgba(255,255,255,0.85)",
        borderRadius: 16, padding: "16px 18px", cursor: "pointer",
        border: `1px solid ${dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
        borderLeft: `4px solid ${c.border}`,
        boxShadow: dm ? "0 1px 3px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
        opacity: done ? 0.5 : 1, transition: "opacity 0.2s ease",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700,
              color: dm ? "#F1F5F9" : "#1A1A2E", margin: 0, lineHeight: 1.3,
              textDecoration: done ? "line-through" : "none",
            }}>{lesson.title}</h3>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: dm ? "#94A3B8" : "#64748B",
              margin: "4px 0 0", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{lesson.content}</p>
            <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: dm ? c.border : c.tag, background: dm ? c.tagBgDm : c.tagBg, padding: "2px 8px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" }}>{c.label}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: dm ? "#64748B" : "#94A3B8", background: dm ? "rgba(255,255,255,0.05)" : "#F1F5F9", padding: "2px 8px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" }}>{lesson.duration}</span>
              {lesson.videoUrl && <span style={{ fontSize: 10, fontWeight: 600, color: dm ? "#F87171" : "#DC2626", background: dm ? "rgba(248,113,113,0.1)" : "rgba(239,68,68,0.06)", padding: "2px 8px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" }}>▶ Video</span>}
              {lesson.articleUrl && <span style={{ fontSize: 10, fontWeight: 600, color: dm ? "#38BDF8" : "#0284C7", background: dm ? "rgba(56,189,248,0.1)" : "rgba(14,165,233,0.06)", padding: "2px 8px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" }}>↗ Artikel</span>}
            </div>
          </div>
          {done && (
            <div style={{ width: 24, height: 24, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <Icon name="check" size={14} color="#10B981" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// LESSON MODAL – Redesigned (Task 2)
// ═══════════════════════════════════════════
export const LessonModal = ({ lesson, onClose, dm }) => {
  if (!lesson) return null;
  const c = LESSON_COLORS[lesson.type] || LESSON_COLORS.theory;
  const textP = dm ? "#F1F5F9" : "#1A1A2E";
  const textS = dm ? "#94A3B8" : "#64748B";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: dm ? "#1E293B" : "#FFFFFF", borderRadius: 20, maxWidth: 620, width: "100%", maxHeight: "85vh", overflow: "auto", padding: "24px 22px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", animation: "scaleIn 0.3s ease", borderLeft: `4px solid ${c.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: dm ? c.border : c.tag, background: dm ? c.tagBgDm : c.tagBg, padding: "3px 10px", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace" }}>{c.label} · {lesson.duration}</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: textP, margin: "10px 0 0", lineHeight: 1.2 }}>{lesson.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: dm ? "rgba(255,255,255,0.08)" : "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: textS, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="close" size={18} color={textS} strokeWidth={2} />
          </button>
        </div>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: textS, lineHeight: 1.7, margin: "0 0 16px", paddingLeft: 14, borderLeft: `3px solid ${c.border}`, fontStyle: "italic" }}>{lesson.content}</p>
        {lesson.videoUrl && <VideoEmbed url={lesson.videoUrl} />}
        {lesson.articleUrl && (
          <a href={lesson.articleUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: dm ? "rgba(14,165,233,0.08)" : "rgba(14,165,233,0.05)", borderRadius: 14, padding: "14px 16px", marginBottom: 16, textDecoration: "none", border: `1px solid ${dm ? "rgba(56,189,248,0.15)" : "rgba(14,165,233,0.12)"}` }}>
            <Icon name="link" size={20} color={dm ? "#38BDF8" : "#0284C7"} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: dm ? "#38BDF8" : "#0284C7", textTransform: "uppercase", letterSpacing: "0.08em" }}>Weiterführender Artikel</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, color: dm ? "#38BDF8" : "#0369A1" }}>{lesson.articleTitle || "Artikel lesen →"}</div>
            </div>
            <span style={{ fontSize: 16, color: dm ? "#38BDF8" : "#0284C7" }}>↗</span>
          </a>
        )}
        {lesson.tips && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dm ? "#FBBF24" : "#92400E", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Tipps</h4>
            {lesson.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, padding: "8px 12px", background: dm ? "rgba(251,191,36,0.06)" : "rgba(245,158,11,0.05)", borderRadius: 10, fontSize: 13, color: textP, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span style={{ color: "#F59E0B", fontWeight: 700, flexShrink: 0 }}>✦</span><span style={{ lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        )}
        {lesson.steps && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dm ? c.border : c.tag, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Schritt für Schritt</h4>
            {lesson.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 5, padding: "10px 12px", background: dm ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderRadius: 10, fontSize: 13, color: textP, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span style={{ background: c.border, color: "white", borderRadius: 8, width: 22, height: 22, minWidth: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</span>
                <span style={{ lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        )}
        {lesson.proTip && (
          <div style={{ background: dm ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.05)", borderRadius: 14, padding: "14px 16px", border: `1px dashed ${dm ? "rgba(251,191,36,0.3)" : "rgba(245,158,11,0.3)"}`, marginBottom: 12 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: dm ? "#FBBF24" : "#92400E", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pro-Tipp</div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: textP, margin: 0, fontWeight: 500, lineHeight: 1.5 }}>{lesson.proTip}</p>
          </div>
        )}
        {lesson.keyTerms && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {lesson.keyTerms.map((term, i) => <span key={i} style={{ background: dm ? "rgba(255,255,255,0.06)" : "#F1F5F9", color: textS, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{term}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
