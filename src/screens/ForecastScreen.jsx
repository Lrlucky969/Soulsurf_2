// SoulSurf – ForecastScreen (Sprint 21 – Surf-Forecast Pro)
import React, { useState, useMemo } from "react";
import { SURF_SPOTS } from "../data.js";
import { useHourlyForecast, surfScore, scoreLabel, windDirLabel, windArrow, weatherLabel, swellRating } from "../weather.js";

function formatHour(timeStr) {
  const d = new Date(timeStr);
  return `${d.getHours().toString().padStart(2, "0")}:00`;
}

function formatDate(timeStr) {
  const d = new Date(timeStr);
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return `${days[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}`;
}

export default function ForecastScreen({ data, t, dm, i18n }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [selectedSpot, setSelectedSpot] = useState(data.spot || SURF_SPOTS[0]?.id || "bali");
  const spot = SURF_SPOTS.find(s => s.id === selectedSpot) || SURF_SPOTS[0];
  const { hourly, loading } = useHourlyForecast(spot);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showTip, setShowTip] = useState(() => {
    try { return !JSON.parse(localStorage.getItem("soulsurf_tooltips") || "{}")["forecast-intro"]; } catch { return true; }
  });
  const dismissTip = () => {
    setShowTip(false);
    try { const t = JSON.parse(localStorage.getItem("soulsurf_tooltips") || "{}"); t["forecast-intro"] = true; localStorage.setItem("soulsurf_tooltips", JSON.stringify(t)); } catch {}
  };

  // Group hours by day
  const days = useMemo(() => {
    if (!hourly) return [];
    const grouped = {};
    hourly.forEach(h => {
      const dateKey = h.time.split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(h);
    });
    return Object.entries(grouped).map(([date, hours]) => ({
      date,
      label: formatDate(hours[0].time),
      hours,
      // Only daylight hours (6-20) for display
      surfHours: hours.filter(h => {
        const hr = new Date(h.time).getHours();
        return hr >= 6 && hr <= 20;
      }),
    }));
  }, [hourly]);

  const currentDay = days[selectedDay];

  // Best windows for today
  const bestWindows = useMemo(() => {
    if (!currentDay) return [];
    const scored = currentDay.surfHours.map(h => ({ ...h, score: surfScore(h) }));
    const windows = [];
    let current = null;
    scored.forEach(h => {
      if (h.score >= 60) {
        if (!current) current = { start: h.time, end: h.time, scores: [h.score], hours: [h] };
        else { current.end = h.time; current.scores.push(h.score); current.hours.push(h); }
      } else {
        if (current && current.scores.length >= 1) windows.push(current);
        current = null;
      }
    });
    if (current && current.scores.length >= 1) windows.push(current);
    return windows.map(w => ({
      ...w,
      avg: Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length),
    })).sort((a, b) => b.avg - a.avg).slice(0, 3);
  }, [currentDay]);

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("forecast.title")}</h2>
      <p style={{ fontSize: 13, color: t.text2, marginBottom: 16 }}>{_("forecast.subtitle")}</p>

      {showTip && (
        <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, marginBottom: 3 }}>{_("tip.forecastTitle")}</div>
            <div style={{ fontSize: 11, color: t.text2, lineHeight: 1.5 }}>{_("tip.forecast")}</div>
          </div>
          <button onClick={dismissTip} style={{ background: "none", border: "none", color: t.text3, fontSize: 16, cursor: "pointer", padding: 4, marginLeft: 8, flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Spot Selector */}
      <select value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
        {SURF_SPOTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
      </select>

      {loading && <div style={{ textAlign: "center", padding: "30px", color: t.text3, fontSize: 13 }}>{_("forecast.loading")}</div>}

      {!loading && days.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: t.card, borderRadius: 16, border: `1px solid ${t.cardBorder}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: t.text, marginBottom: 8 }}>Forecast nicht verfügbar</h3>
          <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.6 }}>Prüfe deine Internetverbindung. Der Forecast benötigt eine aktive Verbindung zur Open-Meteo API.</p>
        </div>
      )}

      {!loading && days.length > 0 && (
        <>
          {/* Day Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {days.slice(0, 3).map((d, i) => (
              <button key={d.date} onClick={() => setSelectedDay(i)} style={{
                flex: 1, padding: "8px 6px", borderRadius: 10, fontSize: 12, fontWeight: selectedDay === i ? 700 : 500, cursor: "pointer",
                background: selectedDay === i ? (dm ? t.accent : "#263238") : t.inputBg,
                color: selectedDay === i ? "white" : t.text2, border: `1px solid ${selectedDay === i ? "transparent" : t.inputBorder}`,
              }}>{i === 0 ? _("forecast.today") : i === 1 ? _("forecast.tomorrow") : d.label}</button>
            ))}
          </div>

          {/* Best Time to Surf */}
          {bestWindows.length > 0 && (
            <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", borderRadius: 16, padding: "16px", marginBottom: 16, border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}` }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🏄 Beste Surf-Zeiten {selectedDay === 0 ? "heute" : ""}</div>
              {bestWindows.map((w, i) => {
                const sl = scoreLabel(w.avg);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: dm ? "rgba(30,45,61,0.6)" : "white", borderRadius: 10, marginBottom: i < bestWindows.length - 1 ? 6 : 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: sl.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{sl.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{formatHour(w.start)} – {formatHour(w.end)}</div>
                      <div style={{ fontSize: 11, color: t.text2 }}>
                        {w.hours[0]?.waveHeight != null && `${w.hours[0].waveHeight.toFixed(1)}m`}
                        {w.hours[0]?.wind != null && ` · ${Math.round(w.hours[0].wind)} km/h ${windArrow(w.hours[0].windDir)}`}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: sl.color }}>{w.avg}</div>
                      <div style={{ fontSize: 10, color: t.text3 }}>{sl.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {bestWindows.length === 0 && currentDay && (
            <div style={{ background: dm ? "rgba(229,57,53,0.08)" : "#FFEBEE", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: `1px solid ${dm ? "rgba(229,57,53,0.15)" : "#FFCDD2"}` }}>
              <div style={{ fontSize: 13, color: "#E53935", fontWeight: 600 }}>😕 Keine guten Surf-Fenster {selectedDay === 0 ? "heute" : "an diesem Tag"}</div>
              <div style={{ fontSize: 12, color: t.text2, marginTop: 4 }}>Zu viel Wind, zu kleine oder zu große Wellen. Probiere einen anderen Tag.</div>
            </div>
          )}

          {/* Hourly Timeline */}
          {currentDay && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>📊 Stündlicher Forecast</div>
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
                <div style={{ display: "flex", gap: 6, minWidth: "max-content" }}>
                  {currentDay.surfHours.map((h, i) => {
                    const score = surfScore(h);
                    const sl = scoreLabel(score);
                    const wl = weatherLabel(h.code);
                    return (
                      <div key={i} style={{ width: 72, padding: "10px 6px", background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: t.text2, marginBottom: 4 }}>{formatHour(h.time)}</div>
                        <div style={{ fontSize: 16, marginBottom: 2 }}>{wl.emoji}</div>
                        {/* Score bar */}
                        <div style={{ height: 4, borderRadius: 2, background: dm ? "rgba(255,255,255,0.08)" : "#ECEFF1", marginBottom: 4 }}>
                          <div style={{ height: "100%", borderRadius: 2, background: sl.color, width: `${score}%`, transition: "width 0.3s" }} />
                        </div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: sl.color, marginBottom: 2 }}>{score}</div>
                        {h.waveHeight != null && <div style={{ fontSize: 10, color: t.text2 }}>🌊 {h.waveHeight.toFixed(1)}m</div>}
                        <div style={{ fontSize: 10, color: t.text3 }}>💨 {Math.round(h.wind || 0)}{windArrow(h.windDir)}</div>
                        <div style={{ fontSize: 10, color: t.text3 }}>{Math.round(h.temp || 0)}°</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Wind Rose Summary */}
          {currentDay && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {/* Wind Card */}
              <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "14px" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, textTransform: "uppercase", marginBottom: 8 }}>💨 Wind</div>
                {(() => {
                  const winds = currentDay.surfHours.filter(h => h.wind != null);
                  const avgWind = winds.length ? Math.round(winds.reduce((s, h) => s + h.wind, 0) / winds.length) : 0;
                  const maxGust = Math.max(...currentDay.surfHours.map(h => h.gusts || 0));
                  const dominantDir = winds.length ? Math.round(winds.reduce((s, h) => s + (h.windDir || 0), 0) / winds.length) : 0;
                  return (
                    <>
                      <div style={{ fontSize: 28, fontWeight: 800, color: t.text, fontFamily: "'Playfair Display', serif" }}>{avgWind}<span style={{ fontSize: 14, color: t.text2 }}> km/h</span></div>
                      <div style={{ fontSize: 12, color: t.text2, marginTop: 4 }}>
                        <span style={{ fontSize: 18 }}>{windArrow(dominantDir)}</span> {windDirLabel(dominantDir)}
                      </div>
                      {maxGust > 0 && <div style={{ fontSize: 11, color: t.text3, marginTop: 2 }}>Böen bis {Math.round(maxGust)} km/h</div>}
                    </>
                  );
                })()}
              </div>
              {/* Waves Card */}
              <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 14, padding: "14px" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, textTransform: "uppercase", marginBottom: 8 }}>🌊 Wellen</div>
                {(() => {
                  const waves = currentDay.surfHours.filter(h => h.waveHeight != null);
                  const maxH = waves.length ? Math.max(...waves.map(h => h.waveHeight)) : 0;
                  const avgP = waves.length ? (waves.reduce((s, h) => s + (h.wavePeriod || 0), 0) / waves.length).toFixed(0) : 0;
                  const sr = swellRating(maxH, Number(avgP));
                  return (
                    <>
                      <div style={{ fontSize: 28, fontWeight: 800, color: t.text, fontFamily: "'Playfair Display', serif" }}>{maxH.toFixed(1)}<span style={{ fontSize: 14, color: t.text2 }}>m max</span></div>
                      <div style={{ fontSize: 12, color: t.text2, marginTop: 4 }}>Periode: ~{avgP}s</div>
                      {sr && <div style={{ fontSize: 12, color: sr.color, fontWeight: 600, marginTop: 2 }}>{sr.emoji} {sr.label}</div>}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Surf Score Legend */}
          <div style={{ background: dm ? "rgba(30,45,61,0.5)" : "#F5F5F5", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>📖 Score-Legende</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { emoji: "🟢", label: "80+ Perfekt", desc: "Go!" },
                { emoji: "🟡", label: "60-79 Gut", desc: "Lohnt sich" },
                { emoji: "🟠", label: "40-59 Okay", desc: "Einschränkungen" },
                { emoji: "🔴", label: "0-39 Schwierig", desc: "Skip it" },
              ].map(l => (
                <div key={l.label} style={{ fontSize: 11, color: t.text2 }}>{l.emoji} <b>{l.label}</b> – {l.desc}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
