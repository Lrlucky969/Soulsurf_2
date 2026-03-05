// SoulSurf – SchoolsScreen v7.5.6 (Design Upgrade Part 3: Fonts + Colors)
// Merges v6.7 UX (inline expand, hero badge, decision context, includes/meetingPoint)
// with v6.0 Stripe Checkout flow (real payments, success/cancelled states)
import React, { useState, useMemo, useEffect } from "react";
import { SURF_SCHOOLS, SURF_SPOTS, getSchoolsBySpot, getAllSpots, formatPrice, LANG_LABELS } from "../data.js";
import { getSpotSuitability } from "../spotSuitability.js";
import { trackEvent } from "../analytics.js";
import useForecast from "../useForecast.js";
import { redirectToCheckout, priceToCents, checkBookingReturn } from "../stripe.js";

function StarRating({ rating, size = 14 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return <span style={{ fontSize: size, letterSpacing: 1 }}>{"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}</span>;
}

export default function SchoolsScreen({ data, t, dm, i18n, navigate, navParams, spotObj: homeSpot }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [selectedSpot, setSelectedSpot] = useState(navParams?.spot || data.spot || "portugal");
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [bookingStep, setBookingStep] = useState(0); // 0=browse, 1=detail, 3=form
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", date: "", people: 1, message: "" });
  const [bookingStatus, setBookingStatus] = useState(null); // null | "loading" | "success" | "cancelled" | "error" | "request_sent"
  const [bookingError, setBookingError] = useState(null);
  const fromDecision = navParams?.fromDecision || false;
  const decisionReason = navParams?.reason || null;

  useEffect(() => {
    if (navParams?.spot) setSelectedSpot(navParams.spot);
  }, [navParams?.spot]);

  // v7.1: Check for Stripe return on mount
  useEffect(() => {
    const result = checkBookingReturn();
    if (result) {
      setBookingStatus(result.status);
      if (result.status === "success") {
        trackEvent("booking_payment_success", { sessionId: result.sessionId });
      } else if (result.status === "cancelled") {
        trackEvent("booking_payment_cancelled", {});
      }
    }
  }, []);

  const allSpots = useMemo(() => getAllSpots(), []);
  const spotsWithSchools = useMemo(() => {
    const schoolSpotIds = new Set(SURF_SCHOOLS.map(s => s.spotId));
    return allSpots.filter(s => schoolSpotIds.has(s.id));
  }, [allSpots]);
  const schools = useMemo(() => getSchoolsBySpot(selectedSpot), [selectedSpot]);
  const spot = allSpots.find(s => s.id === selectedSpot);
  const suitability = useMemo(() => spot ? getSpotSuitability(spot, data.skillLevel) : null, [spot, data.skillLevel]);

  // Mini-forecast for selected spot
  const spotObj = SURF_SPOTS.find(s => s.id === selectedSpot);
  const { conditions } = useForecast(spotObj);

  // Style helpers
  const card = { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, overflow: "hidden" };
  const label = { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em" };

  const resetBooking = () => {
    setBookingStatus(null); setBookingError(null); setBookingStep(0);
    setExpandedSchool(null); setSelectedCourse(null);
    setBookingForm({ name: "", email: "", date: "", people: 1, message: "" });
  };

  // v7.1: Real Stripe payment
  const handlePayment = async () => {
    if (!expandedSchool || !selectedCourse || !bookingForm.name || !bookingForm.email || !bookingForm.date) return;
    setBookingStatus("loading");
    setBookingError(null);

    trackEvent("booking_started", {
      school: expandedSchool.id, course: selectedCourse.id,
      spot: selectedSpot, fromDecision, people: bookingForm.people,
      method: "stripe",
    });

    try {
      await redirectToCheckout({
        schoolName: expandedSchool.name,
        schoolId: expandedSchool.id,
        courseName: selectedCourse.name,
        courseId: selectedCourse.id,
        pricePerPerson: priceToCents(selectedCourse.price),
        currency: expandedSchool.priceRange?.currency || "eur",
        people: bookingForm.people,
        date: bookingForm.date,
        customerName: bookingForm.name,
        customerEmail: bookingForm.email,
        message: bookingForm.message,
        locale: i18n?.lang || "de",
      });
    } catch (err) {
      setBookingStatus("error");
      setBookingError(err.i18nKey ? _(err.i18nKey, err.message) : err.message);
      trackEvent("booking_payment_error", { error: err.message });
    }
  };

  // v7.1: Fallback booking request (no payment)
  const sendBookingRequest = () => {
    trackEvent("booking_started", {
      school: expandedSchool?.id, course: selectedCourse?.id,
      spot: selectedSpot, fromDecision, people: bookingForm.people,
      method: "request_only",
    });
    trackEvent("booking_completed", {
      school: expandedSchool?.id, course: selectedCourse?.id,
      spot: selectedSpot, fromDecision, method: "request_only",
    });
    setBookingStatus("request_sent");
    setTimeout(resetBooking, 3500);
  };

  // ═══ PAYMENT SUCCESS (Stripe return) ═══
  if (bookingStatus === "success") {
    return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "screenIn 0.4s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🎉</div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 8 }}>{_("pay.success")}</h2>
        <p style={{ fontSize: 14, color: t.text2, maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>{_("pay.successDesc")}</p>
        <div style={{ marginTop: 24, background: dm ? "rgba(14,165,233,0.1)" : "#E0F2FE", borderRadius: 16, padding: "16px", maxWidth: 320, margin: "16px auto 0" }}>
          <div style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>{_("pay.confirmEmail")}</div>
        </div>
        <button onClick={resetBooking} style={{ marginTop: 24, background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, padding: "12px 24px", color: t.text2, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ← {_("schools.allSchools")}
        </button>
      </div>
    );
  }

  // ═══ PAYMENT CANCELLED (Stripe return) ═══
  if (bookingStatus === "cancelled") {
    return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "screenIn 0.4s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>↩️</div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 8 }}>{_("pay.cancelled")}</h2>
        <p style={{ fontSize: 14, color: t.text2, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.6 }}>{_("pay.cancelledDesc")}</p>
        <button onClick={resetBooking} style={{ background: "linear-gradient(135deg, #0EA5E9, #38BDF8)", color: "white", border: "none", borderRadius: 14, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{_("pay.tryAgain")}</button>
      </div>
    );
  }

  // ═══ REQUEST SENT (non-payment fallback) ═══
  if (bookingStatus === "request_sent") {
    return (
      <div style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>✅</div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 8 }}>{_("schools.requestSent")}</h2>
        <p style={{ fontSize: 14, color: t.text2, maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
          {expandedSchool?.name} {_("schools.notified", "wurde benachrichtigt.")}
        </p>
        <button onClick={resetBooking} style={{ marginTop: 24, background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, padding: "12px 24px", color: t.text2, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ← {_("schools.allSchools")}
        </button>
      </div>
    );
  }

  // ═══ BOOKING FORM (v7.1: Stripe + Request dual-button) ═══
  if (bookingStep === 3 && expandedSchool && selectedCourse) {
    const totalPrice = selectedCourse.price * bookingForm.people;
    const isReady = bookingForm.name && bookingForm.email && bookingForm.date;
    return (
      <div style={{ paddingTop: 24 }}>
        <button onClick={() => setBookingStep(1)} style={{ background: "none", border: "none", color: t.accent, fontSize: 13, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>← {_("schools.backToProfile")}</button>

        {/* Header with school context */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: dm ? "rgba(14,165,233,0.1)" : "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, overflow: "hidden" }}>
            {expandedSchool.image ? <img src={expandedSchool.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : expandedSchool.logo}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: t.text, margin: 0 }}>{_("pay.checkout")}</h2>
            <p style={{ fontSize: 12, color: t.text2, margin: 0 }}>{expandedSchool.name} · {selectedCourse.name}</p>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "name", label: _("schools.name"), type: "text", placeholder: _("schools.namePh", "Dein Name") },
            { key: "email", label: _("schools.email"), type: "email", placeholder: "name@email.com" },
            { key: "date", label: _("schools.date"), type: "date" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.text2, display: "block", marginBottom: 3 }}>{f.label}</label>
              <input type={f.type} value={bookingForm[f.key]} onChange={e => setBookingForm({ ...bookingForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, boxSizing: "border-box" }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.text2, display: "block", marginBottom: 3 }}>{_("schools.people")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setBookingForm({ ...bookingForm, people: Math.max(1, bookingForm.people - 1) })} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 18, cursor: "pointer" }}>−</button>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: t.text, minWidth: 24, textAlign: "center" }}>{bookingForm.people}</span>
              <button onClick={() => setBookingForm({ ...bookingForm, people: Math.min(8, bookingForm.people + 1) })} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 18, cursor: "pointer" }}>+</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.text2, display: "block", marginBottom: 3 }}>{_("schools.message")}</label>
            <textarea value={bookingForm.message} onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })} rows={2} placeholder="..." style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Price Summary */}
        <div style={{ background: dm ? "rgba(14,165,233,0.1)" : "#E0F2FE", borderRadius: 16, padding: "16px", marginTop: 14, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: t.text2 }}>{selectedCourse.name} × {bookingForm.people}</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: t.accent }}>{formatPrice(totalPrice, expandedSchool.priceRange.currency)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 11, color: t.text3 }}>{_("pay.secureStripe")}</span>
          </div>
        </div>

        {/* Error message */}
        {bookingError && (
          <div style={{ background: dm ? "rgba(229,57,53,0.1)" : "#FFEBEE", border: "1px solid #FFCDD2", borderRadius: 12, padding: "10px 14px", marginBottom: 8, fontSize: 12, color: "#E53935" }}>{bookingError}</div>
        )}

        {/* v7.1: Primary CTA – Stripe Payment */}
        <button onClick={handlePayment} disabled={!isReady || bookingStatus === "loading"} style={{
          width: "100%", padding: "16px", borderRadius: 16, fontSize: 16, fontWeight: 700,
          cursor: isReady && bookingStatus !== "loading" ? "pointer" : "not-allowed",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: isReady && bookingStatus !== "loading" ? "linear-gradient(135deg, #0EA5E9, #00796B)" : "#BDBDBD",
          color: "white", border: "none",
          boxShadow: isReady ? "0 6px 20px rgba(14,165,233,0.3)" : "none",
          marginBottom: 8,
        }}>
          {bookingStatus === "loading" ? _("pay.processing") : `${_("pay.payNow")} · ${formatPrice(totalPrice, expandedSchool.priceRange.currency)}`}
        </button>

        {/* v7.1: Secondary CTA – Request only (no payment) */}
        <button onClick={sendBookingRequest} disabled={!isReady} style={{
          width: "100%", padding: "12px", borderRadius: 12, fontSize: 13,
          cursor: isReady ? "pointer" : "not-allowed",
          background: "transparent", color: isReady ? t.accent : t.text3,
          border: `1px solid ${isReady ? t.accent : t.inputBorder}`,
        }}>{_("pay.requestOnly")}</button>

        <p style={{ fontSize: 10, color: t.text3, textAlign: "center", marginTop: 8 }}>{_("pay.cancellationNote")}</p>
      </div>
    );
  }

  // ═══ SCHOOL FINDER (Browse + Inline Detail) ═══
  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("schools.title")}</h2>
      <p style={{ fontSize: 13, color: t.text2, marginBottom: 14 }}>{_("schools.subtitle")}</p>

      {/* Contextual banner from Decision Engine */}
      {fromDecision && (
        <div style={{
          background: "linear-gradient(135deg, rgba(255,152,0,0.08), rgba(255,112,67,0.08))",
          border: "1px solid rgba(255,152,0,0.2)", borderRadius: 14, padding: "12px 16px", marginBottom: 12,
          animation: "slideUp 0.3s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15 }}>🏫</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#E65100" }}>{_("schools.decisionBanner")}</span>
          </div>
          <div style={{ fontSize: 11, color: t.text2, lineHeight: 1.5 }}>
            {decisionReason ? _(decisionReason) : _("schools.decisionDesc")}
          </div>
        </div>
      )}

      {/* Spot selector */}
      <select value={selectedSpot} onChange={e => { setSelectedSpot(e.target.value); setExpandedSchool(null); }} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        {spotsWithSchools.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
      </select>

      {/* Spot context card with image */}
      {spot && (
        <div style={{ ...card, padding: 0, marginBottom: 14, overflow: "hidden" }}>
          {spot.image && (
            <div style={{ height: 100, position: "relative", overflow: "hidden" }}>
              <img src={spot.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 8, left: 12, right: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{spot.name.split(",")[0]}</div>
                  {conditions ? (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {conditions.waveHeight?.toFixed(1)}m · {conditions.wind != null ? Math.round(conditions.wind) : "–"}km/h · {conditions.temp != null ? Math.round(conditions.temp) : "–"}°
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{spot.waveType} · {spot.season}</div>
                  )}
                </div>
                {suitability && (
                  <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: `${suitability.color}25`, backdropFilter: "blur(6px)", color: suitability.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{suitability.emoji} {_(suitability.labelKey)}</span>
                )}
              </div>
            </div>
          )}
          {!spot.image && (
            <div style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 24 }}>{spot.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{spot.name.split(",")[0]}</span>
                  {suitability && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: `${suitability.color}12`, color: suitability.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{suitability.emoji} {_(suitability.labelKey)}</span>}
                </div>
                {conditions && (
                  <div style={{ fontSize: 10, color: t.text2, fontFamily: "'JetBrains Mono', monospace" }}>
                    🌊 {conditions.waveHeight?.toFixed(1)}m · 💨 {conditions.wind != null ? Math.round(conditions.wind) : "–"}km/h · 🌡️ {conditions.temp != null ? Math.round(conditions.temp) : "–"}°
                  </div>
                )}
                {!conditions && <div style={{ fontSize: 10, color: t.text3 }}>{spot.waveType} · {spot.season}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {schools.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", ...card }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, color: t.text, marginBottom: 8 }}>{_("schools.noSchools")}</h3>
          <p style={{ fontSize: 12, color: t.text2 }}>{_("schools.noSchoolsDesc", "Hier gibt es noch keine Schulen.")}</p>
        </div>
      )}

      {/* ═══ SCHOOL CARDS ═══ */}
      {schools.map((school, i) => {
        const isExpanded = expandedSchool?.id === school.id;
        const levelMatch = suitability?.level === "perfect" ? _("schools.perfectMatch", "Perfekt für dich") : suitability?.level === "suitable" ? _("schools.goodMatch", "Geeignet") : null;

        return (
          <div key={school.id} style={{
            ...card, marginBottom: 12,
            border: isExpanded ? `2px solid ${t.accent}` : `1px solid ${t.cardBorder}`,
            animation: "slideUp 0.3s ease both", animationDelay: `${i * 50}ms`,
          }}>
            <button onClick={() => setExpandedSchool(isExpanded ? null : school)} style={{
              width: "100%", display: "flex", gap: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left",
              background: "transparent", border: "none", color: "inherit",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: dm ? "rgba(14,165,233,0.1)" : "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
                {school.image ? <img src={school.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : school.logo}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{school.name}</span>
                  {school.verified && <span style={{ fontSize: 9, color: "#4CAF50", fontWeight: 700 }}>✓</span>}
                </div>
                {levelMatch && (
                  <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: `${suitability.color}10`, color: suitability.color, fontWeight: 700, display: "inline-block", marginBottom: 3 }}>
                    {suitability.emoji} {levelMatch}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#FFA000" }}><StarRating rating={school.rating} size={10} /> {school.rating}</span>
                  <span style={{ fontSize: 10, color: t.text3 }}>({school.reviewCount})</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, alignSelf: "center" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: t.accent }}>{formatPrice(school.priceRange.from, school.priceRange.currency)}</div>
                <div style={{ fontSize: 9, color: t.text3 }}>{isExpanded ? "▲" : "▼"}</div>
              </div>
            </button>

            {isExpanded && (
              <div style={{ padding: "0 16px 16px", animation: "slideUp 0.2s ease both" }}>
                <div style={{ height: 1, background: t.cardBorder, marginBottom: 12 }} />
                {school.about && <p style={{ fontSize: 12, color: t.text2, lineHeight: 1.6, marginBottom: 10 }}>{school.about}</p>}
                {school.description && <p style={{ fontSize: 12, color: t.text2, lineHeight: 1.6, marginBottom: 10 }}>{school.description}</p>}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {school.highlights?.map(h => (
                    <span key={h} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: dm ? "rgba(14,165,233,0.06)" : "#E8F5E9", color: t.accent, fontWeight: 600 }}>✓ {h}</span>
                  ))}
                </div>
                {school.includes && school.includes.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ ...label, marginBottom: 4 }}>{_("schools.includes", "Inklusive")}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {school.includes.map(inc => (
                        <span key={inc} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: dm ? "rgba(255,255,255,0.04)" : "#F5F5F5", color: t.text2 }}>📦 {inc}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ ...label, alignSelf: "center", marginBottom: 0 }}>🗣️</span>
                  {school.languages.map(l => (
                    <span key={l} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: t.inputBg, color: t.text2 }}>{LANG_LABELS[l] || l.toUpperCase()}</span>
                  ))}
                </div>
                {school.meetingPoint && (
                  <div style={{ fontSize: 11, color: t.text2, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span>📍</span> <span>{school.meetingPoint}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {school.contact?.phone && <span style={{ fontSize: 11, color: t.text2 }}>📱 {school.contact.phone}</span>}
                  {school.contact?.instagram && <span style={{ fontSize: 11, color: t.accent, fontWeight: 600 }}>📸 {school.contact.instagram}</span>}
                </div>
                <div style={{ ...label, marginBottom: 8 }}>{_("schools.courses")}</div>
                {school.courses.map(course => (
                  <div key={course.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, marginBottom: 6,
                    background: dm ? "rgba(255,255,255,0.02)" : "#FAFAFA", border: `1px solid ${t.cardBorder}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{course.name}</div>
                      <div style={{ fontSize: 10, color: t.text2, marginTop: 1 }}>{course.duration} · {course.groupSize}</div>
                      {course.description && <div style={{ fontSize: 10, color: t.text3, marginTop: 1 }}>{course.description}</div>}
                    </div>
                    <button onClick={() => { setSelectedCourse(course); setBookingStep(3); }} style={{
                      flexShrink: 0, padding: "10px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #0EA5E9, #38BDF8)", color: "white",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700,
                      boxShadow: "0 4px 12px rgba(14,165,233,0.25)",
                    }}>
                      {formatPrice(course.price, school.priceRange.currency)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
