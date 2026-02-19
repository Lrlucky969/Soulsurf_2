// SoulSurf – Central State Hook (v4.8 – Cloud Sync)
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

export default function useSurfData(sync) {
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
    if (sync?.uploadTrips) sync.uploadTrips({ trips: newTrips, activeTrip: newActive });
  }, [sync]);

  const saveAll = useCallback((overrides = {}) => {
    const base = { days, goal, spot, board, experience, completed, diary, activeDay, surfDays };
    saveData({ ...base, ...overrides });
    setSavedAt(new Date().toISOString());
    // Cloud sync (if logged in)
    if (sync?.uploadProgram) sync.uploadProgram({ ...base, ...overrides });
  }, [days, goal, spot, board, experience, completed, diary, activeDay, surfDays, sync]);

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
    const sorted = [...new Set(surfDays)].sort((a, b) => b.localeCompare(a)); // dedupe + sort newest first
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    // Streak must start from today or yesterday
    if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      // Check if previous day in sorted list is exactly 1 calendar day before
      const prevDate = new Date(sorted[i - 1] + "T12:00:00"); // noon to avoid timezone issues
      const expectedPrev = new Date(prevDate);
      expectedPrev.setDate(expectedPrev.getDate() - 1);
      const expectedStr = expectedPrev.toISOString().slice(0, 10);
      if (sorted[i] === expectedStr) count++;
      else break;
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

  // Restore data from cloud (called after login if cloud has newer data)
  const restoreFromCloud = useCallback((cloudData) => {
    if (!cloudData) return;
    if (cloudData.program) {
      const p = cloudData.program;
      if (p.days) setDays(p.days);
      if (p.goal) setGoal(p.goal);
      if (p.spot) setSpot(p.spot);
      if (p.board) setBoard(p.board);
      if (p.experience) setExperience(p.experience);
      if (p.completed) setCompleted(p.completed);
      if (p.diary) setDiary(p.diary);
      if (p.activeDay) setActiveDay(p.activeDay);
      if (p.surfDays) setSurfDays(p.surfDays);
      if (p.days && p.goal && p.spot) {
        const eq = { board: p.board || "none", experience: p.experience || "zero" };
        setProgram(generateProgram(p.days, p.goal, p.spot, eq));
      }
      saveData(p);
    }
    if (cloudData.trips) {
      const t = cloudData.trips;
      if (t.trips) setTrips(t.trips);
      if (t.activeTrip) setActiveTrip(t.activeTrip);
      saveTrips(t);
    }
  }, []);

  // Snapshot for cloud upload
  const getProgramSnapshot = useCallback(() => {
    return { days, goal, spot, board, experience, completed, diary, activeDay, surfDays };
  }, [days, goal, spot, board, experience, completed, diary, activeDay, surfDays]);

  const getTripsSnapshot = useCallback(() => {
    return { trips, activeTrip };
  }, [trips, activeTrip]);

  // === GAMIFICATION: XP, Levels, Daily Goals, Weekly Challenges ===
  const gamification = useMemo(() => {
    // XP calculation
    const lessonXP = done * 25;
    const diaryXP = diaryCount * 15;
    const surfDayXP = (surfDays?.length || 0) * 20;
    const streakBonus = streak >= 7 ? 100 : streak >= 3 ? 30 : 0;
    const tripXP = (trips?.length || 0) * 10;
    const totalXP = lessonXP + diaryXP + surfDayXP + streakBonus + tripXP;

    // Level system
    const LEVELS = [
      { name: "Grom", emoji: "🐣", minXP: 0 },
      { name: "Paddler", emoji: "🏊", minXP: 100 },
      { name: "Wave Catcher", emoji: "🌊", minXP: 300 },
      { name: "Local", emoji: "🤙", minXP: 600 },
      { name: "Shredder", emoji: "🔥", minXP: 1000 },
      { name: "Ripper", emoji: "⚡", minXP: 1500 },
      { name: "Pro", emoji: "🏆", minXP: 2500 },
      { name: "Legend", emoji: "👑", minXP: 4000 },
    ];
    const currentLevel = [...LEVELS].reverse().find(l => totalXP >= l.minXP) || LEVELS[0];
    const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1] || null;
    const levelProgress = nextLevel ? (totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP) : 1;

    // Daily Goals (reset daily, based on what user hasn't done today)
    const today = new Date().toISOString().slice(0, 10);
    const surfedToday = (surfDays || []).includes(today);
    const diaryToday = diary[program?.program?.findIndex?.((d, i) => {
      const todayEntry = diary[i + 1];
      return todayEntry && (todayEntry.whatWorked || todayEntry.whatFailed || todayEntry.notes || todayEntry.mood);
    }) + 1] != null;
    // Simplified: check if any diary entry was updated today
    const hasDiaryToday = Object.values(diary).some(e => e?.lastEdited === today);

    const dailyGoals = [
      { id: "lesson", label: "1 Lektion abschließen", emoji: "📚", xp: 25, done: done > 0 && Object.entries(completed).some(([k, v]) => v) },
      { id: "surf", label: "Heute gesurft loggen", emoji: "🏄", xp: 20, done: surfedToday },
      { id: "diary", label: "Tagebuch-Eintrag schreiben", emoji: "📓", xp: 15, done: hasDiaryToday || diaryCount > 0 },
    ];
    const dailyDone = dailyGoals.filter(g => g.done).length;
    const dailyBonusXP = dailyDone === 3 ? 20 : 0; // Bonus for completing all 3

    // Weekly Challenges (deterministic per week using week number)
    const weekNum = Math.floor((Date.now() - new Date("2026-01-01").getTime()) / (7 * 86400000));
    const ALL_CHALLENGES = [
      { id: "surf3", label: "3 Tage diese Woche surfen", emoji: "🏄", target: 3, check: () => { const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); const ws = weekStart.toISOString().slice(0, 10); return (surfDays || []).filter(d => d >= ws).length; } },
      { id: "lessons5", label: "5 Lektionen abschließen", emoji: "📚", target: 5, check: () => done },
      { id: "diary5", label: "5 Tagebuch-Einträge", emoji: "📓", target: 5, check: () => diaryCount },
      { id: "streak3", label: "3-Tage Streak erreichen", emoji: "🔥", target: 3, check: () => streak },
      { id: "lessons10", label: "10 Lektionen schaffen", emoji: "💪", target: 10, check: () => done },
      { id: "surf5", label: "5 Tage diese Woche surfen", emoji: "🌊", target: 5, check: () => { const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); const ws = weekStart.toISOString().slice(0, 10); return (surfDays || []).filter(d => d >= ws).length; } },
    ];
    // Pick 2 challenges per week (deterministic)
    const c1 = ALL_CHALLENGES[weekNum % ALL_CHALLENGES.length];
    const c2 = ALL_CHALLENGES[(weekNum + 3) % ALL_CHALLENGES.length];
    const weeklyChallenges = [c1, c2].map(c => ({
      ...c,
      current: c.check(),
      completed: c.check() >= c.target,
    }));

    return {
      totalXP: totalXP + dailyBonusXP,
      currentLevel,
      nextLevel,
      levelProgress,
      dailyGoals,
      dailyDone,
      dailyBonusXP,
      weeklyChallenges,
      xpBreakdown: { lessonXP, diaryXP, surfDayXP, streakBonus, tripXP },
    };
  }, [done, diaryCount, surfDays, streak, trips, diary, completed, program]);

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
    // Gamification
    gamification,
    // Cloud sync helpers
    restoreFromCloud, getProgramSnapshot, getTripsSnapshot,
  };
}
