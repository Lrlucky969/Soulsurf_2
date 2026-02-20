// SoulSurf – DiaryScreen 2.0
import React, { useState, useRef, useEffect, useMemo } from "react";
import { BOARD_TYPES } from "../data.js";

const MOODS = [null, "😩", "😕", "😐", "😊", "🤩"];
const MOOD_COLORS = [null, "#E53935", "#FF7043", "#FFB74D", "#66BB6A", "#4DB6AC"];

export default function DiaryScreen({ data, t, dm, i18n, photoSync }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const dateLang = i18n?.lang === "pt" ? "pt-BR" : i18n?.lang === "en" ? "en-US" : "de-DE";
  const [openDay, setOpenDay] = useState(null);
  const [voiceField, setVoiceField] = useState(null);
  const [diaryPhotos, setDiaryPhotos] = useState({});
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
  const [filter, setFilter] = useState("all"); // all | filled | empty | photos
  const voiceRecRef = useRef(null);
  const dbRef = useRef(null);
  const hasSpeech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // IndexedDB helpers (compact)
  const getDB = () => new Promise((res, rej) => { if (dbRef.current) return res(dbRef.current); const r = indexedDB.open("soulsurf_photos", 1); r.onupgradeneeded = e => e.target.result.createObjectStore("photos", { keyPath: "id" }); r.onsuccess = e => { dbRef.current = e.target.result; res(e.target.result); }; r.onerror = () => rej(); });
  const refreshPhotos = async (d) => { try { const db = await getDB(); const tx = db.transaction("photos", "readonly"); const r = tx.objectStore("photos").getAll(); r.onsuccess = () => setDiaryPhotos(p => ({ ...p, [d]: r.result.filter(x => x.day === d).map(x => ({ id: x.id, thumb: x.thumb })) })); } catch {} };
  const refreshAllPhotos = async () => { try { const db = await getDB(); const tx = db.transaction("photos", "readonly"); const r = tx.objectStore("photos").getAll(); r.onsuccess = () => { const byDay = {}; r.result.forEach(x => { if (!byDay[x.day]) byDay[x.day] = []; byDay[x.day].push({ id: x.id, thumb: x.thumb }); }); setDiaryPhotos(byDay); }; } catch {} };
  const addPhoto = async (d, file) => { try { const db = await getDB(); const id = `photo-${d}-${Date.now()}`; const thumb = await new Promise(r => { const rd = new FileReader(); rd.onload = e => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 200; c.getContext("2d").drawImage(img, (img.width - Math.min(img.width, img.height)) / 2, (img.height - Math.min(img.width, img.height)) / 2, Math.min(img.width, img.height), Math.min(img.width, img.height), 0, 0, 200, 200); r(c.toDataURL("image/jpeg", 0.8)); }; img.src = e.target.result; }; rd.readAsDataURL(file); }); const buf = await file.arrayBuffer(); const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").put({ id, day: d, blob: buf, thumb, ts: Date.now() }); await new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; }); if (photoSync?.uploadPhoto) photoSync.uploadPhoto(id, buf, thumb); refreshPhotos(d); } catch {} };
  const deletePhoto = async (id, d) => { try { const db = await getDB(); const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").delete(id); await new Promise(r => { tx.oncomplete = r; }); if (photoSync?.deleteCloudPhoto) photoSync.deleteCloudPhoto(id); refreshPhotos(d); } catch {} };
  const getFullPhoto = async (photoId) => { try { const db = await getDB(); const tx = db.transaction("photos", "readonly"); const r = tx.objectStore("photos").get(photoId); r.onsuccess = () => { if (r.result?.blob) { const blob = new Blob([r.result.blob], { type: "image/jpeg" }); setFullscreenPhoto(URL.createObjectURL(blob)); } }; } catch {} };

  // On mount: refresh local photos, then sync from cloud if available
  useEffect(() => {
    refreshAllPhotos();
    if (photoSync?.isEnabled) {
      photoSync.syncFromCloud(getDB).then(count => {
        if (count > 0) refreshAllPhotos(); // Refresh UI if photos were restored
      });
    }
  }, []);
  useEffect(() => { if (openDay) refreshPhotos(openDay); }, [openDay]);

  // Voice
  const startVoice = (d, k) => { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return; if (voiceField) { if (voiceRecRef.current) voiceRecRef.current.stop(); voiceRecRef.current = null; setVoiceField(null); return; } const rec = new SR(); rec.lang = "de-DE"; rec.continuous = true; rec.interimResults = true; let ft = data.diary[d]?.[k] || ""; rec.onresult = e => { let nf = ""; for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) nf += e.results[i][0].transcript; if (nf) { ft += (ft ? " " : "") + nf; data.updateDiary(d, k, ft); } }; rec.onerror = () => setVoiceField(null); rec.onend = () => { setVoiceField(null); voiceRecRef.current = null; }; rec.start(); voiceRecRef.current = rec; setVoiceField({ day: d, key: k }); };

  // Stats
  const stats = useMemo(() => {
    const entries = Object.values(data.diary).filter(e => e && (e.whatWorked || e.whatFailed || e.notes || e.mood));
    const moods = entries.map(e => e.mood).filter(Boolean);
    const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null;
    const waves = entries.map(e => e.waveHeight).filter(Boolean);
    const topWave = waves.length > 0 ? waves.sort((a, b) => waves.filter(v => v === b).length - waves.filter(v => v === a).length)[0] : null;
    const totalPhotos = Object.values(diaryPhotos).reduce((s, arr) => s + (arr?.length || 0), 0);
    return { count: entries.length, avgMood, topWave, totalPhotos, moods };
  }, [data.diary, diaryPhotos]);

  // Mood chart data
  const moodChartData = useMemo(() => {
    if (!data.program) return [];
    return data.program.program.map(d => ({ day: d.day, mood: data.diary[d.day]?.mood || 0 }));
  }, [data.program, data.diary]);

  // Filter logic
  const filteredDays = useMemo(() => {
    if (!data.program) return [];
    return data.program.program.filter(d => {
      const entry = data.diary[d.day];
      const has = entry && (entry.whatWorked || entry.whatFailed || entry.notes || entry.mood);
      const hasPhotos = (diaryPhotos[d.day]?.length || 0) > 0;
      if (filter === "filled") return has;
      if (filter === "empty") return !has;
      if (filter === "photos") return hasPhotos;
      return true;
    });
  }, [data.program, data.diary, diaryPhotos, filter]);

  if (!data.program) return null; // App.jsx handles empty state

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("diary.title")}</h2>

      {/* First-visit tooltip */}
      {stats.count === 0 && (
        <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, marginBottom: 3 }}>{_("tip.diaryTitle")}</div>
          <div style={{ fontSize: 11, color: t.text2, lineHeight: 1.5 }}>Notiere nach jeder Session was funktioniert hat und was nicht. Du kannst Fotos anhängen und sogar per Spracheingabe 🎤 diktieren. Dein Coaching passt sich an deine Einträge an!<</div>
        <</div>
      )}

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {[
          { label: _("diary.entries"), value: stats.count, emoji: "📝" },
          { label: _("diary.avgMood"), value: stats.avgMood ? `${stats.avgMood}` : "–", emoji: stats.avgMood >= 4 ? "😊" : stats.avgMood >= 3 ? "😐" : "😕" },
          { label: _("diary.topWave"), value: stats.topWave || "–", emoji: "🌊" },
          { label: _("diary.photos"), value: stats.totalPhotos, emoji: "📷" },
        ].map((s, i) => (
          <div key={i} style={{ flex: "0 0 auto", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 76 }}>
            <div style={{ fontSize: 16 }}>{s.emoji}<</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: t.text }}>{s.value}<</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>{s.label}<</div>
          <</div>
        ))}
      <</div>

      {/* Mood Chart */}
      {moodChartData.some(d => d.mood > 0) && (
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Mood-Verlauf<</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60 }}>
            {moodChartData.map((d, i) => {
              const h = d.mood > 0 ? (d.mood / 5) * 100 : 0;
              const color = d.mood > 0 ? MOOD_COLORS[d.mood] : (dm ? "#2d3f50" : "#E0E0E0");
              return (
                <div key={i} onClick={() => { setOpenDay(openDay === d.day ? null : d.day); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ width: "100%", maxWidth: 24, height: `${Math.max(h, 8)}%`, background: color, borderRadius: "4px 4px 0 0", transition: "height 0.3s ease", opacity: d.mood > 0 ? 1 : 0.3 }} />
                  <div style={{ fontSize: 8, color: t.text3, marginTop: 2 }}>{d.day}<</div>
                <</div>
              );
            })}
          <</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {MOODS.slice(1).map((m, i) => <span key={i} style={{ fontSize: 12 }}>{m}<</span>)}
          <</div>
        <</div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "all", label: "Alle", count: data.program.program.length },
          { id: "filled", label: _("diary.filled"), count: Object.values(data.diary).filter(e => e && (e.whatWorked || e.whatFailed || e.notes || e.mood)).length },
          { id: "empty", label: "Offen", count: data.program.program.length - Object.values(data.diary).filter(e => e && (e.whatWorked || e.whatFailed || e.notes || e.mood)).length },
          { id: "photos", label: _("diary.withPhotos"), count: Object.keys(diaryPhotos).filter(k => diaryPhotos[k]?.length > 0).length },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: filter === f.id ? 700 : 500, cursor: "pointer",
            background: filter === f.id ? (dm ? t.accent : "#263238") : t.inputBg,
            color: filter === f.id ? "white" : t.text2,
            border: `1px solid ${filter === f.id ? "transparent" : t.inputBorder}`,
          }}>{f.label} ({f.count})<</button>
        ))}
      <</div>

      {/* Timeline */}
      {filteredDays.map((dayData, idx) => {
        const entry = data.diary[dayData.day];
        const has = entry && (entry.whatWorked || entry.whatFailed || entry.notes || entry.mood);
        const isOpen = openDay === dayData.day;
        const photoCount = diaryPhotos[dayData.day]?.length || 0;

        return (
          <div key={dayData.day} style={{ display: "flex", gap: 12, marginBottom: isOpen ? 16 : 8 }}>
            {/* Timeline bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: has ? (entry.mood ? MOOD_COLORS[entry.mood] : t.accent) : (dm ? "#2d3f50" : "#E0E0E0"), border: `2px solid ${has ? "transparent" : t.inputBorder}`, transition: "all 0.2s ease" }} />
              {idx < filteredDays.length - 1 && <div style={{ flex: 1, width: 2, background: dm ? "#2d3f50" : "#E0E0E0", minHeight: isOpen ? 20 : 8 }} />}
            <</div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <button onClick={() => setOpenDay(isOpen ? null : dayData.day)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: has ? (dm ? "rgba(77,182,172,0.08)" : "rgba(0,150,136,0.04)") : "transparent", border: `1px solid ${has ? (dm ? "rgba(77,182,172,0.15)" : "#B2DFDB") : t.cardBorder}`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", transition: "all 0.2s ease" }}>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: has ? t.accent : t.text3 }}>Tag {dayData.day}<</span>
                    {entry?.mood && <span style={{ fontSize: 14 }}>{MOODS[entry.mood]}<</span>}
                    {entry?.waveHeight && <span style={{ fontSize: 10, color: t.text3, fontFamily: "'Space Mono', monospace" }}>🌊 {entry.waveHeight}<</span>}
                    {photoCount > 0 && <span style={{ fontSize: 10, color: t.text3 }}>📷 {photoCount}<</span>}
                  <</div>
                  {has && entry.whatWorked && <div style={{ fontSize: 12, color: t.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260, marginTop: 2 }}>{entry.whatWorked}<</div>}
                <</div>
                <span style={{ fontSize: 12, color: t.text3, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>▼<</span>
              <</button>

              {isOpen && (
                <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "16px 18px", marginTop: 6, animation: "slideUp 0.25s ease both" }}>
                  {[{ key: "whatWorked", label: _("diary.whatWorked"), icon: "✅", ph: _("diary.phWorked") }, { key: "whatFailed", label: _("diary.whatFailed"), icon: "🔄", ph: _("diary.phFailed") }, { key: "focusTomorrow", label: _("diary.focusTomorrow"), icon: "🎯", ph: _("diary.phFocus") }, { key: "notes", label: _("diary.notes"), icon: "📝", ph: _("diary.phNotes") }].map(f => {
                    const isRec = voiceField?.day === dayData.day && voiceField?.key === f.key;
                    return (
                      <div key={f.key} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: t.text2 }}>{f.icon} {f.label}<</label>
                          {hasSpeech && <button onClick={() => startVoice(dayData.day, f.key)} style={{ background: isRec ? "#EF5350" : t.inputBg, border: `1px solid ${isRec ? "#EF5350" : t.inputBorder}`, borderRadius: 8, padding: "3px 8px", cursor: "pointer", fontSize: 12, color: isRec ? "white" : t.text3, animation: isRec ? "pulse 1s infinite" : "none" }}>{isRec ? "⏹" : "🎤"}<</button>}
                        <</div>
                        <textarea value={entry?.[f.key] || ""} onChange={e => data.updateDiary(dayData.day, f.key, e.target.value)} placeholder={f.ph} rows={f.key === "notes" ? 3 : 2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${isRec ? "#EF5350" : t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", lineHeight: 1.5 }} />
                      <</div>
                    );
                  })}

                  {/* Mood + Conditions */}
                  <div style={{ borderTop: `1px dashed ${dm ? "#2d3f50" : "#E0E0E0"}`, paddingTop: 12, marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.text2, marginBottom: 6 }}>Mood<</label>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => data.updateDiary(dayData.day, "mood", v)} style={{ fontSize: 26, padding: "6px 8px", borderRadius: 10, border: entry?.mood === v ? `2px solid ${MOOD_COLORS[v]}` : `1px solid ${t.inputBorder}`, background: entry?.mood === v ? (dm ? `${MOOD_COLORS[v]}20` : `${MOOD_COLORS[v]}15`) : t.inputBg, cursor: "pointer", transform: entry?.mood === v ? "scale(1.2)" : "scale(1)", transition: "all 0.15s ease" }}>{MOODS[v]}<</button>
                      ))}
                    <</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: t.text3, alignSelf: "center", marginRight: 4 }}>🌊<</span>
                      {["Flat", "0.5m", "1m", "1.5m", "2m+"].map(wh => (
                        <button key={wh} onClick={() => data.updateDiary(dayData.day, "waveHeight", wh)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: entry?.waveHeight === wh ? "2px solid #4DB6AC" : `1px solid ${t.inputBorder}`, background: entry?.waveHeight === wh ? (dm ? "rgba(77,182,172,0.2)" : "#E0F2F1") : t.inputBg, color: entry?.waveHeight === wh ? "#4DB6AC" : t.text2, cursor: "pointer" }}>{wh}<</button>
                      ))}
                    <</div>
                    <select value={entry?.boardUsed || ""} onChange={e => data.updateDiary(dayData.day, "boardUsed", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 12 }}>
                      <option value="">{_("diary.chooseBoard")}</option>
                      {BOARD_TYPES.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.label}<</option>)}
                    <</select>
                  <</div>

                  {/* Photos */}
                  <div style={{ borderTop: `1px dashed ${dm ? "#2d3f50" : "#E0E0E0"}`, paddingTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase" }}>📷 Fotos ({diaryPhotos[dayData.day]?.length || 0})<</span>
                      <label style={{ fontSize: 11, fontWeight: 600, color: t.accent, background: dm ? "rgba(77,182,172,0.1)" : "#E0F2F1", border: `1px solid ${t.accent}`, borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>+ {_("diary.addPhoto")}<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) addPhoto(dayData.day, e.target.files[0]); e.target.value = ""; }} /><</label>
                    <</div>
                    {diaryPhotos[dayData.day]?.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                        {diaryPhotos[dayData.day].map(p => (
                          <div key={p.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", border: `1px solid ${t.inputBorder}`, cursor: "pointer" }} onClick={() => getFullPhoto(p.id)}>
                            <img src={p.thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button onClick={e => { e.stopPropagation(); deletePhoto(p.id, dayData.day); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>✕<</button>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.4))", padding: "12px 6px 4px", fontSize: 9, color: "white", textAlign: "center" }}>Antippen<</div>
                          <</div>
                        ))}
                      <</div>
                    ) : <div style={{ fontSize: 12, color: t.text3, textAlign: "center", padding: "12px 0", background: t.inputBg, borderRadius: 10 }}>{_("diary.noPhotos")}<</div>}
                  <</div>
                  {entry?.date && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textAlign: "right", marginTop: 10 }}>📅 {new Date(entry.date).toLocaleDateString(dateLang, { day: "numeric", month: "long" })}<</div>}
                <</div>
              )}
            <</div>
          <</div>
        );
      })}

      {filteredDays.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 20px", color: t.text3 }}>
          <span style={{ fontSize: 36 }}>🔍<</span>
          <p style={{ fontSize: 14, marginTop: 8 }}>Keine Einträge für diesen Filter.<</p>
        <</div>
      )}

      {/* Fullscreen Photo Viewer */}
      {fullscreenPhoto && (
        <div onClick={() => { URL.revokeObjectURL(fullscreenPhoto); setFullscreenPhoto(null); }} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease", cursor: "pointer" }}>
          <button onClick={() => { URL.revokeObjectURL(fullscreenPhoto); setFullscreenPhoto(null); }} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, cursor: "pointer", color: "white", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕<</button>
          <img src={fullscreenPhoto} alt="Surf-Foto" style={{ maxWidth: "95%", maxHeight: "90vh", borderRadius: 16, objectFit: "contain", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
        <</div>
      )}
    <</div>
  );
}
