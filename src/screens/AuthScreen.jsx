// SoulSurf – AuthScreen (Login / Register / Reset)
import React, { useState } from "react";

export default function AuthScreen({ auth, t, dm, onClose }) {
  const [mode, setMode] = useState("login"); // login | register | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    if (!email) return;
    setMessage(null);

    if (mode === "login") {
      if (!password) return;
      const { error } = await auth.login(email, password);
      if (!error) onClose();
    } else if (mode === "register") {
      if (!password || password.length < 6) { setMessage({ type: "error", text: "Passwort muss mind. 6 Zeichen haben." }); return; }
      const { error, data } = await auth.register(email, password);
      if (!error) {
        if (data?.user?.identities?.length === 0) {
          setMessage({ type: "error", text: "E-Mail ist bereits registriert." });
        } else {
          setMessage({ type: "success", text: "Bestätigungs-E-Mail gesendet! Bitte checke deinen Posteingang." });
        }
      }
    } else if (mode === "reset") {
      const { error } = await auth.resetPassword(email);
      if (!error) setMessage({ type: "success", text: "Reset-Link gesendet! Checke deinen Posteingang." });
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: dm ? "#1a2332" : "#FFFDF7", borderRadius: 24, maxWidth: 420, width: "100%", padding: "32px 28px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{mode === "login" ? "👋" : mode === "register" ? "🏄" : "🔑"}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text, margin: "0 0 4px" }}>
            {mode === "login" ? "Willkommen zurück!" : mode === "register" ? "Account erstellen" : "Passwort zurücksetzen"}
          </h2>
          <p style={{ fontSize: 13, color: t.text2 }}>
            {mode === "login" ? "Logge dich ein um deine Daten zu synchronisieren." : mode === "register" ? "Kostenlos registrieren und auf allen Geräten surfen." : "Wir senden dir einen Reset-Link per E-Mail."}
          </p>
        </div>

        {/* Error/Success Messages */}
        {(auth.error || message) && (
          <div style={{ background: (message?.type === "success") ? (dm ? "rgba(77,182,172,0.1)" : "#E0F2F1") : (dm ? "rgba(229,57,53,0.1)" : "#FFEBEE"), border: `1px solid ${(message?.type === "success") ? "#4DB6AC" : "#FFCDD2"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: (message?.type === "success") ? "#4DB6AC" : "#E53935" }}>
            {message?.text || auth.error}
          </div>
        )}

        {/* Form */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>📧 E-Mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="deine@email.de" autoFocus style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }} />
        </div>

        {mode !== "reset" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>🔒 Passwort</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder={mode === "register" ? "Mind. 6 Zeichen" : "Passwort"} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }} />
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={auth.loading} style={{ width: "100%", padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: auth.loading ? "wait" : "pointer", background: auth.loading ? "#B0BEC5" : "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>
          {auth.loading ? "⏳ Moment..." : mode === "login" ? "Einloggen" : mode === "register" ? "Registrieren" : "Reset-Link senden"}
        </button>

        {/* Mode Switches */}
        <div style={{ textAlign: "center", fontSize: 13, color: t.text2 }}>
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("reset"); setMessage(null); auth.clearError(); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 13, marginBottom: 8, display: "block", width: "100%", textAlign: "center" }}>Passwort vergessen?</button>
              <span>Noch kein Account? </span>
              <button onClick={() => { setMode("register"); setMessage(null); auth.clearError(); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Registrieren</button>
            </>
          )}
          {mode === "register" && (
            <>
              <span>Schon registriert? </span>
              <button onClick={() => { setMode("login"); setMessage(null); auth.clearError(); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Einloggen</button>
            </>
          )}
          {mode === "reset" && (
            <button onClick={() => { setMode("login"); setMessage(null); auth.clearError(); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 13 }}>← Zurück zum Login</button>
          )}
        </div>

        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: dm ? "rgba(255,255,255,0.1)" : "#F5F5F5", border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 18, cursor: "pointer", color: t.text3, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
    </div>
  );
}
