// SoulSurf – CommunityScreen (UI-only, Sprint 16)
import React, { useState, useMemo } from "react";
import { SURF_SPOTS, EXPERIENCE_LEVELS } from "../data.js";

// Demo buddy profiles (UI-only – later replaced by real backend)
const DEMO_BUDDIES = [
  { id: 1, name: "Mia", emoji: "🧑‍🦰", level: "few", spot: "bali", note: "Suche Surfbuddy für Bali im März!", vibe: "Chill & Fun" },
  { id: 2, name: "Carlos", emoji: "🧔", level: "some", spot: "portugal", note: "4 Wochen Algarve ab April. Jemand dabei?", vibe: "Progression" },
  { id: 3, name: "Yuki", emoji: "👩", level: "zero", spot: "sri-lanka", note: "Erste Surf-Reise! Tipps willkommen 🙏", vibe: "Anfänger-friendly" },
  { id: 4, name: "Lena", emoji: "👱‍♀️", level: "some", spot: "france", note: "Hossegor September – wer ist am Start?", vibe: "Progression" },
  { id: 5, name: "Kai", emoji: "🧑", level: "lots", spot: "hawaii", note: "Pipeline Season! Wer traut sich? 🌊", vibe: "Advanced Only" },
  { id: 6, name: "Sophia", emoji: "👩‍🦱", level: "few", spot: "canary", note: "Fuerteventura Dezember, 2 Wochen", vibe: "Chill & Fun" },
  { id: 7, name: "Tom", emoji: "🧔‍♂️", level: "some", spot: "costa-rica", note: "Tamarindo März/April – let's go!", vibe: "Mixed Levels" },
  { id: 8, name: "Aisha", emoji: "🧕", level: "zero", spot: "morocco", note: "Anfängerin, suche Surfcamp-Buddy", vibe: "Anfänger-friendly" },
];

const COMMUNITY_POSTS = [
  { id: 1, spot: "bali", author: "SurfLisa", text: "Padang Padang war heute episch! 🔥 Overhead sets, kaum Crowd am Morgen.", time: "vor 2h", likes: 12 },
  { id: 2, spot: "portugal", author: "WaveHunter", text: "Amado Beach: Achtung, starke Strömung heute! Besser bei Ebbe surfen.", time: "vor 5h", likes: 8 },
  { id: 3, spot: "france", author: "OceanVibes", text: "La Gravière pumpt! Aber nur für Erfahrene – heftige Shorebreak.", time: "vor 1d", likes: 23 },
  { id: 4, spot: "sri-lanka", author: "TropicSurf", text: "Weligama perfekt für Anfänger gerade. Warmes Wasser, kleine Wellen, nette Locals.", time: "vor 1d", likes: 15 },
  { id: 5, spot: "hawaii", author: "AlohaRider", text: "Waikiki longboard session war magic heute! 🌺 Sonnenuntergang + clean waves.", time: "vor 3h", likes: 31 },
];

const LEVEL_MAP = { zero: "Anfänger", few: "Beginner", some: "Intermediate", lots: "Advanced" };
const LEVEL_COLOR = { zero: "#66BB6A", few: "#4DB6AC", some: "#FFB74D", lots: "#FF7043" };

export default function CommunityScreen({ data, t, dm, navigate }) {
  const [tab, setTab] = useState("buddies"); // buddies | board | announce
  const [levelFilter, setLevelFilter] = useState("all");
  const [spotFilter, setSpotFilter] = useState("all");
  const [myAnnouncement, setMyAnnouncement] = useState({ spot: "", dates: "", note: "" });
  const [announcements, setAnnouncements] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});

  const filteredBuddies = useMemo(() => {
    return DEMO_BUDDIES.filter(b => {
      if (levelFilter !== "all" && b.level !== levelFilter) return false;
      if (spotFilter !== "all" && b.spot !== spotFilter) return false;
      return true;
    });
  }, [levelFilter, spotFilter]);

  const filteredPosts = useMemo(() => {
    if (spotFilter === "all") return COMMUNITY_POSTS;
    return COMMUNITY_POSTS.filter(p => p.spot === spotFilter);
  }, [spotFilter]);

  const handleAnnounce = () => {
    if (!myAnnouncement.spot || !myAnnouncement.dates) return;
    const spot = SURF_SPOTS.find(s => s.id === myAnnouncement.spot);
    setAnnouncements(prev => [{ id: Date.now(), spot: spot?.name || myAnnouncement.spot, emoji: spot?.emoji || "📍", dates: myAnnouncement.dates, note: myAnnouncement.note, time: "gerade eben" }, ...prev]);
    setMyAnnouncement({ spot: "", dates: "", note: "" });
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>🤝 Community</h2>
      <p style={{ fontSize: 13, color: t.text2, marginBottom: 16 }}>Finde Surf-Buddies und teile Spot-Tipps.</p>

      {/* Coming Soon Banner */}
      <div style={{ background: dm ? "rgba(92,107,192,0.1)" : "linear-gradient(135deg, #E8EAF6, #EDE7F6)", border: `1px solid ${dm ? "rgba(92,107,192,0.2)" : "#C5CAE9"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🚧</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: dm ? "#7986CB" : "#3949AB" }}>Preview – Backend kommt bald!</div>
          <div style={{ fontSize: 11, color: t.text2 }}>Buddies & Posts sind Demo-Daten. Deine Ankündigungen werden lokal gespeichert.</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[{ id: "buddies", label: "🏄 Buddies" }, { id: "board", label: "💬 Board" }, { id: "announce", label: "📢 Ankündigen" }].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 12, fontSize: 12, fontWeight: tab === tb.id ? 700 : 500, cursor: "pointer",
            background: tab === tb.id ? (dm ? t.accent : "#263238") : t.inputBg,
            color: tab === tb.id ? "white" : t.text2, border: `1px solid ${tab === tb.id ? "transparent" : t.inputBorder}`,
          }}>{tb.label}</button>
        ))}
      </div>

      {/* Filters (shared) */}
      {(tab === "buddies" || tab === "board") && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {tab === "buddies" && (
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 12 }}>
              <option value="all">Alle Level</option>
              {EXPERIENCE_LEVELS.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>)}
            </select>
          )}
          <select value={spotFilter} onChange={e => setSpotFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 12 }}>
            <option value="all">Alle Spots</option>
            {SURF_SPOTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name.split(",")[0]}</option>)}
          </select>
        </div>
      )}

      {/* Tab: Buddies */}
      {tab === "buddies" && (
        <div style={{ animation: "screenIn 0.25s ease both" }}>
          {filteredBuddies.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: t.text3 }}>
              <span style={{ fontSize: 36 }}>🔍</span>
              <p style={{ fontSize: 13, marginTop: 8 }}>Keine Buddies für diesen Filter.</p>
            </div>
          )}
          {filteredBuddies.map(buddy => {
            const spot = SURF_SPOTS.find(s => s.id === buddy.spot);
            return (
              <div key={buddy.id} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "16px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: dm ? "rgba(255,255,255,0.05)" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{buddy.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: t.text }}>{buddy.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: `${LEVEL_COLOR[buddy.level]}20`, color: LEVEL_COLOR[buddy.level] }}>{LEVEL_MAP[buddy.level]}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    {spot && <span style={{ fontSize: 11, color: t.text2 }}>{spot.emoji} {spot.name.split(",")[0]}</span>}
                    <span style={{ fontSize: 11, color: t.text3 }}>· {buddy.vibe}</span>
                  </div>
                  <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.5, margin: 0 }}>{buddy.note}</p>
                  <button style={{ marginTop: 8, padding: "6px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", background: dm ? "rgba(77,182,172,0.15)" : "#E0F2F1", color: t.accent, border: `1px solid ${t.accent}` }}>👋 Hey sagen</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Community Board */}
      {tab === "board" && (
        <div style={{ animation: "screenIn 0.25s ease both" }}>
          {filteredPosts.map(post => {
            const spot = SURF_SPOTS.find(s => s.id === post.spot);
            const liked = likedPosts[post.id];
            return (
              <div key={post.id} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: dm ? "rgba(255,255,255,0.05)" : "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏄</div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{post.author}</span>
                      {spot && <span style={{ fontSize: 11, color: t.text3, marginLeft: 6 }}>{spot.emoji} {spot.name.split(",")[0]}</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3 }}>{post.time}</span>
                </div>
                <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6, margin: "0 0 10px" }}>{post.text}</p>
                <button onClick={() => setLikedPosts(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: liked ? (dm ? "rgba(229,57,53,0.1)" : "#FFEBEE") : t.inputBg, color: liked ? "#E53935" : t.text3, border: `1px solid ${liked ? "#FFCDD2" : t.inputBorder}`, fontWeight: liked ? 600 : 400 }}>
                  {liked ? "❤️" : "🤍"} {post.likes + (liked ? 1 : 0)}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Announce Trip */}
      {tab === "announce" && (
        <div style={{ animation: "screenIn 0.25s ease both" }}>
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "18px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", marginBottom: 12 }}>📢 Trip ankündigen</div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>🌍 Spot</label>
              <select value={myAnnouncement.spot} onChange={e => setMyAnnouncement(p => ({ ...p, spot: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }}>
                <option value="">Spot wählen...</option>
                {SURF_SPOTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>📅 Zeitraum</label>
              <input type="text" value={myAnnouncement.dates} onChange={e => setMyAnnouncement(p => ({ ...p, dates: e.target.value }))} placeholder="z.B. März 2026, 2 Wochen" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.text2, display: "block", marginBottom: 4 }}>💬 Nachricht</label>
              <textarea value={myAnnouncement.note} onChange={e => setMyAnnouncement(p => ({ ...p, note: e.target.value }))} placeholder="z.B. Suche Surfbuddy, Level egal..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical" }} />
            </div>
            <button onClick={handleAnnounce} disabled={!myAnnouncement.spot || !myAnnouncement.dates} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: myAnnouncement.spot && myAnnouncement.dates ? "pointer" : "not-allowed", background: myAnnouncement.spot && myAnnouncement.dates ? "linear-gradient(135deg, #009688, #4DB6AC)" : "#E0E0E0", color: myAnnouncement.spot && myAnnouncement.dates ? "white" : "#9E9E9E", border: "none" }}>📢 Ankündigen</button>
          </div>

          {/* My Announcements */}
          {announcements.length > 0 && (
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3, textTransform: "uppercase", marginBottom: 8 }}>Deine Ankündigungen</div>
              {announcements.map(a => (
                <div key={a.id} style={{ background: dm ? "rgba(0,150,136,0.08)" : "#E0F2F1", border: `1px solid ${dm ? "rgba(0,150,136,0.15)" : "#B2DFDB"}`, borderRadius: 14, padding: "12px 16px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{a.emoji} {a.spot}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3 }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: t.accent, marginTop: 4 }}>📅 {a.dates}</div>
                  {a.note && <div style={{ fontSize: 13, color: t.text2, marginTop: 4 }}>{a.note}</div>}
                </div>
              ))}
            </div>
          )}

          {announcements.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: t.text3, fontSize: 13 }}>Noch keine Ankündigungen. Teile deinen nächsten Trip! ✈️</div>
          )}
        </div>
      )}
    </div>
  );
}
