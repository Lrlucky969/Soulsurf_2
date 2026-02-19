// SoulSurf – Photo Sync Hook (v5.1)
// Uploads photos to Supabase Storage, downloads on new device.
// IndexedDB stays primary. Cloud is optional backup.
import { useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const BUCKET = "surf-photos";

export default function usePhotoSync(userId) {
  const uploadQueue = useRef([]);
  const processing = useRef(false);

  const isEnabled = isSupabaseConfigured && Boolean(userId) && Boolean(supabase);

  // Process upload queue (one at a time to avoid hammering)
  const processQueue = useCallback(async () => {
    if (processing.current || uploadQueue.current.length === 0) return;
    processing.current = true;
    while (uploadQueue.current.length > 0) {
      const { photoId, blob, thumb } = uploadQueue.current.shift();
      try {
        const path = `${userId}/${photoId}`;
        // Upload full image
        await supabase.storage.from(BUCKET).upload(`${path}.jpg`, blob, {
          contentType: "image/jpeg", upsert: true,
        });
        // Upload thumbnail (small, base64 → blob)
        if (thumb) {
          const thumbBlob = await fetch(thumb).then(r => r.blob());
          await supabase.storage.from(BUCKET).upload(`${path}_thumb.jpg`, thumbBlob, {
            contentType: "image/jpeg", upsert: true,
          });
        }
      } catch (e) { console.error("Photo upload failed:", photoId, e); }
    }
    processing.current = false;
  }, [userId]);

  // Queue a photo for upload after local save
  const uploadPhoto = useCallback((photoId, arrayBuffer, thumbDataUrl) => {
    if (!isEnabled) return;
    const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
    uploadQueue.current.push({ photoId, blob, thumb: thumbDataUrl });
    processQueue();
  }, [isEnabled, processQueue]);

  // Delete photo from cloud
  const deleteCloudPhoto = useCallback(async (photoId) => {
    if (!isEnabled) return;
    try {
      const path = `${userId}/${photoId}`;
      await supabase.storage.from(BUCKET).remove([`${path}.jpg`, `${path}_thumb.jpg`]);
    } catch (e) { console.error("Cloud photo delete failed:", e); }
  }, [isEnabled, userId]);

  // List all cloud photos for this user
  const listCloudPhotos = useCallback(async () => {
    if (!isEnabled) return [];
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(userId, {
        limit: 500, sortBy: { column: "name", order: "asc" },
      });
      if (error) { console.error("List cloud photos failed:", error); return []; }
      // Filter to only full images (not thumbs)
      return (data || []).filter(f => f.name.endsWith(".jpg") && !f.name.endsWith("_thumb.jpg")).map(f => ({
        name: f.name.replace(".jpg", ""),
        fullPath: `${userId}/${f.name}`,
        thumbPath: `${userId}/${f.name.replace(".jpg", "_thumb.jpg")}`,
      }));
    } catch { return []; }
  }, [isEnabled, userId]);

  // Download a specific photo from cloud (returns { blob, thumb } or null)
  const downloadPhoto = useCallback(async (photoId) => {
    if (!isEnabled) return null;
    try {
      const path = `${userId}/${photoId}`;
      const [fullRes, thumbRes] = await Promise.all([
        supabase.storage.from(BUCKET).download(`${path}.jpg`),
        supabase.storage.from(BUCKET).download(`${path}_thumb.jpg`),
      ]);
      if (fullRes.error) return null;
      const arrayBuffer = await fullRes.data.arrayBuffer();
      let thumbDataUrl = null;
      if (!thumbRes.error && thumbRes.data) {
        const reader = new FileReader();
        thumbDataUrl = await new Promise(r => {
          reader.onload = () => r(reader.result);
          reader.readAsDataURL(thumbRes.data);
        });
      }
      return { blob: arrayBuffer, thumb: thumbDataUrl };
    } catch { return null; }
  }, [isEnabled, userId]);

  // Sync: download cloud photos that are missing from IndexedDB
  const syncFromCloud = useCallback(async (getDB) => {
    if (!isEnabled) return 0;
    try {
      const cloudPhotos = await listCloudPhotos();
      if (cloudPhotos.length === 0) return 0;

      const db = await getDB();
      const tx = db.transaction("photos", "readonly");
      const localIds = await new Promise(r => {
        const req = tx.objectStore("photos").getAllKeys();
        req.onsuccess = () => r(new Set(req.result));
      });

      let restored = 0;
      for (const cp of cloudPhotos) {
        if (localIds.has(cp.name)) continue; // Already have it locally
        const photo = await downloadPhoto(cp.name);
        if (!photo) continue;

        // Extract day from photoId: "photo-3-1234567890" → day 3
        const dayMatch = cp.name.match(/^photo-(\d+)-/);
        const day = dayMatch ? parseInt(dayMatch[1]) : 0;

        const wtx = db.transaction("photos", "readwrite");
        wtx.objectStore("photos").put({
          id: cp.name, day, blob: photo.blob, thumb: photo.thumb || "", ts: Date.now(),
        });
        await new Promise(r => { wtx.oncomplete = r; });
        restored++;
      }
      return restored;
    } catch (e) { console.error("Photo sync from cloud failed:", e); return 0; }
  }, [isEnabled, listCloudPhotos, downloadPhoto]);

  return {
    uploadPhoto,
    deleteCloudPhoto,
    syncFromCloud,
    isEnabled,
  };
}
