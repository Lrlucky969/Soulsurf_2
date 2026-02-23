// SoulSurf – Error Boundary Component
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    
    // TODO: Send to error tracking service
    // if (window.Sentry) {
    //   Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  render() {
    if (this.state.hasError) {
      const dm = this.props.darkMode || false;
      const t = dm 
        ? { bg: "#0d1820", text: "#e8eaed", text2: "#9aa0a6", accent: "#4DB6AC" }
        : { bg: "#FFFDF7", text: "#263238", text2: "#546E7A", accent: "#009688" };

      return (
        <div style={{ 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          background: t.bg, 
          color: t.text,
          padding: "40px 20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🌊💥</div>
          <h1 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: 28, 
            fontWeight: 800, 
            marginBottom: 12 
          }}>
            Wipeout! 🏄
          </h1>
          <p style={{ 
            fontSize: 15, 
            color: t.text2, 
            maxWidth: 400, 
            lineHeight: 1.6,
            marginBottom: 24
          }}>
            Die App ist gecrasht. Keine Sorge – passiert den Besten!
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ 
              background: dm ? "#1a2332" : "#F5F5F5",
              padding: 16,
              borderRadius: 12,
              fontSize: 11,
              color: "#E53935",
              maxWidth: 600,
              overflow: "auto",
              textAlign: "left",
              marginBottom: 24
            }}>
              {this.state.error?.toString()}
            </pre>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #009688, #4DB6AC)",
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Playfair Display', serif"
              }}
            >
              🔄 App neu laden
            </button>
            
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                background: dm ? "rgba(255,255,255,0.08)" : "#F5F5F5",
                color: t.text2,
                border: `1px solid ${dm ? "#2d3f50" : "#E0E0E0"}`,
                borderRadius: 14,
                padding: "14px 28px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              🗑️ Cache leeren
            </button>
          </div>

          <p style={{ 
            fontSize: 12, 
            color: t.text2, 
            marginTop: 32,
            maxWidth: 400
          }}>
            Wenn das Problem weiterhin besteht, kontaktiere uns unter{" "}
            <a href="mailto:support@soulsurf.app" style={{ color: t.accent }}>
              support@soulsurf.app
            </a>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
