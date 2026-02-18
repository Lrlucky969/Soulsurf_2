// SoulSurf – TripScreen
import React from "react";
import { SURF_SPOTS, LOCAL_POIS, PACKING_LIST } from "../data.js";
import { useWeather, windDirLabel, weatherLabel, useSwell, swellRating } from "../weather.js";
import SpotMap from "../SpotMap.jsx";

export default function TripScreen({ data, t, dm, spotObj, navigate }) {
  const selectedSpot = spotObj || SURF_SPOTS[0]; // fallback to first spot if no program
  const { weather, loading: weatherLoading } = useWeather(selectedSpot);
  const { swell } = useSwell(selectedSpot);

  // Allow spot selection even without a program
  const [localSpot, setLocalSpot] = React.useState(null);
  const currentSpot = localSpot ? SURF_SPOTS.find(s => s.id === localSpot) : selectedSpot;

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>✈️ Trip planen</h2>
      <p style={{ fontSize: 14, color: t.text2, marginBottom: 20 }}>
        {currentSpot ? `${currentSpot.emoji} ${currentSpot.name}` : "Wähle einen Spot"}
      </p>

      {/* Spot Quick-Select */}
      {!spotObj && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", marginBottom: 8 }}>Spot wählen</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SURF_SPOTS.slice(0, 8).map(s => (
              <button key={s.id} onClick={() => setLocalSpot(s.id)} style={{
                padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: (localSpot || selectedSpot?.id) === s.id ? t.accent : t.inputBg,
                color: (localSpot || selectedSpot?.id) === s.id ? "white" : t.text2,
                border: `1px solid ${(localSpot || selectedSpot?.id) === s.id ? t.accent : t.inputBorder}`,
              }}>{s.emoji} {s.name.split(",")[0]}</button>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      {currentSpot && <SpotMap spot={currentSpot} pois={LOCAL_POIS[currentSpot.id] || []} dm={dm} />}

      {/* Trip Dates + Info */}
      {currentSpot && (
        <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #FFF3E0, #FFF8E1)", border: `1px solid ${dm ? "rgba(255,183,77,0.15)" : "#FFE0B2"}`, borderRadius: 16, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#FFB74D" : "#E65100", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🗓️ Reisedaten</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: t.text2, display: "block", marginBottom: 3 }}>Hinflug</label>
              <input type="date" value={data.tripDates.start} onChange={e => data.updateTripDates({ ...data.tripDates, start: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: t.text2, display: "block", marginBottom: 3 }}>Rückflug</label>
              <input type="date" value={data.tripDates.end} onChange={e => data.updateTripDates({ ...data.tripDates, end: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }} />
            </div>
          </div>
          {data.tripDates.start && data.tripDates.end && (
            <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: t.accent, fontWeight: 600 }}>
              🗓️ {Math.max(0, Math.ceil((new Date(data.tripDates.end) - new Date(data.tripDates.start)) / 86400000))} Tage · Saison: {currentSpot.season} · Wasser: {currentSpot.water} · Wetsuit: {currentSpot.wetsuit === "none" ? "Keiner nötig 🤙" : currentSpot.wetsuit}
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {currentSpot.tips?.map((tip, i) => (
              <div key={i} style={{ fontSize: 12, color: t.text2, padding: "4px 10px", background: dm ? "rgba(255,255,255,0.04)" : "#FFF8E1", borderRadius: 8, border: `1px dashed ${dm ? "#2d3f50" : "#FFE0B2"}` }}>💡 {tip}</div>
            ))}
          </div>
        </div>
      )}

      {/* Weather + Swell side by side */}
      {weather && (
        <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #E3F2FD, #E8EAF6)", border: `1px solid ${dm ? "rgba(66,165,245,0.15)" : "#BBDEFB"}`, borderRadius: 16, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#42A5F5" : "#1565C0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🌤️ Wetter · Aktuell</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 36 }}>{weatherLabel(weather.current?.code).emoji}</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text }}>{weather.current?.temp != null ? `${Math.round(weather.current.temp)}°C` : "–"}</div>
              <div style={{ fontSize: 12, color: t.text2 }}>{weatherLabel(weather.current?.code).label} · Wind: {weather.current?.windSpeed != null ? `${Math.round(weather.current.windSpeed)} km/h` : "–"} {windDirLabel(weather.current?.windDir)}</div>
            </div>
          </div>
          {weather.forecast && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
              {weather.forecast.map((day, i) => (
                <div key={i} style={{ flex: "0 0 auto", minWidth: 72, background: dm ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3 }}>{new Date(day.date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short" })}</div>
                  <div style={{ fontSize: 18 }}>{weatherLabel(day.code).emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{Math.round(day.tempMax)}°/{Math.round(day.tempMin)}°</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {weatherLoading && <div style={{ background: dm ? "rgba(30,45,61,0.5)" : "#E3F2FD", borderRadius: 14, padding: "10px 16px", marginBottom: 16, textAlign: "center", fontSize: 12, color: t.text2 }}>🌤️ Wetter wird geladen...</div>}

      {/* Swell */}
      {swell && swell.length > 0 && (
        <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #E8EAF6, #E3F2FD)", border: `1px solid ${dm ? "rgba(121,134,203,0.2)" : "#C5CAE9"}`, borderRadius: 16, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#7986CB" : "#3949AB", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🌊 Swell Forecast · 5 Tage</div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {swell.map((day, i) => {
              const rating = swellRating(day.waveHeight, day.wavePeriod);
              return (
                <div key={i} style={{ flex: "0 0 auto", minWidth: 72, background: dm ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3 }}>{new Date(day.date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric" })}</div>
                  {rating && <div style={{ fontSize: 16, marginBottom: 2 }}>{rating.emoji}</div>}
                  <div style={{ fontSize: 13, fontWeight: 700, color: rating?.color || t.text }}>{day.waveHeight != null ? `${day.waveHeight.toFixed(1)}m` : "–"}</div>
                  <div style={{ fontSize: 9, color: t.text3 }}>{day.wavePeriod != null ? `${Math.round(day.wavePeriod)}s` : ""} {day.waveDir != null ? windDirLabel(day.waveDir) : ""}</div>
                  {rating && <div style={{ fontSize: 9, color: rating.color, fontWeight: 600 }}>{rating.label}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Packing List */}
      {currentSpot && (
        <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "#F5F5F5", borderRadius: 16, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🎒 Packliste</div>
          {[
            { label: "Essentiell", items: PACKING_LIST.essential },
            { label: "Empfohlen", items: PACKING_LIST.recommended },
          ].map(group => {
            const filtered = group.items.filter(item => !item.condition || item.condition(currentSpot));
            if (filtered.length === 0) return null;
            return (
              <div key={group.label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text2, marginBottom: 6 }}>{group.label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {filtered.map(item => (
                    <button key={item.id} onClick={() => data.updateTripChecked(p => ({ ...p, [item.id]: !p[item.id] }))} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 10, fontSize: 12, cursor: "pointer",
                      background: data.tripChecked[item.id] ? (dm ? "rgba(0,150,136,0.2)" : "#E0F2F1") : t.inputBg,
                      border: `1px solid ${data.tripChecked[item.id] ? t.accent : t.inputBorder}`,
                      color: data.tripChecked[item.id] ? t.accent : t.text2,
                      textDecoration: data.tripChecked[item.id] ? "line-through" : "none", opacity: data.tripChecked[item.id] ? 0.7 : 1,
                    }}>
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 12, color: t.text3, marginTop: 6, fontFamily: "'Space Mono', monospace" }}>
            ✓ {Object.values(data.tripChecked).filter(Boolean).length} / {[...PACKING_LIST.essential, ...PACKING_LIST.recommended].filter(i => !i.condition || i.condition(currentSpot)).length} eingepackt
          </div>
        </div>
      )}

      {!data.hasSaved && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => navigate("builder")} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>🏄 Programm erstellen für deinen Trip</button>
        </div>
      )}
    </div>
  );
}
