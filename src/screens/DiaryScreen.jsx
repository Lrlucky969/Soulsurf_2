// SoulSurf – DiaryScreen
import React, { useState, useRef, useEffect } from "react";
import { BOARD_TYPES } from "../data.js";

export default function DiaryScreen({ data, t, dm }) {
  const [openDay, setOpenDay] = useState(null);
  const [voiceField, setVoiceField] = useState(null);
  const [diaryPhotos, setDiaryPhotos] = useState({});
  const voiceRecRef = useRef(null);
  const dbRef = useRef(null);
  const hasSpeech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const getDB = () => new Promise((res, rej) => { if (dbRef.current) return res(dbRef.current); const r = indexedDB.open("soulsurf_photos", 1); r.onupgradeneeded = e => e.target.result.createObjectStore("photos", { keyPath: "id" }); r.onsuccess = e => { dbRef.current = e.target.result; res(e.target.result); }; r.onerror = () => rej(); });
  const refreshPhotos = async (d) => { try { const db = await getDB(); const tx = db.transaction("photos", "readonly"); const r = tx.objectStore("photos").getAll(); r.onsuccess = () => setDiaryPhotos(p => ({ ...p, [d]: r.result.filter(x => x.day === d).map(x => ({ id: x.id, thumb: x.thumb })) })); } catch {} };
  const addPhoto = async (d, file) => { try { const db = await getDB(); const id = `photo-${d}-${Date.now()}`; const thumb = await new Promise(r => { const rd = new FileReader(); rd.onload = e => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 120; c.getContext("2d").drawImage(img, (img.width - Math.min(img.width, img.height)) / 2, (img.height - Math.min(img.width, img.height)) / 2, Math.min(img.width, img.height), Math.min(img.width, img.height), 0, 0, 120, 120); r(c.toDataURL("image/jpeg", 0.7)); }; img.src = e.target.result; }; rd.readAsDataURL(file); }); const buf = await file.arrayBuffer(); const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").put({ id, day: d, blob: buf, thumb, ts: Date.now() }); await new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; }); refreshPhotos(d); } catch {} };
  const deletePhoto = async (id, d) => { try { const db = await getDB(); const tx = db.transaction("photos", "readwrite"); tx.objectStore("photos").delete(id); await new Promise(r => { tx.oncomplete = r; }); refreshPhotos(d); } catch {} };
  useEffect(() => { if (openDay) refreshPhotos(openDay); }, [openDay]);

  const startVoice = (d, k) => { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return; if (voiceField) { if (voiceRecRef.current) voiceRecRef.current.stop(); voiceRecRef.current = null; setVoiceField(null); return; } const rec = new SR(); rec.lang = "de-DE"; rec.continuous = true; rec.interimResults = true; let ft = data.diary[d]?.[k] || ""; rec.onresult = e => { let nf = ""; for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) nf += e.results[i][0].transcript; if (nf) { ft += (ft ? " " : "") + nf; data.updateDiary(d, k, ft); } }; rec.onerror = () => setVoiceField(null); rec.onend = () => { setVoiceField(null); voiceRecRef.current = null; }; rec.start(); voiceRecRef.current = rec; setVoiceField({ day: d, key: k }); };

  if (!data.program) return (<div style={{ paddingTop: 60, textAlign: "center" }}><span style={{ fontSize: 60 }}>📓</span><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: t.text, margin: "16px 0 8px" }}>Noch kein Tagebuch</h2><p style={{ fontSize: 14, color: t.text2 }}>Erstelle zuerst ein Programm.</p></div>);

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>📓 Surf-Tagebuch</h2>
      <p style={{ fontSize: 14, color: t.text2, marginBottom: 20 }}>{data.diaryCount} Einträge</p>

      {data.program.program.map(dayData => {
        const entry = data.diary[dayData.day];
        const has = entry && (entry.whatWorked || entry.whatFailed || entry.notes || entry.mood);
        const isOpen = openDay === dayData.day;
        return (
          <div key={dayData.day} style={{ marginBottom: 12 }}>
            <button onClick={() => setOpenDay(isOpen ? null : dayData.day)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: has ? (dm ? "rgba(77,182,172,0.12)" : "#E0F2F1") : t.inputBg, border: `1px dashed ${has ? "#4DB6AC" : t.inputBorder}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>{has ? "📓" : "📝"}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color: has ? "#4DB6AC" : t.text3 }}>Tag {dayData.day} {has ? "✓" : ""}</span>
                {has && entry.whatWorked && <div style={{ fontSize: 12, color: t.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{entry.whatWorked}</div>}
              </div>
              {entry?.mood && <span style={{ fontSize: 18 }}>{["","😩","😕","😐","😊","🤩"][entry.mood]}</span>}
            </button>
            {isOpen && (
              <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "16px 18px", marginTop: 6 }}>
                {[{ key: "whatWorked", label: "Was hat gut geklappt?", icon: "✅", ph: "Pop-Up, Wellen lesen..." }, { key: "whatFailed", label: "Was hat nicht geklappt?", icon: "🔄", ph: "Timing, Balance..." }, { key: "focusTomorrow", label: "Fokus für morgen", icon: "🎯", ph: "Worauf achten..." }, { key: "notes", label: "Notizen", icon: "📝", ph: "Wellen, Stimmung..." }].map(f => {
                  const isRec = voiceField?.day === dayData.day && voiceField?.key === f.key;
                  return (
                    <div key={f.key} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: t.text2 }}>{f.icon} {f.label}</label>
                        {hasSpeech && <button onClick={() => startVoice(dayData.day, f.key)} style={{ background: isRec ? "#EF5350" : t.inputBg, border: `1px solid ${isRec ? "#EF5350" : t.inputBorder}`, borderRadius: 8, padding: "3px 8px", cursor: "pointer", fontSize: 12, color: isRec ? "white" : t.text3, animation: isRec ? "pulse 1s infinite" : "none" }}>{isRec ? "⏹" : "🎤"}</button>}
                      </div>
                      <textarea value={entry?.[f.key] || ""} onChange={e => data.updateDiary(dayData.day, f.key, e.target.value)} placeholder={f.ph} rows={f.key === "notes" ? 3 : 2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${isRec ? "#EF5350" : t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", lineHeight: 1.5 }} />
                    </div>
                  );
                })}
                <div style={{ borderTop: `1px dashed ${dm ? "#2d3f50" : "#E0E0E0"}`, paddingTop: 10, marginBottom: 10 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.text2, marginBottom: 6 }}>Mood</label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    {[{ v: 1, e: "😩" }, { v: 2, e: "😕" }, { v: 3, e: "😐" }, { v: 4, e: "😊" }, { v: 5, e: "🤩" }].map(m => (
                      <button key={m.v} onClick={() => data.updateDiary(dayData.day, "mood", m.v)} style={{ fontSize: 24, padding: "6px 8px", borderRadius: 10, border: entry?.mood === m.v ? "2px solid #4DB6AC" : `1px solid ${t.inputBorder}`, background: entry?.mood === m.v ? (dm ? "rgba(77,182,172,0.2)" : "#E0F2F1") : t.inputBg, cursor: "pointer", transform: entry?.mood === m.v ? "scale(1.15)" : "scale(1)" }}>{m.e}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                    {["Flat", "0.5m", "1m", "1.5m", "2m+"].map(wh => (
                      <button key={wh} onClick={() => data.updateDiary(dayData.day, "waveHeight", wh)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: entry?.waveHeight === wh ? "2px solid #4DB6AC" : `1px solid ${t.inputBorder}`, background: entry?.waveHeight === wh ? (dm ? "rgba(77,182,172,0.2)" : "#E0F2F1") : t.inputBg, color: entry?.waveHeight === wh ? "#4DB6AC" : t.text2, cursor: "pointer" }}>{wh}</button>
                    ))}
                  </div>
                  <select value={entry?.boardUsed || ""} onChange={e => data.updateDiary(dayData.day, "boardUsed", e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 12 }}>
                    <option value="">🏄 Board wählen</option>
                    {BOARD_TYPES.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.label}</option>)}
                  </select>
                </div>
                {/* Photos */}
                <div style={{ borderTop: `1px dashed ${dm ? "#2d3f50" : "#E0E0E0"}`, paddingTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase" }}>📷 Fotos</span>
                    <label style={{ fontSize: 11, fontWeight: 600, color: t.text2, background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>+ Foto<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) addPhoto(dayData.day, e.target.files[0]); e.target.value = ""; }} /></label>
                  </div>
                  {diaryPhotos[dayData.day]?.length > 0 ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {diaryPhotos[dayData.day].map(p => (
                        <div key={p.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", width: 80, height: 80, border: `1px solid ${t.inputBorder}` }}>
                          <img src={p.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={() => deletePhoto(p.id, dayData.day)} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 12, color: t.text3, textAlign: "center", padding: "8px 0" }}>Noch keine Fotos</div>}
                </div>
                {entry?.date && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textAlign: "right", marginTop: 8 }}>Erstellt: {new Date(entry.date).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
