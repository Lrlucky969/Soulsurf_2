// SoulSurf – SchoolsScreen v6.0 (Sprint 29 – Stripe Payment)
import React, { useState, useMemo, useEffect } from "react";
import { SURF_SCHOOLS, SURF_SPOTS, getSchoolsBySpot, getAllSpots, formatPrice, LANG_LABELS } from "../data.js";
import { redirectToCheckout, priceToCents, checkBookingReturn } from "../stripe.js";

function StarRating({ rating, size = 14 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return <span style={{ fontSize: size, letterSpacing: 1 }}>{"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}</span>;
}

export default function SchoolsScreen({ data, t, dm, i18n, navigate }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [selectedSpot, setSelectedSpot] = useState(data.spot || "portugal");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", date: "", people: 1, message: "" });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [showTip, setShowTip] = useState(() => {
    try { return !JSON.parse(localStorage.getItem("soulsurf_tooltips") || "{}")["schools-intro"]; } catch { return true; }
  });

  const allSpots = useMemo(() => getAllSpots(), []);
  const spotsWithSchools = useMemo(() => {
    const schoolSpotIds = new Set(SURF_SCHOOLS.map(s => s.spotId));
    return allSpots.filter(s => schoolSpotIds.has(s.id));
  }, [allSpots]);
  const schools = useMemo(() => getSchoolsBySpot(selectedSpot), [selectedSpot]);
  const spot = allSpots.find(s => s.id === selectedSpot);

  useEffect(() => {
    const result = checkBookingReturn();
    if (result) {
      setBookingStatus(result.status);
      if (result.status === "success") setTimeout(() => setBookingStatus(null), 5000);
    }
  }, []);

  const dismissTip = () => {
    setShowTip(false);
    try { const tt = JSON.parse(localStorage.getItem("soulsurf_tooltips") || "{}"); tt["schools-intro"] = true; localStorage.setItem("soulsurf_tooltips", JSON.stringify(tt)); } catch {}
  };

  const handlePayment = async () => {
    if (!selectedSchool || !selectedCourse || !bookingForm.name || !bookingForm.email || !bookingForm.date) return;
    setBookingStatus("loading");
    setBookingError(null);
    try {
      await redirectToCheckout({
        schoolName: selectedSchool.name, schoolId: selectedSchool.id,
        courseName: selectedCourse.name, courseId: selectedCourse.id,
        pricePerPerson: priceToCents(selectedCourse.price),
        currency: selectedSchool.priceRange.currency || "eur",
        people: bookingForm.people, date: bookingForm.date,
        customerName: bookingForm.name, customerEmail: bookingForm.email,
        message: bookingForm.message, locale: i18n?.lang || "de",
      });
    } catch (err) {
      setBookingStatus("error");
      setBookingError(err.message);
    }
  };

  const sendBookingRequest = () => {
    setBookingStatus("success");
    setTimeout(() => { setBookingStatus(null); setBookingStep(0); setSelectedSchool(null); setSelectedCourse(null); setBookingForm({ name: "", email: "", date: "", people: 1, message: "" }); }, 4000);
  };

  // === SUCCESS ===
  if (bookingStatus === "success") {
    return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "screenIn 0.4s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, color: t.text, marginBottom: 8 }}>{_("pay.success")}</h2>
        <p style={{ fontSize: 14, color: t.text2, maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>{_("pay.successDesc")}</p>
        <div style={{ marginTop: 24, background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", borderRadius: 16, padding: "16px", maxWidth: 320, margin: "16px auto 0" }}>
          <div style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>{_("pay.confirmEmail")}</div>
        </div>
      </div>
    );
  }

  // === CANCELLED ===
  if (bookingStatus === "cancelled") {
    return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "screenIn 0.4s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>↩️</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 8 }}>{_("pay.cancelled")}</h2>
        <p style={{ fontSize: 14, color: t.text2, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.6 }}>{_("pay.cancelledDesc")}</p>
        <button onClick={() => setBookingStatus(null)} style={{ background: "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", borderRadius: 14, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{_("pay.tryAgain")}</button>
      </div>
    );
  }

  // === CHECKOUT FORM ===
  if (bookingStep === 3 && selectedSchool && selectedCourse) {
    const totalPrice = selectedCourse.price * bookingForm.people;
    const isReady = bookingForm.name && bookingForm.email && bookingForm.date;
    return (
      <div style={{ paddingTop: 24, animation: "screenIn 0.25s ease both" }}>
        <button onClick={() => setBookingStep(1)} style={{ background: "none", border: "none", color: t.accent, fontSize: 13, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>{_("schools.backToProfile")}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{selectedSchool.logo}</div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: t.text, margin: 0 }}>{_("pay.checkout")}</h2>
            <p style={{ fontSize: 12, color: t.text2, margin: 0 }}>{selectedSchool.name} · {selectedCourse.name}</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "name", label: _("schools.name"), type: "text", placeholder: "Max Mustermann" },
            { key: "email", label: _("schools.email"), type: "email", placeholder: "name@email.com" },
            { key: "date", label: _("schools.date"), type: "date" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} value={bookingForm[f.key]} onChange={e => setBookingForm({ ...bookingForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14 }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>{_("schools.people")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setBookingForm({ ...bookingForm, people: Math.max(1, bookingForm.people - 1) })} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 18, cursor: "pointer" }}>−</button>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: t.text, minWidth: 24, textAlign: "center" }}>{bookingForm.people}</span>
              <button onClick={() => setBookingForm({ ...bookingForm, people: Math.min(8, bookingForm.people + 1) })} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 18, cursor: "pointer" }}>+</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>{_("schools.message")}</label>
            <textarea value={bookingForm.message} onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })} rows={3} placeholder="..." style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, resize: "vertical" }} />
          </div>
        </div>

        {/* Price Summary */}
        <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", borderRadius: 16, padding: "16px", marginTop: 16, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: t.text2 }}>{selectedCourse.name} × {bookingForm.people}</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: t.accent }}>{formatPrice(totalPrice, selectedSchool.priceRange.currency)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 11, color: t.text3 }}>{_("pay.secureStripe")}</span>
          </div>
        </div>

        {bookingError && (
          <div style={{ background: dm ? "rgba(229,57,53,0.1)" : "#FFEBEE", border: "1px solid #FFCDD2", borderRadius: 12, padding: "10px 14px", marginBottom: 8, fontSize: 12, color: "#E53935" }}>{bookingError}</div>
        )}

        <button onClick={handlePayment} disabled={!isReady || bookingStatus === "loading"} style={{
          width: "100%", padding: "16px", borderRadius: 16, fontSize: 16, fontWeight: 700,
          cursor: isReady && bookingStatus !== "loading" ? "pointer" : "not-allowed",
          fontFamily: "'Playfair Display', serif",
          background: isReady && bookingStatus !== "loading" ? "linear-gradient(135deg, #009688, #00796B)" : "#BDBDBD",
          color: "white", border: "none", boxShadow: isReady ? "0 6px 20px rgba(0,150,136,0.3)" : "none", marginBottom: 8,
        }}>
          {bookingStatus === "loading" ? _("pay.processing") : `${_("pay.payNow")} · ${formatPrice(totalPrice, selectedSchool.priceRange.currency)}`}
        </button>

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

  // === SCHOOL PROFILE ===
  if (bookingStep >= 1 && selectedSchool) {
    const school = selectedSchool;
    return (
      <div style={{ paddingTop: 24, animation: "screenIn 0.25s ease both" }}>
        <button onClick={() => { setBookingStep(0); setSelectedSchool(null); }} style={{ background: "none", border: "none", color: t.accent, fontSize: 13, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>{_("schools.allSchools")}</button>
        <div style={{ background: "linear-gradient(135deg, #004D40, #00695C, #00897B)", borderRadius: 20, padding: "24px 20px", color: "white", position: "relative", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ position: "absolute", top: -15, right: -15, fontSize: 80, opacity: 0.1 }}>{school.coverEmoji}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{school.logo}</div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{school.name}</h2>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{spot?.emoji} {spot?.name}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 10px", fontSize: 11 }}>⭐ {school.rating} ({school.reviewCount})</span>
            <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 10px", fontSize: 11 }}>{formatPrice(school.priceRange.from, school.priceRange.currency)}–{formatPrice(school.priceRange.to, school.priceRange.currency)}</span>
            {school.verified && <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px", fontSize: 11 }}>{_("schools.verified")}</span>}
          </div>
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{_("schools.about")}</div>
          <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.6 }}>{school.about}</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {school.highlights.map(h => (
            <span key={h} style={{ background: dm ? "rgba(0,150,136,0.08)" : "#E0F2F1", color: t.accent, padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ {h}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {school.languages.map(l => (
            <span key={l} style={{ background: t.inputBg, padding: "4px 10px", borderRadius: 8, fontSize: 11, color: t.text2 }}>{LANG_LABELS[l] || l}</span>
          ))}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{_("schools.courses")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {school.courses.map(course => (
            <button key={course.id} onClick={() => { setSelectedCourse(course); setBookingStep(3); }} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
              background: t.card, border: `1px solid ${t.cardBorder}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{course.name}</div>
                <div style={{ fontSize: 11, color: t.text2, marginTop: 2 }}>{course.duration} · {course.groupSize}</div>
                <div style={{ fontSize: 11, color: t.text3, marginTop: 2 }}>{course.description}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: t.accent }}>{formatPrice(course.price, school.priceRange.currency)}</div>
                <div style={{ fontSize: 10, color: t.accent, fontWeight: 600 }}>{_("schools.book")}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{_("schools.contact")}</div>
          {school.contact.phone && <div style={{ fontSize: 13, color: t.text2, marginBottom: 4 }}>📱 {school.contact.phone}</div>}
          {school.contact.email && <div style={{ fontSize: 13, color: t.text2, marginBottom: 4 }}>✉️ {school.contact.email}</div>}
          {school.contact.instagram && <div style={{ fontSize: 13, color: t.accent, fontWeight: 600 }}>📸 {school.contact.instagram}</div>}
        </div>
      </div>
    );
  }

  // === BROWSE ===
  return (
    <div style={{ paddingTop: 24, animation: "screenIn 0.25s ease both" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>{_("schools.title")}</h2>
      <p style={{ fontSize: 13, color: t.text2, marginBottom: 16 }}>{_("schools.subtitle")}</p>
      {showTip && (
        <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, marginBottom: 3 }}>{_("tip.schoolsTitle")}</div>
            <div style={{ fontSize: 11, color: t.text2, lineHeight: 1.5 }}>{_("tip.schools")}</div>
          </div>
          <button onClick={dismissTip} style={{ background: "none", border: "none", color: t.text3, fontSize: 16, cursor: "pointer", padding: 4, marginLeft: 8, flexShrink: 0 }}>✕</button>
        </div>
      )}
      <select value={selectedSpot} onChange={e => setSelectedSpot(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
        {spotsWithSchools.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
      </select>
      {spot && (
        <div style={{ background: dm ? "rgba(30,45,61,0.6)" : "#F5F5F5", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 28 }}>{spot.emoji}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{spot.name}</div>
            <div style={{ fontSize: 11, color: t.text2 }}>{spot.waveType} · {spot.season} · {spot.water} · {spot.wetsuit === "none" ? _("g.noWetsuit") : spot.wetsuit}</div>
          </div>
        </div>
      )}
      {schools.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: t.card, borderRadius: 16, border: `1px solid ${t.cardBorder}` }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: t.text, marginBottom: 8 }}>{_("schools.noSchools")}</h3>
          <p style={{ fontSize: 12, color: t.text2 }}>{_("g.comingSoon")}</p>
        </div>
      )}
      {schools.map(school => (
        <button key={school.id} onClick={() => { setSelectedSchool(school); setBookingStep(1); }} style={{
          width: "100%", display: "flex", gap: 14, padding: "16px", borderRadius: 16, cursor: "pointer", textAlign: "left", marginBottom: 10,
          background: t.card, border: `1px solid ${t.cardBorder}`,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{school.logo}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{school.name}</span>
              {school.verified && <span style={{ fontSize: 10, color: "#4CAF50" }}>✓</span>}
            </div>
            <div style={{ fontSize: 11, color: t.text2, marginTop: 2 }}>{school.location.address}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#FFA000" }}><StarRating rating={school.rating} size={11} /> {school.rating}</span>
              <span style={{ fontSize: 11, color: t.text3 }}>({school.reviewCount})</span>
              <span style={{ fontSize: 11, color: t.accent, fontWeight: 600 }}>ab {formatPrice(school.priceRange.from, school.priceRange.currency)}</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              {school.languages.slice(0, 3).map(l => <span key={l} style={{ fontSize: 9, background: t.inputBg, padding: "2px 6px", borderRadius: 6, color: t.text3 }}>{l.toUpperCase()}</span>)}
            </div>
          </div>
          <span style={{ fontSize: 18, color: t.text3, alignSelf: "center" }}>→</span>
        </button>
      ))}
    </div>
  );
}
