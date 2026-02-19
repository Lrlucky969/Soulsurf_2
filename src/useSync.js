// SoulSurf – Cloud Sync Hook (v4.8)
// Syncs program data + trips to Supabase. Local-first: localStorage stays primary.
import { useCallback, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase.js";

// Debounce uploads to avoid hammering the DB
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export default function useSync(userId) {
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error
  const [lastSynced, setLastSynced] = useState(null);
  const uploadRef = useRef(null);

  // Initialize debounced upload
  if (!uploadRef.current) {
    uploadRef.current = debounce(async (uid, table, data) => {
      if (!isSupabaseConfigured || !supabase || !uid) return;
      try {
        setSyncStatus("syncing");
        const { error } = await supabase.from(table).upsert({
          user_id: uid,
          data: data,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        if (error) { console.error("Sync upload error:", error); setSyncStatus("error"); }
        else { setSyncStatus("synced"); setLastSynced(new Date().toISOString()); }
      } catch (e) { console.error("Sync failed:", e); setSyncStatus("error"); }
    }, 2000);
  }

  // Upload program data (debounced)
  const uploadProgram = useCallback((programData) => {
    if (!userId) return;
    uploadRef.current(userId, "user_data", programData);
  }, [userId]);

  // Upload trips (debounced)
  const uploadTrips = useCallback((tripsData) => {
    if (!userId) return;
    uploadRef.current(userId, "user_trips", tripsData);
  }, [userId]);

  // Download all data from cloud (used on login or manual sync)
  const downloadAll = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !userId) return null;
    try {
      setSyncStatus("syncing");
      const [programRes, tripsRes] = await Promise.all([
        supabase.from("user_data").select("data, updated_at").eq("user_id", userId).single(),
        supabase.from("user_trips").select("data, updated_at").eq("user_id", userId).single(),
      ]);
      setSyncStatus("synced");
      setLastSynced(new Date().toISOString());
      return {
        program: programRes.data?.data || null,
        programUpdatedAt: programRes.data?.updated_at || null,
        trips: tripsRes.data?.data || null,
        tripsUpdatedAt: tripsRes.data?.updated_at || null,
      };
    } catch (e) {
      console.error("Download failed:", e);
      setSyncStatus("error");
      return null;
    }
  }, [userId]);

  // Force a full upload (non-debounced, for manual sync button)
  const forceUpload = useCallback(async (programData, tripsData) => {
    if (!isSupabaseConfigured || !supabase || !userId) return;
    try {
      setSyncStatus("syncing");
      const results = await Promise.all([
        supabase.from("user_data").upsert({ user_id: userId, data: programData, updated_at: new Date().toISOString() }, { onConflict: "user_id" }),
        supabase.from("user_trips").upsert({ user_id: userId, data: tripsData, updated_at: new Date().toISOString() }, { onConflict: "user_id" }),
      ]);
      const hasError = results.some(r => r.error);
      if (hasError) { console.error("Force upload errors:", results.map(r => r.error).filter(Boolean)); setSyncStatus("error"); }
      else { setSyncStatus("synced"); setLastSynced(new Date().toISOString()); }
    } catch (e) { console.error("Force upload failed:", e); setSyncStatus("error"); }
  }, [userId]);

  return {
    syncStatus,
    lastSynced,
    uploadProgram,
    uploadTrips,
    downloadAll,
    forceUpload,
    isEnabled: isSupabaseConfigured && Boolean(userId),
  };
}
