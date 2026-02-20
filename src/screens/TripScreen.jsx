// SoulSurf – TripScreen 2.0 (Multi-Trip)
import React, { useState, useMemo } from "react";
import { SURF_SPOTS, LOCAL_POIS, PACKING_LIST, SURF_SCHOOLS, EXTRA_SPOTS, getAllSpots, formatPrice } from "../data.js";
import { useWeather, windDirLabel, weatherLabel, useSwell, swellRating } from "../weather.js";
import SpotMap from "../SpotMap.jsx";

export default function TripScreen({ data, t, dm, spotObj, navigate }) {
  const { trips, activeTrip, currentTrip, createTrip, updateTrip, deleteTrip, switchTrip, resetPackingList } = data;
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripSpot, setNewTripSpot] = useState("");
  const [spotSearch, setSpotSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [section, setSection] = useState("overview"); // overview | weather | packing

  // Determine current spot: trip spot > program spot > first spot
  const allSpots = getAllSpots();
  const tripSpot = currentTrip?.spot ? allSpots.find(s => s.id === currentTrip.spot) : null;
  const currentSpot = tripSpot || spotObj || allSpots[0];
  const { weather, loading: weatherLoading } = useWeather(currentSpot);
  const { swell } = useSwell(currentSpot);
  const filteredSpots = allSpots.filter(s => s.name.toLowerCase().includes(spotSearch.toLowerCase()));

  // Countdown
  const countdown = useMemo(() => {
    if (!currentTrip?.dates?.start) return null;
    const diff = Math.ceil((new Date(currentTrip.dates.start) - new Date()) / 86400000);
    if (diff < 0) return { text: "Läuft gerade!", emoji: "🏄", past: false };
    if (diff === 0) return { text: "Heute geht's los!", emoji: "🎉", past: false };
    return { text: `Noch ${diff} ${diff === 1 ? "Tag" : "Tage"}`, emoji: diff <= 7 ? "⏳" : "📅", past: false };
  }, [currentTrip]);

  // Packing stats
  const packingItems = [...PACKING_LIST.essential, ...PACKING_LIST.recommended].filter(i => !i.condition || i.condition(currentSpot));
  const checkedCount = Object.values(currentTrip?.checked || {}).filter(Boolean).length;
  const packingDone = packingItems.length > 0 && checkedCount >= packingItems.length;

  const handleCreateTrip = () => {
    if (!newTripName.trim()) return;
    createTrip(newTripName.trim(), newTripSpot);
    setNewTripName(""); setNewTripSpot(""); setShowNewTrip(false);
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>✈️ Trip planen</h2>

      {/* Trip Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {trips.map(tr => (
          <button key={tr.id} onClick={() => switchTrip(tr.id)} style={{
            padding: "8px 16px", borderRadius: 12, fontSize: 13, fontWeight: activeTrip === tr.id ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap",
            background: activeTrip === tr.id ? (dm ? "rgba(77,182,172,0.15)" : "#E0F2F1") : t.inputBg,
            color: activeTrip === tr.id ? t.accent : t.text2,
            border: `1.5px solid ${activeTrip === tr.id ? t.accent : t.inputBorder}`,
          }}>
            {tr.spot ? (allSpots.find(s => s.id === tr.spot)?.emoji || "✈️") : "✈️"} {tr.name}
          </button>
        ))}
        <button onClick={() => setShowNewTrip(true)} style={{ padding: "8px 14px", borderRadius: 12, fontSize: 18, cursor: "pointer", background: t.inputBg, color: t.accent, border: `1.5px dashed ${t.accent}`, minWidth: 40 }}>+</button>
      </div>

      {/* New Trip Form */}
      {showNewTrip && (
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "18px", marginBottom: 16, animation: "slideUp 0.3s ease both" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", marginBottom: 12 }}>✨ Neuer Trip</div>
          <input type="text" value={newTripName} onChange={e => setNewTripName(e.target.value)} placeholder="Trip-Name (z.B. Bali Oktober)" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, marginBottom: 10 }} autoFocus />
          <div style={{ fontSize: 12, fontWeight: 600, color: t.text2, marginBottom: 6 }}>Spot (optional)</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxHeight: 120, overflowY: "auto", marginBottom: 12 }}>
            {SURF_SPOTS.map(s => (
              <button key={s.id} onClick={() => setNewTripSpot(newTripSpot === s.id ? "" : s.id)} style={{
                padding: "4px 10px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                background: newTripSpot === s.id ? t.accent : t.inputBg, color: newTripSpot === s.id ? "white" : t.text3,
                border: `1px solid ${newTripSpot === s.id ? t.accent : t.inputBorder}`,
              }}>{s.emoji} {s.name.split(",")[0]}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCreateTrip} disabled={!newTripName.trim()} style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: newTripName.trim() ? "pointer" : "not-allowed", background: newTripName.trim() ? "linear-gradient(135deg, #009688, #4DB6AC)" : "#E0E0E0", color: newTripName.trim() ? "white" : "#9E9E9E", border: "none" }}>Trip anlegen</button>
            <button onClick={() => { setShowNewTrip(false); setNewTripName(""); setNewTripSpot(""); }} style={{ padding: "12px 18px", borderRadius: 12, fontSize: 14, cursor: "pointer", background: t.inputBg, color: t.text2, border: `1px solid ${t.inputBorder}` }}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* No Trips State */}
      {trips.length === 0 && !showNewTrip && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 12, animation: "float 4s ease-in-out infinite" }}>🗺️</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: t.text, marginBottom: 8 }}>Noch kein Trip geplant</h3>
          <p style={{ fontSize: 14, color: t.text2, marginBottom: 20 }}>Plane deinen nächsten Surf-Trip mit Karte, Wetter und Packliste.</p>
          <button onClick={() => setShowNewTrip(true)} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif" }}>Ersten Trip planen ✈️</button>
        </div>
      )}

      {/* Active Trip Content */}
      {currentTrip && (
        <>
          {/* Countdown + Summary Card */}
          <div style={{ background: "linear-gradient(135deg, #004D40, #00695C)", borderRadius: 18, padding: "18px 20px", color: "white", marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 60, opacity: 0.1 }}>✈️</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{currentTrip.name}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{currentSpot.emoji} {currentSpot.name}</div>
              </div>
              {countdown && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24 }}>{countdown.emoji}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700 }}>{countdown.text}</div>
                </div>
              )}
            </div>
            {currentTrip.dates.start && currentTrip.dates.end && (
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, opacity: 0.8 }}>
                <span>🗓️ {Math.max(0, Math.ceil((new Date(currentTrip.dates.end) - new Date(currentTrip.dates.start)) / 86400000))} Tage</span>
                <span>🌊 {currentSpot.water}</span>
                <span>👔 {currentSpot.wetsuit === "none" ? "Kein Wetsuit" : currentSpot.wetsuit}</span>
                <span>📅 {currentSpot.season}</span>
              </div>
            )}
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11 }}>🎒 {checkedCount}/{packingItems.length} {packingDone ? "✓" : ""}</div>
              {currentTrip.budget && <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11 }}>💰 {currentTrip.budget}€</div>}
            </div>
          </div>

          {/* Section Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[{ id: "overview", label: "📋 Details", }, { id: "weather", label: "🌤️ Wetter" }, { id: "packing", label: "🎒 Packliste" }].map(s => (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                flex: 1, padding: "10px 8px", borderRadius: 12, fontSize: 12, fontWeight: section === s.id ? 700 : 500, cursor: "pointer",
                background: section === s.id ? (dm ? t.accent : "#263238") : t.inputBg,
                color: section === s.id ? "white" : t.text2,
                border: `1px solid ${section === s.id ? "transparent" : t.inputBorder}`,
              }}>{s.label}</button>
            ))}
          </div>

          {/* Section: Overview */}
          {section === "overview" && (
            <div style={{ animation: "screenIn 0.25s ease both" }}>
              {/* Spot Switcher */}
              <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", marginBottom: 8 }}>🌍 Spot wechseln</div>
                <input type="text" value={spotSearch} onChange={e => setSpotSearch(e.target.value)} placeholder="🔍 Spot suchen..." style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxHeight: 120, overflowY: "auto" }}>
                  {filteredSpots.map(s => (
                    <button key={s.id} onClick={() => updateTrip(currentTrip.id, { spot: s.id })} style={{
                      padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      background: currentTrip.spot === s.id ? t.accent : t.inputBg, color: currentTrip.spot === s.id ? "white" : t.text2,
                      border: `1px solid ${currentTrip.spot === s.id ? t.accent : t.inputBorder}`,
                    }}>{s.emoji} {s.name.split(",")[0]}</button>
                  ))}
                </div>
              </div>

              {/* Dates + Budget */}
              <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #FFF3E0, #FFF8E1)", border: `1px solid ${dm ? "rgba(255,183,77,0.15)" : "#FFE0B2"}`, borderRadius: 16, padding: "14px 18px", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#FFB74D" : "#E65100", textTransform: "uppercase", marginBottom: 10 }}>🗓️ Reisedaten</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: t.text2, display: "block", marginBottom: 3 }}>Hinflug</label>
                    <input type="date" value={currentTrip.dates.start} onChange={e => updateTrip(currentTrip.id, { dates: { ...currentTrip.dates, start: e.target.value } })} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: t.text2, display: "block", marginBottom: 3 }}>Rückflug</label>
                    <input type="date" value={currentTrip.dates.end} onChange={e => updateTrip(currentTrip.id, { dates: { ...currentTrip.dates, end: e.target.value } })} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: t.text2, display: "block", marginBottom: 3 }}>💰 Budget (€)</label>
                    <input type="number" value={currentTrip.budget} onChange={e => updateTrip(currentTrip.id, { budget: e.target.value })} placeholder="z.B. 1500" style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: t.text2, display: "block", marginBottom: 3 }}>📝 Notizen</label>
                    <input type="text" value={currentTrip.notes} onChange={e => updateTrip(currentTrip.id, { notes: e.target.value })} placeholder="z.B. Board mieten" style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }} />
                  </div>
                </div>
              </div>

              {/* Map – merge LOCAL_POIS with SURF_SCHOOLS */}
              <SpotMap spot={currentSpot} pois={[
                ...(LOCAL_POIS[currentSpot.id] || []),
                ...SURF_SCHOOLS.filter(s => s.spotId === currentSpot.id).map(s => ({
                  name: s.name, type: "school", lat: s.location.lat, lng: s.location.lng,
                  desc: `⭐ ${s.rating} (${s.reviewCount}) · ab ${formatPrice(s.priceRange.from, s.priceRange.currency)}`,
                  schoolId: s.id,
                })),
              ]} dm={dm} navigate={navigate} />

              {/* Surfschulen an diesem Spot */}
              {(() => {
                const spotSchools = SURF_SCHOOLS.filter(s => s.spotId === currentSpot.id);
                if (spotSchools.length === 0) return null;
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🏫 Surfschulen an diesem Spot</div>
                    {spotSchools.map(school => (
                      <button key={school.id} onClick={() => navigate("schools")} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, marginBottom: 6, cursor: "pointer", textAlign: "left",
                        background: dm ? "rgba(0,150,136,0.06)" : "#E0F2F1", border: `1px solid ${dm ? "rgba(0,150,136,0.12)" : "#B2DFDB"}`,
                      }}>
                        <span style={{ fontSize: 22 }}>{school.logo}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{school.name} {school.verified ? "✓" : ""}</div>
                          <div style={{ fontSize: 11, color: t.text2 }}>⭐ {school.rating} · ab {formatPrice(school.priceRange.from, school.priceRange.currency)}</div>
                        </div>
                        <span style={{ fontSize: 13, color: t.accent }}>→</span>
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Spot Info */}
              {currentSpot.tips?.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {currentSpot.tips.map((tip, i) => (
                    <div key={i} style={{ fontSize: 12, color: t.text2, padding: "4px 10px", background: dm ? "rgba(255,255,255,0.04)" : "#FFF8E1", borderRadius: 8, border: `1px dashed ${dm ? "#2d3f50" : "#FFE0B2"}` }}>💡 {tip}</div>
                  ))}
                </div>
              )}

              {/* Danger Zone */}
              <div style={{ borderTop: `1px dashed ${dm ? "#2d3f50" : "#E0E0E0"}`, paddingTop: 16, display: "flex", gap: 8 }}>
                <button onClick={() => setShowDeleteConfirm(currentTrip.id)} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, cursor: "pointer", background: dm ? "rgba(229,57,53,0.1)" : "#FFEBEE", color: "#E53935", border: `1px solid ${dm ? "rgba(229,57,53,0.3)" : "#FFCDD2"}` }}>🗑 Trip löschen</button>
              </div>
              {showDeleteConfirm === currentTrip.id && (
                <div style={{ background: dm ? "#2d2010" : "#FFF3E0", border: "2px solid #FFB74D", borderRadius: 14, padding: "14px", marginTop: 10, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: dm ? "#e8eaed" : "#4E342E", marginBottom: 10 }}>"{currentTrip.name}" wirklich löschen?</p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button onClick={() => { deleteTrip(currentTrip.id); setShowDeleteConfirm(null); }} style={{ background: "#E53935", color: "white", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Ja, löschen</button>
                    <button onClick={() => setShowDeleteConfirm(null)} style={{ background: "#ECEFF1", color: "#546E7A", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>Abbrechen</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Weather + Swell */}
          {section === "weather" && (
            <div style={{ animation: "screenIn 0.25s ease both" }}>
              {weatherLoading && <div style={{ background: dm ? "rgba(30,45,61,0.5)" : "#E3F2FD", borderRadius: 14, padding: "14px 16px", marginBottom: 16, textAlign: "center", fontSize: 13, color: t.text2 }}>🌤️ Wetter wird geladen...</div>}
              {weather && (
                <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #E3F2FD, #E8EAF6)", border: `1px solid ${dm ? "rgba(66,165,245,0.15)" : "#BBDEFB"}`, borderRadius: 16, padding: "14px 18px", marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: dm ? "#42A5F5" : "#1565C0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🌤️ Aktuelles Wetter · {currentSpot.name}</div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 42 }}>{weatherLabel(weather.current?.code).emoji}</span>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: t.text }}>{weather.current?.temp != null ? `${Math.round(weather.current.temp)}°C` : "–"}</div>
                      <div style={{ fontSize: 13, color: t.text2 }}>{weatherLabel(weather.current?.code).label}</div>
                      <div style={{ fontSize: 12, color: t.text3 }}>Wind: {weather.current?.windSpeed != null ? `${Math.round(weather.current.windSpeed)} km/h` : "–"} {windDirLabel(weather.current?.windDir)}</div>
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
              {swell && swell.length > 0 && (
                <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "linear-gradient(135deg, #E8EAF6, #E3F2FD)", border: `1px solid ${dm ? "rgba(121,134,203,0.2)" : "#C5CAE9"}`, borderRadius: 16, padding: "14px 18px" }}>
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
            </div>
          )}

          {/* Section: Packing List */}
          {section === "packing" && (
            <div style={{ animation: "screenIn 0.25s ease both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: t.accent, fontWeight: 700 }}>
                  {packingDone ? "✅ Alles eingepackt!" : `${checkedCount} / ${packingItems.length} eingepackt`}
                </div>
                {checkedCount > 0 && (
                  <button onClick={() => resetPackingList(currentTrip.id)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", background: dm ? "rgba(229,57,53,0.1)" : "#FFEBEE", color: "#E53935", border: `1px solid ${dm ? "rgba(229,57,53,0.2)" : "#FFCDD2"}` }}>↺ Reset</button>
                )}
              </div>
              {/* Progress bar */}
              <div style={{ background: dm ? "rgba(255,255,255,0.1)" : "#E0E0E0", borderRadius: 8, height: 6, overflow: "hidden", marginBottom: 16 }}>
                <div style={{ background: packingDone ? "#4CAF50" : "linear-gradient(90deg, #FFB74D, #FF7043)", height: "100%", borderRadius: 8, width: `${packingItems.length > 0 ? (checkedCount / packingItems.length) * 100 : 0}%`, transition: "width 0.4s ease" }} />
              </div>
              {[{ label: "Essentiell", items: PACKING_LIST.essential }, { label: "Empfohlen", items: PACKING_LIST.recommended }].map(group => {
                const filtered = group.items.filter(item => !item.condition || item.condition(currentSpot));
                if (filtered.length === 0) return null;
                return (
                  <div key={group.label} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.text2, marginBottom: 8 }}>{group.label}</div>
                    {filtered.map(item => {
                      const checked = currentTrip.checked?.[item.id];
                      return (
                        <button key={item.id} onClick={() => updateTrip(currentTrip.id, { checked: { ...currentTrip.checked, [item.id]: !checked } })} style={{
                          display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 12, marginBottom: 6, cursor: "pointer", textAlign: "left",
                          background: checked ? (dm ? "rgba(0,150,136,0.1)" : "#E0F2F1") : t.inputBg,
                          border: `1px solid ${checked ? t.accent : t.inputBorder}`, transition: "all 0.2s ease",
                        }}>
                          <span style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? "#4DB6AC" : t.inputBorder}`, background: checked ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white", transition: "all 0.2s ease" }}>{checked ? "✓" : ""}</span>
                          <span style={{ fontSize: 18 }}>{item.emoji}</span>
                          <span style={{ fontSize: 14, color: checked ? t.text3 : t.text, fontWeight: 500, textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
