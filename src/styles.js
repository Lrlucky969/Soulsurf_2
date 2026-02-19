// SoulSurf – Shared Style Constants (v5.6)
// Extracted repeated font/style patterns to reduce bundle size

export const FONT = {
  heading: "'Playfair Display', serif",
  mono: "'Space Mono', monospace",
  body: "'DM Sans', sans-serif",
};

export const card = (t, dm) => ({
  background: dm ? "rgba(30,45,61,0.8)" : t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  padding: "16px 18px",
});

export const accentCard = (t, dm) => ({
  background: dm ? "rgba(0,150,136,0.1)" : "#E0F2F1",
  border: `1px solid ${dm ? "rgba(0,150,136,0.2)" : "#B2DFDB"}`,
  borderRadius: 14,
  padding: "12px 16px",
});

export const sectionLabel = (t) => ({
  fontFamily: FONT.mono,
  fontSize: 10,
  color: t.text3,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: 10,
});

export const pill = (active, t) => ({
  padding: "6px 14px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: active ? 700 : 500,
  cursor: "pointer",
  background: active ? t.accent : t.inputBg,
  color: active ? "white" : t.text2,
  border: `1px solid ${active ? t.accent : t.inputBorder}`,
});

export const primaryBtn = {
  background: "linear-gradient(135deg, #009688, #4DB6AC)",
  color: "white",
  border: "none",
  borderRadius: 50,
  padding: "16px 40px",
  fontSize: 17,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT.heading,
  boxShadow: "0 8px 30px rgba(0,150,136,0.3)",
};
