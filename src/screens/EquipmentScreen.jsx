// SoulSurf – EquipmentScreen (Board-Berater)
import React, { useState } from "react";
import { EXPERIENCE_LEVELS, recommendBoard } from "../data.js";

export default function EquipmentScreen({ data, t, dm, i18n }) {
  const _ = i18n?.t || ((k, f) => f || k);
  const [weight, setWeight] = useState(75);
  const exp = data.experience || "zero";
  const rec = recommendBoard(weight, exp);

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>{_("equip.title")}</h2>
      <p style={{ fontSize: 14, color: t.text2, marginBottom: 16 }}>Finde das perfekte Board für dein Level und Gewicht.<</p>

      {exp === "zero" && (
        <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, marginBottom: 3 }}>{_("tip.beginnerTitle")}</div>
          <div style={{ fontSize: 11, color: t.text2, lineHeight: 1.5 }}>{_("equip.beginnerTip")}<</div>
        <</div>
      )}

      {/* Weight Slider */}
      <div style={{ background: dm ? "rgba(30,45,61,0.8)" : t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: t.text2, marginBottom: 8 }}>Dein Gewicht<</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input type="range" min={40} max={120} value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ flex: 1, accentColor: "#009688" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: t.accent, minWidth: 60 }}>{weight} kg<</span>
        <</div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: t.text2, marginBottom: 8 }}>Dein Level<</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {EXPERIENCE_LEVELS.map(e => (
              <button key={e.id} onClick={() => data.setExperience(e.id)} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: data.experience === e.id ? t.accent : t.inputBg,
                color: data.experience === e.id ? "white" : t.text2,
                border: `1px solid ${data.experience === e.id ? t.accent : t.inputBorder}`,
              }}>{e.emoji} {e.label}<</button>
            ))}
          <</div>
        <</div>
      <</div>

      {/* Volume Result */}
      <div style={{ background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1", borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 20, border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}` }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", marginBottom: 4 }}>Empfohlenes Volume<</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, color: t.accent }}>{rec.volume}L<</div>
        <div style={{ fontSize: 12, color: t.text2 }}>bei {weight}kg · {EXPERIENCE_LEVELS.find(e => e.id === exp)?.label}<</div>
      <</div>

      {/* Board Recommendations */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Board-Empfehlungen<</div>
        {rec.boards.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px", background: b.best ? (dm ? "rgba(0,150,136,0.12)" : "#E0F2F1") : t.card, border: `1px solid ${b.best ? t.accent : t.cardBorder}`, borderRadius: 14, marginBottom: 10 }}>
            <span style={{ fontSize: 32 }}>{b.emoji}<</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
                {b.type} {b.best && <span style={{ fontSize: 11, color: t.accent, fontWeight: 800 }}>★ TOP-EMPFEHLUNG<</span>}
              <</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.accent, marginTop: 2 }}>{b.volume}<</div>
              <div style={{ fontSize: 12, color: t.text2, marginTop: 4, lineHeight: 1.5 }}>{b.reason}<</div>
            <</div>
          <</div>
        ))}
      <</div>

      {/* Fin Setup */}
      <div style={{ background: dm ? "rgba(30,45,61,0.8)" : "#F5F5F5", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{_("equip.finSetup")}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{rec.fins.setup || rec.fins}<</div>
        <div style={{ fontSize: 12, color: t.text2, marginTop: 4 }}>{rec.fins.reason || ""}<</div>
      <</div>

      {/* Coaching Board Hint */}
      {data.coaching.boardHint && (
        <div style={{ background: dm ? "rgba(255,183,77,0.1)" : "#FFF8E1", borderRadius: 14, padding: "14px 16px", border: "1px dashed #FFB74D" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#E65100", textTransform: "uppercase", marginBottom: 4 }}>{_("equip.fromDiary")}</div>
          <p style={{ fontSize: 13, color: dm ? "#e8eaed" : "#4E342E", lineHeight: 1.5 }}>{data.coaching.boardHint}<</p>
        <</div>
      )}
    <</div>
  );
}
