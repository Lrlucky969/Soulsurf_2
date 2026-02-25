// SoulSurf – SurfScreen v6.6 (V1: Decision → Booking Flow)
// Replaces ForecastScreen as "Surf" tab target
// 3 Views: Spots | Schools | Forecast (toggle)
import React, { useState, useMemo } from "react";
import { SURF_SPOTS, SURF_SCHOOLS, getSchoolsBySpot } from "../data.js";
import { sortSpotsBySuitability, getSpotSuitability } from "../spotSuitability.js";
import useForecast from "../useForecast.js";
import { scoreLabel, windDirLabel, swellRating } from "../weather.js";
import { trackEvent } from "../analytics.js";

export default function SurfScreen({ data, t, dm, i18n, navigate }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [view, setView] = useState("spots"); // spots | schools | forecast
  const [selectedSpot, setSelectedSpot] = useState(data.spot || SURF_SPOTS[0]?.id);
  const [filterLevel, setFilterLevel] = useState("all"); // all | perfect | suitable
  const spotObj = SURF_SPOTS.find(s => s.id === selectedSpot) || SURF_SPOTS[0];

  // Forecast for selected spot
  const { conditions, loading: fcLoading, bestWindow, hourly } = useForecast(spotObj);

  // Sorted spots by suitability (always new array ref)
  const allSorted = useMemo(() => sortSpotsBySuitability(SURF_SPOTS, data.skillLevel), [data.skillLevel]);
  const filterCounts = useMemo(() => ({
    all: allSorted.length,
    perfect: allSorted.filter(s => s.suitability.level === "perfect").length,
    suitable: allSorted.filter(s => s.suitability.level !== "challenging").length,
  }), [allSorted]);
  const sortedSpots = useMemo(() => {
    switch (filterLevel) {
      case "perfect": return allSorted.filter(s => s.suitability.level === "perfect");
      case "suitable": return allSorted.filter(s => s.suitability.level !== "challenging");
      default: return [...allSorted];
    }
  }, [allSorted, filterLevel]);

  // Schools for current spot
  const spotSchools = useMemo(() => getSchoolsBySpot(selectedSpot), [selectedSpot]);

  // All schools with suitability
  const allSchools = useMemo(() => {
    return SURF_SCHOOLS.map(s => {
      const spot = SURF_SPOTS.find(sp => sp.id === s.spotId);
      return { ...s, spot, suitability: spot ? getSpotSuitability(spot, data.skillLevel) : null };
    });
  }, [data.skillLevel]);

  const card = { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, overflow: "hidden" };
  const sectionLabel = { fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 };

  // ═══ SPOTS VIEW ═══
  const renderSpots = () => (
    <div>
      {/* Skill filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          { id: "all", label: _("surf.all", "Alle"), count: filterCounts.all },
          { id: "perfect", label: "🟢 " + _("suit.perfect", "Perfekt"), count: filterCounts.perfect },
          { id: "suitable", label: "🟡 " + _("suit.suitable", "Geeignet"), count: filterCounts.suitable },
        ].map(f => (
          <button key={f.id} onClick={() => setFilterLevel(f.id)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: filterLevel === f.id ? (dm ? "rgba(0,150,136,0.15)" : "#E0F2F1") : t.inputBg,
            border: filterLevel === f.id ? `2px solid ${t.accent}` : `2px solid ${t.inputBorder}`,
            color: filterLevel === f.id ? t.accent : t.text2,
            fontFamily: "'Space Mono', monospace",
          }}>{f.label} ({f.count})</button>
        ))}
      </div>

      {/* Spot count */}
      <div style={{ ...sectionLabel, marginBottom: 8 }}>{sortedSpots.length} Spots</div>

      {/* Spot cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sortedSpots.map((spot, i) => {
          const suit = spot.suitability;
          const schools = getSchoolsBySpot(spot.id);
          const isSelected = spot.id === selectedSpot;
          return (
            <button key={spot.id} onClick={() => { setSelectedSpot(spot.id); setView("forecast"); }} style={{
              ...card, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              cursor: "pointer", textAlign: "left", width: "100%",
              border: isSelected ? `2px solid ${t.accent}` : `1px solid ${t.cardBorder}`,
              animation: "slideUp 0.3s ease both", animationDelay: `${Math.min(i, 8) * 40}ms`,
            }}>
              {/* Suitability badge */}
              <div style={{
                width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                background: `${suit.color}15`, fontSize: 20,
              }}>{spot.emoji}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{spot.name.split(",")[0]}</span>
                  <span style={{ fontSize: 10 }}>{suit.emoji}</span>
                </div>
                <div style={{ fontSize: 11, color: t.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {spot.waveType} · {spot.season}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${suit.color}12`, color: suit.color, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                    {_(suit.labelKey)}
                  </span>
                  {schools.length > 0 && (
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: dm ? "rgba(255,183,77,0.08)" : "#FFF8E1", color: dm ? "#FFB74D" : "#E65100", fontFamily: "'Space Mono', monospace" }}>
                      🏫 {schools.length}
                    </span>
                  )}
                  {spot.crowd && (
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: dm ? "rgba(255,255,255,0.05)" : "#F5F5F5", color: t.text3, fontFamily: "'Space Mono', monospace" }}>
                      {spot.crowd === "high" ? "👥 crowded" : spot.crowd === "low" ? "🏖️ quiet" : "👤 moderate"}
                    </span>
                  )}
                </div>
              </div>

              <span style={{ fontSize: 14, color: t.text3 }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ═══ SCHOOLS VIEW ═══
  const renderSchools = () => (
    <div>
      <div style={sectionLabel}>{allSchools.length} {_("surf.schools", "Surfschulen")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {allSchools.map((school, i) => (
          <button key={school.id} onClick={() => {
            trackEvent("decision_cta_clicked", { action: "browse_school", spot: school.spotId, source: "surf_schools_view" });
            navigate("schools", { spot: school.spotId });
          }} style={{
            ...card, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
            cursor: "pointer", textAlign: "left", width: "100%",
            animation: "slideUp 0.3s ease both", animationDelay: `${i * 50}ms`,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", fontSize: 20,
            }}>🏫</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: t.text }}>{school.name}</div>
              <div style={{ fontSize: 11, color: t.text2, marginTop: 2 }}>
                {school.spot?.emoji} {school.spot?.name?.split(",")[0]}
                {school.suitability && <span> · {school.suitability.emoji} {_(school.suitability.labelKey)}</span>}
              </div>
              {school.price && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.accent, marginTop: 2 }}>ab €{school.price}</div>}
            </div>
            <span style={{ fontSize: 14, color: t.text3 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ═══ FORECAST VIEW (for selected spot) ═══
  const renderForecast = () => {
    const suit = getSpotSuitability(spotObj, data.skillLevel);
    const sRating = conditions?.waveHeight != null ? swellRating(conditions.waveHeight, conditions.wavePeriod) : null;

    return (
      <div>
        {/* Spot header */}
        <div style={{ ...card, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>{spotObj.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: t.text }}>{spotObj.name}</div>
              <div style={{ fontSize: 12, color: t.text2 }}>{spotObj.waveType} · {spotObj.season}</div>
            </div>
            <div style={{ padding: "4px 10px", borderRadius: 8, background: `${suit.color}12`, border: `1px solid ${suit.color}30` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: suit.color }}>{suit.emoji} {_(suit.labelKey)}</span>
            </div>
          </div>
          {/* Hazards + info */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(spotObj.hazards || []).map(h => (
              <span key={h} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: dm ? "rgba(244,67,54,0.08)" : "#FFEBEE", color: "#E53935", fontFamily: "'Space Mono', monospace" }}>
                ⚠️ {h}
              </span>
            ))}
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: dm ? "rgba(255,255,255,0.05)" : "#F5F5F5", color: t.text3, fontFamily: "'Space Mono', monospace" }}>
              🌡️ {spotObj.water}
            </span>
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: dm ? "rgba(255,255,255,0.05)" : "#F5F5F5", color: t.text3, fontFamily: "'Space Mono', monospace" }}>
              🧥 {spotObj.wetsuit === "none" ? "Boardshorts" : spotObj.wetsuit}
            </span>
          </div>
        </div>

        {/* Current conditions */}
        {!conditions ? (
          <div style={{ ...card, padding: 20, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 24, marginBottom: 8, animation: fcLoading ? "float 2s ease-in-out infinite" : "none" }}>{fcLoading ? "🌊" : "⚠️"}</div>
            <div style={{ fontSize: 12, color: t.text2 }}>{fcLoading ? _("decision.noData") : _("surf.noConditions", "Keine Daten verfügbar")}</div>
            {!fcLoading && (
              <button onClick={() => setView("spots")} style={{ marginTop: 10, background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: t.accent, fontWeight: 700, cursor: "pointer" }}>
                ← {_("surf.allSpots")}
              </button>
            )}
          </div>
        ) : (
          <div style={{ ...card, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ ...sectionLabel }}>{_("decision.conditions", "Aktuelle Bedingungen")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>{_("decision.waves")}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: t.text }}>
                  {conditions.waveHeight?.toFixed(1) ?? "–"}<span style={{ fontSize: 11, fontWeight: 400 }}>m</span>
                </div>
                {sRating && <div style={{ fontSize: 10, color: sRating.color, fontWeight: 700 }}>{sRating.emoji} {sRating.label}</div>}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>{_("decision.wind")}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: t.text }}>
                  {conditions.wind != null ? Math.round(conditions.wind) : "–"}<span style={{ fontSize: 11, fontWeight: 400 }}>km/h</span>
                </div>
                {conditions.windDir != null && <div style={{ fontSize: 10, color: t.text3 }}>{windDirLabel(conditions.windDir)}</div>}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: t.text3 }}>Score</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: conditions.surfScore != null ? scoreLabel(conditions.surfScore).color : t.text3 }}>
                  {conditions.surfScore ?? "–"}
                </div>
                {conditions.surfScore != null && <div style={{ fontSize: 10, color: scoreLabel(conditions.surfScore).color, fontWeight: 700 }}>{scoreLabel(conditions.surfScore).emoji} {scoreLabel(conditions.surfScore).label}</div>}
              </div>
            </div>
            {/* Best window */}
            {bestWindow && bestWindow.score >= 50 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: dm ? "rgba(255,255,255,0.04)" : "#F5F5F5", borderRadius: 10 }}>
                <span style={{ fontSize: 14 }}>⏰</span>
                <span style={{ fontSize: 12, color: t.text2 }}>
                  {_("decision.bestWindow")}: <strong style={{ color: t.text }}>{bestWindow.hour}:00</strong> (Score {bestWindow.score})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {spotObj.tips && spotObj.tips.length > 0 && (
          <div style={{ ...card, padding: "14px 16px", marginBottom: 12 }}>
            <div style={sectionLabel}>{_("surf.tips", "Tipps")}</div>
            {spotObj.tips.map((tip, i) => (
              <div key={i} style={{ fontSize: 12, color: t.text2, lineHeight: 1.5, marginBottom: i < spotObj.tips.length - 1 ? 6 : 0, display: "flex", gap: 8 }}>
                <span style={{ color: t.accent }}>•</span> {tip}
              </div>
            ))}
          </div>
        )}

        {/* Schools at this spot */}
        {spotSchools.length > 0 && (
          <div style={{ ...card, padding: "14px 16px", marginBottom: 12 }}>
            <div style={sectionLabel}>🏫 {spotSchools.length} {_("surf.schoolsHere", "Schulen hier")}</div>
            {spotSchools.map(school => (
              <button key={school.id} onClick={() => {
                trackEvent("decision_cta_clicked", { action: "browse_school", spot: selectedSpot, source: "surf_forecast_view" });
                navigate("schools", { spot: selectedSpot });
              }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                background: "none", border: "none", borderBottom: `1px solid ${t.cardBorder}`,
                cursor: "pointer", textAlign: "left",
              }}>
                <span style={{ fontSize: 16 }}>🏫</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{school.name}</div>
                  {school.price && <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.accent }}>ab €{school.price}</div>}
                </div>
                <span style={{ fontSize: 12, color: t.accent, fontWeight: 700 }}>→</span>
              </button>
            ))}
          </div>
        )}

        {/* Back to spots */}
        <button onClick={() => setView("spots")} style={{
          width: "100%", padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer",
          background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text2,
          fontFamily: "'Space Mono', monospace",
        }}>← {_("surf.allSpots", "Alle Spots")}</button>
      </div>
    );
  };

  return (
    <div style={{ paddingTop: 20 }}>
      {/* Header */}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("surf.title", "Surf")}</h2>
      <p style={{ fontSize: 13, color: t.text2, marginBottom: 16 }}>{_("surf.subtitle", "Spots, Schulen & Bedingungen")}</p>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: dm ? "rgba(255,255,255,0.05)" : "#F5F5F5", borderRadius: 12, padding: 3 }}>
        {[
          { id: "spots", label: _("surf.spots", "Spots"), icon: "📍" },
          { id: "schools", label: _("surf.schools", "Schulen"), icon: "🏫" },
          { id: "forecast", label: _("surf.forecast", "Forecast"), icon: "🌊" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: view === tab.id ? (dm ? "rgba(0,150,136,0.15)" : "white") : "transparent",
            border: view === tab.id ? `1px solid ${dm ? "rgba(0,150,136,0.3)" : "#E0E0E0"}` : "1px solid transparent",
            color: view === tab.id ? t.accent : t.text2,
            fontFamily: "'Space Mono', monospace",
            boxShadow: view === tab.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            transition: "all 0.2s ease",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* View content */}
      {view === "spots" && renderSpots()}
      {view === "schools" && renderSchools()}
      {view === "forecast" && renderForecast()}
    </div>
  );
}
