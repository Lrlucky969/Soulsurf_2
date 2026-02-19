// SoulSurf – CommunityScreen v2 (Supabase Backend + Demo Fallback)
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { SURF_SPOTS, EXPERIENCE_LEVELS } from "../data.js";
import { supabase, isSupabaseConfigured } from "../supabase.js";

// Demo data for non-logged-in users
const DEMO_POSTS = [
  { id: "d1", spot: "bali", author_name: "SurfLisa", text: "Padang Padang war heute episch! 🔥 Overhead sets, kaum Crowd am Morgen.", created_at: new Date(Date.now() - 7200000).toISOString(), likes_count: 12 },
  { id: "d2", spot: "portugal", author_name: "WaveHunter", text: "Amado Beach: Achtung, starke Strömung heute! Besser bei Ebbe surfen.", created_at: new Date(Date.now() - 18000000).toISOString(), likes_count: 8 },
  { id: "d3", spot: "france", author_name: "OceanVibes", text: "La Gravière pumpt! Aber nur für Erfahrene – heftige Shorebreak.", created_at: new Date(Date.now() - 86400000).toISOString(), likes_count: 23 },
  { id: "d4", spot: "sri-lanka", author_name: "TropicSurf", text: "Weligama perfekt für Anfänger gerade. Warmes Wasser, kleine Wellen, nette Locals.", created_at: new Date(Date.now() - 90000000).toISOString(), likes_count: 15 },
  { id: "d5", spot: "hawaii", author_name: "AlohaRider", text: "Waikiki longboard session war magic heute! 🌺 Sonnenuntergang + clean waves.", created_at: new Date(Date.now() - 10800000).toISOString(), likes_count: 31 },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `vor ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs}h`;
  return `vor ${Math.floor(hrs / 24)}d`;
}

export default function CommunityScreen({ data, auth, t, dm }) {
  const [tab, setTab] = useState("board"); // board | announce
  const [spotFilter, setSpotFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  const [myLikes, setMyLikes] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [newPost, setNewPost] = useState({ spot: "", text: "" });
  const [posting, setPosting] = useState(false);

  const isLive = isSupabaseConfigured && auth?.isLoggedIn;

  // Load posts from Supabase or use demo data
  const loadPosts = useCallback(async () => {
    if (!isLive || !supabase) { setPosts(DEMO_POSTS); return; }
    setLoadingPosts(true);
    try {
      const { data: rows, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) { console.error("Load posts error:", error); setPosts(DEMO_POSTS); }
      else setPosts(rows || []);

      // Load my likes
      if (auth.user?.id) {
        const { data: likes } = await supabase
          .from("community_likes")
          .select("post_id")
          .eq("user_id", auth.user.id);
        if (likes) {
          const map = {};
          likes.forEach(l => { map[l.post_id] = true; });
          setMyLikes(map);
        }
      }
    } catch { setPosts(DEMO_POSTS); }
    setLoadingPosts(false);
  }, [isLive, auth?.user?.id]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Submit new post
  const handlePost = async () => {
    if (!newPost.text.trim() || !newPost.spot) return;
    if (!isLive || !supabase) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("community_posts").insert({
        user_id: auth.user.id,
        author_name: auth.displayName || "Surfer",
        spot: newPost.spot,
        text: newPost.text.trim(),
      });
      if (!error) {
        setNewPost({ spot: "", text: "" });
        loadPosts();
      }
    } catch {}
    setPosting(false);
  };

  // Toggle like
  const toggleLike = async (postId) => {
    if (!isLive || !supabase) {
      setMyLikes(p => ({ ...p, [postId]: !p[postId] }));
      return;
    }
    const liked = myLikes[postId];
    setMyLikes(p => ({ ...p, [postId]: !liked }));
    try {
      if (liked) {
        await supabase.from("community_likes").delete().eq("user_id", auth.user.id).eq("post_id", postId);
        await supabase.rpc("decrement_likes", { pid: postId });
      } else {
        await supabase.from("community_likes").insert({ user_id: auth.user.id, post_id: postId });
        await supabase.rpc("increment_likes", { pid: postId });
      }
      loadPosts();
    } catch {}
  };

  // Delete own post
  const deletePost = async (postId) => {
    if (!isLive || !supabase) return;
    await supabase.from("community_posts").delete().eq("id", postId).eq("user_id", auth.user.id);
    loadPosts();
  };

  const filteredPosts = spotFilter === "all" ? posts : posts.filter(p => p.spot === spotFilter);

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>🤝 Community</h2>
      <p style={{ fontSize: 13, color: t.text2, marginBottom: 16 }}>Teile Spot-Tipps und finde Surf-Buddies.</p>

      {/* Live/Demo Banner */}
      {!isLive && (
        <div style={{ background: dm ? "rgba(92,107,192,0.1)" : "linear-gradient(135deg, #E8EAF6, #EDE7F6)", border: `1px solid ${dm ? "rgba(92,107,192,0.2)" : "#C5CAE9"}`, borderRadius: 14, padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: dm ? "#7986CB" : "#3949AB" }}>Demo-Modus</div>
            <div style={{ fontSize: 11, color: t.text2 }}>Logge dich ein um eigene Posts zu schreiben und Beiträge zu liken.</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[{ id: "board", label: "💬 Board" }, { id: "announce", label: "📢 Posten" }].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 12, fontSize: 12, fontWeight: tab === tb.id ? 700 : 500, cursor: "pointer",
            background: tab === tb.id ? (dm ? t.accent : "#263238") : t.inputBg,
            color: tab === tb.id ? "white" : t.text2, border: `1px solid ${tab === tb.id ? "transparent" : t.inputBorder}`,
          }}>{tb.label}</button>
        ))}
      </div>

      {/* Spot Filter */}
      <div style={{ marginBottom: 14 }}>
        <select value={spotFilter} onChange={e => setSpotFilter(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 12 }}>
          <option value="all">🌍 Alle Spots</option>
          {SURF_SPOTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name.split(",")[0]}</option>)}
        </select>
      </div>

      {/* Tab: Board */}
      {tab === "board" && (
        <div style={{ animation: "screenIn 0.25s ease both" }}>
          {loadingPosts && <div style={{ textAlign: "center", padding: "20px", color: t.text3, fontSize: 13 }}>⏳ Lade Posts...</div>}
          {!loadingPosts && filteredPosts.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: t.text3 }}>
              <span style={{ fontSize: 36 }}>🌊</span>
              <p style={{ fontSize: 13, marginTop: 8 }}>Noch keine Posts {spotFilter !== "all" ? "für diesen Spot" : ""}. Sei der Erste!</p>
            </div>
          )}
          {filteredPosts.map(post => {
            const spot = SURF_SPOTS.find(s => s.id === post.spot);
            const liked = myLikes[post.id];
            const isOwn = auth?.user?.id && post.user_id === auth.user.id;
            return (
              <div key={post.id} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #009688, #4DB6AC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>{(post.author_name || "S").charAt(0).toUpperCase()}</div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{post.author_name || "Surfer"}</span>
                      {spot && <span style={{ fontSize: 11, color: t.text3, marginLeft: 6 }}>{spot.emoji} {spot.name.split(",")[0]}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.text3 }}>{timeAgo(post.created_at)}</span>
                    {isOwn && <button onClick={() => deletePost(post.id)} style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", color: t.text3, padding: "2px 4px" }}>🗑</button>}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: t.text, lineHeight: 1.6, margin: "0 0 10px" }}>{post.text}</p>
                <button onClick={() => toggleLike(post.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: liked ? (dm ? "rgba(229,57,53,0.1)" : "#FFEBEE") : t.inputBg, color: liked ? "#E53935" : t.text3, border: `1px solid ${liked ? "#FFCDD2" : t.inputBorder}`, fontWeight: liked ? 600 : 400, transition: "all 0.15s ease" }}>
                  {liked ? "❤️" : "🤍"} {(post.likes_count || 0) + (liked && !post.id.startsWith("d") ? 0 : liked ? 1 : 0)}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Post */}
      {tab === "announce" && (
        <div style={{ animation: "screenIn 0.25s ease both" }}>
          {!isLive ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: t.text, marginBottom: 8 }}>Login erforderlich</h3>
              <p style={{ fontSize: 14, color: t.text2 }}>Logge dich ein um eigene Posts zu schreiben.</p>
            </div>
          ) : (
            <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: "18px", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.accent, textTransform: "uppercase", marginBottom: 12 }}>💬 Neuer Post</div>
              <div style={{ marginBottom: 10 }}>
                <select value={newPost.spot} onChange={e => setNewPost(p => ({ ...p, spot: e.target.value }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 13 }}>
                  <option value="">🌍 Spot wählen...</option>
                  {SURF_SPOTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <textarea value={newPost.text} onChange={e => setNewPost(p => ({ ...p, text: e.target.value }))} placeholder="Wie waren die Wellen? Tipps für andere Surfer? 🌊" rows={3} maxLength={500} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: "vertical" }} />
                <div style={{ fontSize: 10, color: t.text3, textAlign: "right", marginTop: 2 }}>{newPost.text.length}/500</div>
              </div>
              <button onClick={handlePost} disabled={!newPost.text.trim() || !newPost.spot || posting} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: newPost.text.trim() && newPost.spot && !posting ? "pointer" : "not-allowed", background: newPost.text.trim() && newPost.spot && !posting ? "linear-gradient(135deg, #009688, #4DB6AC)" : "#E0E0E0", color: newPost.text.trim() && newPost.spot && !posting ? "white" : "#9E9E9E", border: "none" }}>
                {posting ? "⏳ Wird gepostet..." : "💬 Posten"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
