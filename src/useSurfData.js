// SoulSurf – Central State Hook (v4.6 – Performance)
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CONTENT_POOL, analyzeDiary } from "./data.js";
import { generateProgram } from "./generator.js";

const STORAGE_KEY = "soulsurf_data";
const TRIP_KEY = "soulsurf_trips";

// Debounce helper for diary saves
function useDebounce(fn, delay = 500) {
  const timer = useRef(null);
  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function loadSaved() { try { if (typeof localStorage === "undefined") return null; const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; } }
function saveData(data) { try { if (typeof localStorage === "undefined") return; localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() })); } catch {} }
function clearData() { try { if (typeof localStorage === "undefined") return; localStorage.removeItem(STORAGE_KEY); } catch {} }
function loadTrips() { try { const d = localStorage.getItem(TRIP_KEY); return d ? JSON.parse(d) : null; } catch { return null; } }
function saveTrips(data) { try { localStorage.setItem(TRIP_KEY, JSON.stringify(data)); } catch {} }

// Migrate old single-trip to new format
function migrateOldTrip() {
  try {
    const old = localStorage.getItem("soulsurf_trip");
    if (old) {
      const parsed = JSON.parse(old);
      if (parsed.dates && (parsed.dates.start || parsed.dates.end)) {
        const trip = { id: "trip-" + Date.now(), name: "Mein Trip", spot: "", dates: parsed.dates, checked: parsed.checked || {}, notes: "", budget: "" };
        saveTrips({ trips: [trip], activeTrip: trip.id });
        localStorage.removeItem("soulsurf_trip");
        return { trips: [trip], activeTrip: trip.id };
      }
      localStorage.removeItem("soulsurf_trip");
    }
  } catch {}
  return null;
}

export default function useSurfData() {
  const [days, setDays] = useState(7);
  const [goal, setGoal] = useState("");
  const [spot, setSpot] = useState("");
  const [board, setBoard] = useState("");
  const [experience, setExperience] = useState("");
  const [program, setProgram] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [completed, setCompleted] = useState({});
  const [diary, setDiary] = useState({});
  const [surfDays, setSurfDays] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Multi-trip state
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    try { const saved = localStorage.getItem("soulsurf_dark"); if (saved === "true") setDarkMode(true); } catch {}
  }, []);
  const toggleDark = () => { const next = !darkMode; setDarkMode(next); try { localStorage.setItem("soulsurf_dark", String(next)); } catch {} };

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      if (saved.days) setDays(saved.days);
      if (saved.goal) setGoal(saved.goal);
      if (saved.spot) setSpot(saved.spot);
      if (saved.board) setBoard(saved.board);
      if (saved.experience) setExperience(saved.experience);
      if (saved.completed) setCompleted(saved.completed);
      if (saved.diary) setDiary(saved.diary);
      if (saved.activeDay) setActiveDay(saved.activeDay);
      if (saved.surfDays) setSurfDays(saved.surfDays);
      if (saved.savedAt) setSavedAt(saved.savedAt);
      if (saved.days && saved.goal && saved.spot) {
        const eq = { board: saved.board || "none", experience: saved.experience || "zero" };
        setProgram(generateProgram(saved.days, saved.goal, saved.spot, eq));
      }
    }
    // Load trips (with migration from old format)
    let tripData = loadTrips();
    if (!tripData) tripData = migrateOldTrip();
    if (tripData) {
      if (tripData.trips) setTrips(tripData.trips);
      if (tripData.activeTrip) setActiveTrip(tripData.activeTrip);
    }
    setHydrated(true);
  }, []);

  const persistTrips = useCallback((newTrips, newActive) => {
    saveTrips({ trips: newTrips, activeTrip: newActive });
  }, []);

  const saveAll = useCallback((overrides = {}) => {
    const base = { days, goal, spot, board, experience, completed, diary, activeDay, surfDays };
    saveData({ ...base, ...overrides });
    setSavedAt(new Date().toISOString());
  }, [days, goal, spot, board, experience, completed, diary, activeDay, surfDays]);

  // Trip CRUD
  const createTrip = useCallback((name, spotId) => {
    const id = "trip-" + Date.now();
    const trip = { id, name: name || "Neuer Trip", spot: spotId || "", dates: { start: "", end: "" }, checked: {}, notes: "", budget: "" };
    const next = [...trips, trip];
    setTrips(next); setActiveTrip(id);
    persistTrips(next, id);
    return id;
  }, [trips, persistTrips]);

  const updateTrip = useCallback((id, updates) => {
    const next = trips.map(tr => tr.id === id ? { ...tr, ...updates } : tr);
    setTrips(next);
    persistTrips(next, activeTrip);
  }, [trips, activeTrip, persistTrips]);

  const deleteTrip = useCallback((id) => {
    const next = trips.filter(tr => tr.id !== id);
    const newActive = activeTrip === id ? (next[0]?.id || null) : activeTrip;
    setTrips(next); setActiveTrip(newActive);
    persistTrips(next, newActive);
  }, [trips, activeTrip, persistTrips]);

  const switchTrip = useCallback((id) => {
    setActiveTrip(id);
    persistTrips(trips, id);
  }, [trips, persistTrips]);

  const resetPackingList = useCallback((tripId) => {
    updateTrip(tripId, { checked: {} });
  }, [updateTrip]);

  const currentTrip = useMemo(() => trips.find(tr => tr.id === activeTrip) || null, [trips, activeTrip]);

  // Legacy compat wrappers
  const tripDates = currentTrip?.dates || { start: "", end: "" };
  const tripChecked = currentTrip?.checked || {};
  const updateTripDates = useCallback((dates) => { if (activeTrip) updateTrip(activeTrip, { dates }); }, [activeTrip, updateTrip]);
  const updateTripChecked = useCallback((fn) => {
    if (!activeTrip) return;
    const prev = currentTrip?.checked || {};
    const next = typeof fn === "function" ? fn(prev) : fn;
    updateTrip(activeTrip, { checked: next });
  }, [activeTrip, currentTrip, updateTrip]);

  // Streak
  const streak = useMemo(() => {
    if (!surfDays || surfDays.length === 0) return 0;
    const sorted = [...surfDays].sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const cur = new Date(sorted[i]);
      if ((prev - cur) / 86400000 === 1) count++; else break;
    }
    return count;
  }, [surfDays]);

  const toggleSurfDay = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setSurfDays(prev => { const next = prev.includes(today) ? prev.filter(d => d !== today) : [...prev, today]; saveAll({ surfDays: next }); return next; });
  }, [saveAll]);

  const toggle = useCallback((id) => {
    setCompleted(p => { const next = { ...p, [id]: !p[id] }; saveAll({ completed: next }); return next; });
  }, [saveAll]);

  // Debounced save for diary (avoids excessive localStorage writes while typing)
  const debouncedSave = useDebounce((diaryData) => {
    saveAll({ diary: diaryData });
  }, 600);

  const updateDiary = useCallback((dayNum, field, value) => {
    setDiary(prev => {
      const entry = prev[dayNum] || { date: new Date().toISOString() };
      const next = { ...prev, [dayNum]: { ...entry, [field]: value, date: entry.date || new Date().toISOString() } };
      debouncedSave(next);
      return next;
    });
  }, [debouncedSave]);

  const build = useCallback(() => {
    if (!days || !goal || !spot) return null;
    const eq = { board: board || "none", experience: experience || "zero" };
    const p = generateProgram(days, goal, spot, eq);
    setProgram(p); setActiveDay(1); setCompleted({}); setDiary({}); setSurfDays([]);
    saveData({ days, goal, spot, board, experience, equipment: eq, completed: {}, diary: {}, activeDay: 1, surfDays: [] });
    return p;
  }, [days, goal, spot, board, experience]);

  const resetProgram = useCallback(() => {
    clearData(); setProgram(null); setDays(7); setGoal(""); setSpot(""); setBoard("");
    setExperience(""); setCompleted({}); setDiary({}); setSurfDays([]);
    setActiveDay(null); setSavedAt(null);
  }, []);

  const exportData = useCallback(() => {
    try {
      const data = { days, goal, spot, board, experience, completed, diary, activeDay, surfDays, trips, exportedAt: new Date().toISOString(), version: "4.1" };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
      a.download = `soulsurf-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { console.error("Export failed:", e); }
  }, [days, goal, spot, board, experience, completed, diary, activeDay, surfDays, trips]);

  const total = program?.program?.reduce((s, d) => s + d.lessons.length, 0) || 0;
  const done = Object.values(completed).filter(Boolean).length;
  const diaryCount = Object.keys(diary).filter(k => { const e = diary[k]; return e && (e.whatWorked || e.whatFailed || e.notes || e.mood); }).length;
  const hasSaved = hydrated && program !== null && days && goal && spot;
  const coaching = useMemo(() => analyzeDiary(diary, CONTENT_POOL), [diary]);

  return {
    days, setDays, goal, setGoal, spot, setSpot, board, setBoard,
    experience, setExperience, program, activeDay, setActiveDay,
    completed, diary, surfDays, hydrated, savedAt, darkMode, toggleDark,
    // Multi-trip API
    trips, activeTrip, currentTrip, createTrip, updateTrip, deleteTrip, switchTrip, resetPackingList,
    // Legacy compat
    tripDates, updateTripDates, tripChecked, updateTripChecked,
    toggle, toggleSurfDay, updateDiary, build, resetProgram, saveAll,
    exportData, total, done, diaryCount, hasSaved, streak, coaching,
  };
}
