// SoulSurf – AuthScreen v2 (Email + Google + Apple)
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
        if (data?.user?.identities?.length === 0) setMessage({ type: "error", text: "E-Mail ist bereits registriert." });
        else setMessage({ type: "success", text: "Bestätigungs-E-Mail gesendet! Checke deinen Posteingang." });
      }
    } else if (mode === "reset") {
      const { error } = await auth.resetPassword(email);
      if (!error) setMessage({ type: "success", text: "Reset-Link gesendet! Checke deinen Posteingang." });
    }
  };

  const handleSocial = async (provider) => {
    setMessage(null);
    const { error } = await auth.loginWithProvider(provider);
    if (error) setMessage({ type: "error", text: error.message });
    // Redirect happens automatically – Supabase handles the OAuth flow
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const btnBase = { width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: dm ? "#1a2332" : "#FFFDF7", borderRadius: 24, maxWidth: 420, width: "100%", padding: "32px 28px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease", position: "relative" }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: dm ? "rgba(255,255,255,0.1)" : "#F5F5F5", border: "none", borderRadius: "50%", width: 36, height: 36, fontSize: 18, cursor: "pointer", color: t.text3, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{mode === "login" ? "👋" : mode === "register" ? "🏄" : "🔑"}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: t.text, margin: "0 0 4px" }}>
            {mode === "login" ? "Willkommen zurück!" : mode === "register" ? "Account erstellen" : "Passwort zurücksetzen"}
          </h2>
          <p style={{ fontSize: 13, color: t.text2 }}>
            {mode === "login" ? "Logge dich ein um deine Daten zu synchronisieren." : mode === "register" ? "Kostenlos registrieren und auf allen Geräten surfen." : "Wir senden dir einen Reset-Link per E-Mail."}
          </p>
        </div>

        {/* Error/Success */}
        {(auth.error || message) && (
          <div style={{ background: (message?.type === "success") ? (dm ? "rgba(77,182,172,0.1)" : "#E0F2F1") : (dm ? "rgba(229,57,53,0.1)" : "#FFEBEE"), border: `1px solid ${(message?.type === "success") ? "#4DB6AC" : "#FFCDD2"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: (message?.type === "success") ? "#4DB6AC" : "#E53935" }}>
            {message?.text || auth.error}
          </div>
        )}

        {/* Social Login (only for login & register modes) */}
        {mode !== "reset" && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => handleSocial("google")} style={{ ...btnBase, background: dm ? "rgba(255,255,255,0.08)" : "white", border: `1px solid ${t.inputBorder}`, color: t.text }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Mit Google fortfahren
            </button>
            <button onClick={() => handleSocial("apple")} style={{ ...btnBase, background: dm ? "rgba(255,255,255,0.08)" : "#000", border: `1px solid ${dm ? "rgba(255,255,255,0.15)" : "#000"}`, color: dm ? "white" : "white" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Mit Apple fortfahren
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: t.inputBorder }} />
              <span style={{ fontSize: 11, color: t.text3 }}>oder mit E-Mail</span>
              <div style={{ flex: 1, height: 1, background: t.inputBorder }} />
            </div>
          </div>
        )}

        {/* Email Form */}
        <div style={{ marginBottom: 10 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="deine@email.de" autoFocus style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }} />
        </div>
        {mode !== "reset" && (
          <div style={{ marginBottom: 14 }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder={mode === "register" ? "Mind. 6 Zeichen" : "Passwort"} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }} />
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={auth.loading} style={{ width: "100%", padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: auth.loading ? "wait" : "pointer", background: auth.loading ? "#B0BEC5" : "linear-gradient(135deg, #009688, #4DB6AC)", color: "white", border: "none", fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
          {auth.loading ? "⏳ Moment..." : mode === "login" ? "Einloggen" : mode === "register" ? "Registrieren" : "Reset-Link senden"}
        </button>

        {/* Mode Switches */}
        <div style={{ textAlign: "center", fontSize: 13, color: t.text2 }}>
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("reset"); setMessage(null); auth.clearError(); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 13, marginBottom: 6, display: "block", width: "100%", textAlign: "center" }}>Passwort vergessen?</button>
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
      </div>
    </div>
  );
}
