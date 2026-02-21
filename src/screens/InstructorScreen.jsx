// SoulSurf – InstructorScreen (Sprint 27 – Instructor Mode)
import React, { useState, useMemo } from "react";
import { LANG_LABELS } from "../data.js";

// Demo sessions for UI (later: Supabase)
const DEMO_SESSIONS = [
  { id: "s1", studentName: "Lukas M.", date: "2026-02-18", courseType: "Anfänger", status: "completed", rating: 4,
    notes: "Bom pop-up, precisa melhorar o paddle. Recomendo praticar a remada em casa.",
    notesTranslated: "Guter Pop-Up, muss Paddeln verbessern. Empfehle Paddelübungen zu Hause.",
    videoUrl: "https://youtube.com/watch?v=example1", photos: 2 },
  { id: "s2", studentName: "Marie K.", date: "2026-02-19", courseType: "Intermediate", status: "active", rating: null,
    notes: "", notesTranslated: "", videoUrl: "", photos: 0 },
  { id: "s3", studentName: "Tom B.", date: "2026-02-20", courseType: "Privat", status: "upcoming", rating: null,
    notes: "", notesTranslated: "", videoUrl: "", photos: 0 },
];

const STATUS_LABELS = {
  upcoming: { label: "Upcoming", color: "#42A5F5", emoji: "📅" },
  active: { label: "Active", color: "#FFA726", emoji: "🏄" },
  completed: { label: "Done", color: "#66BB6A", emoji: "✅" },
};

export default function InstructorScreen({ data, auth, t, dm, i18n, navigate }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [sessions, setSessions] = useState(DEMO_SESSIONS);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editVideo, setEditVideo] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [showCert, setShowCert] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return sessions;
    return sessions.filter(s => s.status === filter);
  }, [sessions, filter]);

  // Update a session field
  const updateSession = (id, updates) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // === SESSION DETAIL ===
  if (selectedSession) {
    const s = sessions.find(ss => ss.id === selectedSession);
    if (!s) { setSelectedSession(null); return null; }
    const st = STATUS_LABELS[s.status];

    return (
      <div style={{ paddingTop: 24 }}>
        <button onClick={() => setSelectedSession(null)} style={{ background: "none", border: "none", color: t.accent, fontSize: 13, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>← Alle Sessions</button>

        {/* Student Header */}
        <div style={{ background: "linear-gradient(135deg, #004D40, #00695C)", borderRadius: 20, padding: "20px", color: "white", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -10, right: -10, fontSize: 60, opacity: 0.08 }}>🏄</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", opacity: 0.7 }}>Session</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, marginTop: 4 }}>{s.studentName}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{s.courseType} · {new Date(s.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
            <span style={{ background: `${st.color}30`, color: st.color, padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{st.emoji} {st.label}</span>
          </div>
        </div>

        {/* Session Status */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {Object.entries(STATUS_LABELS).map(([key, val]) => (
            <button key={key} onClick={() => updateSession(s.id, { status: key })} style={{
              flex: 1, padding: "8px", borderRadius: 10, fontSize: 11, fontWeight: s.status === key ? 700 : 500, cursor: "pointer",
              background: s.status === key ? `${val.color}20` : t.inputBg,
              color: s.status === key ? val.color : t.text3,
              border: `1px solid ${s.status === key ? val.color : t.inputBorder}`,
            }}>{val.emoji} {val.label}</button>
          ))}
        </div>

        {/* Notes (Instructor's language) */}
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{_("inst.sessionNotes")}</div>
          <textarea
            value={editNotes || s.notes}
            onChange={e => setEditNotes(e.target.value)}
            onBlur={() => { if (editNotes) { updateSession(s.id, { notes: editNotes }); setEditNotes(""); } }}
            rows={4}
            placeholder={_("inst.notesPlaceholder")}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13, resize: "vertical" }}
          />
          {s.notesTranslated && (
            <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 10, background: dm ? "rgba(66,165,245,0.08)" : "#E3F2FD", border: `1px solid ${dm ? "rgba(66,165,245,0.15)" : "#BBDEFB"}` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#1565C0", marginBottom: 4 }}>{_("inst.autoTranslation")}</div>
              <div style={{ fontSize: 12, color: t.text2, lineHeight: 1.5 }}>{s.notesTranslated}</div>
            </div>
          )}
        </div>

        {/* Video Link */}
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{_("inst.video")}</div>
          <input
            type="url"
            value={editVideo || s.videoUrl}
            onChange={e => setEditVideo(e.target.value)}
            onBlur={() => { if (editVideo) { updateSession(s.id, { videoUrl: editVideo }); setEditVideo(""); } }}
            placeholder={_("inst.videoPlaceholder")}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }}
          />
          {s.videoUrl && (
            <div style={{ marginTop: 8, fontSize: 12, color: t.accent, fontWeight: 600 }}>▶ Video verlinkt</div>
          )}
        </div>

        {/* Rating */}
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{_("inst.rating")}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map(r => (
              <button key={r} onClick={() => updateSession(s.id, { rating: r })} style={{
                width: 44, height: 44, borderRadius: 12, fontSize: 20, cursor: "pointer",
                background: r <= (s.rating || 0) ? "#FFA000" : t.inputBg,
                color: r <= (s.rating || 0) ? "white" : t.text3,
                border: `1px solid ${r <= (s.rating || 0) ? "#FFA000" : t.inputBorder}`,
              }}>★</button>
            ))}
          </div>
        </div>

        {/* Certificate Button */}
        {s.status === "completed" && (
          <button onClick={() => setShowCert(true)} style={{
            width: "100%", padding: "16px", borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #FFB74D, #FF7043)", color: "white", border: "none", marginBottom: 12,
            boxShadow: "0 6px 20px rgba(255,152,0,0.3)",
          }}>🎓 Zertifikat ausstellen</button>
        )}

        {/* Certificate Preview */}
        {showCert && (
          <div style={{ background: dm ? "rgba(30,45,61,0.95)" : "white", border: `2px solid #FFB74D`, borderRadius: 20, padding: "28px 24px", marginBottom: 16, textAlign: "center", position: "relative" }}>
            <button onClick={() => setShowCert(false)} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", color: t.text3, fontSize: 18, cursor: "pointer" }}>✕</button>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏄🎓</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", letterSpacing: "0.15em" }}>Surf-Zertifikat</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, margin: "8px 0" }}>{s.studentName}</div>
            <div style={{ fontSize: 13, color: t.text2, marginBottom: 4 }}>hat erfolgreich den Kurs</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: t.accent }}>{s.courseType}</div>
            <div style={{ fontSize: 13, color: t.text2, margin: "4px 0 12px" }}>am {new Date(s.date).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })} abgeschlossen.</div>
            <div style={{ width: 60, height: 2, background: t.accent, margin: "0 auto 12px", borderRadius: 2 }} />
            <div style={{ fontSize: 11, color: t.text3 }}>Ausgestellt via SoulSurf</div>
          </div>
        )}
      </div>
    );
  }

  // === SESSION LIST ===
  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("inst.title")}</h2>
      <p style={{ fontSize: 13, color: t.text2, marginBottom: 16 }}>Verwalte Sessions, Notizen und Zertifikate.</p>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { key: "all", label: "Alle", count: sessions.length },
          { key: "upcoming", label: _("inst.upcoming"), count: sessions.filter(s => s.status === "upcoming").length },
          { key: "active", label: _("inst.active"), count: sessions.filter(s => s.status === "active").length },
          { key: "completed", label: _("inst.completed"), count: sessions.filter(s => s.status === "completed").length },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            flex: 1, padding: "8px 6px", borderRadius: 10, fontSize: 11, fontWeight: filter === f.key ? 700 : 500, cursor: "pointer",
            background: filter === f.key ? (dm ? t.accent : "#263238") : t.inputBg,
            color: filter === f.key ? "white" : t.text2, border: `1px solid ${filter === f.key ? "transparent" : t.inputBorder}`,
          }}>{f.label} ({f.count})</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { emoji: "👥", value: sessions.length, label: _("inst.total") },
          { emoji: "📅", value: sessions.filter(s => s.status === "upcoming").length, label: _("inst.openSessions") },
          { emoji: "🎓", value: sessions.filter(s => s.status === "completed").length, label: _("inst.certificates") },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{s.emoji}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: t.accent }}>{s.value}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Session Cards */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px", color: t.text3, fontSize: 13 }}>Keine Sessions in dieser Kategorie.</div>
      )}
      {filtered.map(s => {
        const st = STATUS_LABELS[s.status];
        return (
          <button key={s.id} onClick={() => setSelectedSession(s.id)} style={{
            width: "100%", display: "flex", gap: 14, padding: "14px 16px", borderRadius: 14, cursor: "pointer", textAlign: "left", marginBottom: 8,
            background: t.card, border: `1px solid ${t.cardBorder}`,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${st.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{st.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{s.studentName}</span>
                <span style={{ fontSize: 10, color: st.color, fontWeight: 600 }}>{st.label}</span>
              </div>
              <div style={{ fontSize: 11, color: t.text2, marginTop: 2 }}>{s.courseType} · {new Date(s.date).toLocaleDateString("de-DE")}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {s.notes && <span style={{ fontSize: 10, color: t.text3 }}>📝 Notizen</span>}
                {s.videoUrl && <span style={{ fontSize: 10, color: t.text3 }}>{_("inst.video")}</span>}
                {s.rating && <span style={{ fontSize: 10, color: "#FFA000" }}>{"★".repeat(s.rating)}</span>}
              </div>
            </div>
            <span style={{ fontSize: 16, color: t.text3, alignSelf: "center" }}>→</span>
          </button>
        );
      })}
    </div>
  );
}
