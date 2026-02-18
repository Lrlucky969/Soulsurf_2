// SoulSurf – Central State Hook (v4.0)
import { useState, useEffect, useCallback, useMemo } from "react";
import { CONTENT_POOL, analyzeDiary } from "./data.js";
import { generateProgram } from "./generator.js";

const STORAGE_KEY = "soulsurf_data";
const TRIP_KEY = "soulsurf_trip";

function loadSaved() { try { if (typeof localStorage === "undefined") return null; const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch { return null; } }
function saveData(data) { try { if (typeof localStorage === "undefined") return; localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() })); } catch {} }
function clearData() { try { if (typeof localStorage === "undefined") return; localStorage.removeItem(STORAGE_KEY); } catch {} }
function loadTrip() { try { const d = localStorage.getItem(TRIP_KEY); return d ? JSON.parse(d) : null; } catch { return null; } }
function saveTrip(data) { try { localStorage.setItem(TRIP_KEY, JSON.stringify(data)); } catch {} }

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
  const [tripDates, setTripDates] = useState({ start: "", end: "" });
  const [tripChecked, setTripChecked] = useState({});
  const [darkMode, setDarkMode] = useState(false);

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
    const trip = loadTrip();
    if (trip) {
      if (trip.dates) setTripDates(trip.dates);
      if (trip.checked) setTripChecked(trip.checked);
    }
    setHydrated(true);
  }, []);

  const saveAll = useCallback((overrides = {}) => {
    const base = { days, goal, spot, board, experience, completed, diary, activeDay, surfDays };
    saveData({ ...base, ...overrides });
    setSavedAt(new Date().toISOString());
  }, [days, goal, spot, board, experience, completed, diary, activeDay, surfDays]);

  const updateTripDates = useCallback((dates) => { setTripDates(dates); saveTrip({ dates, checked: tripChecked }); }, [tripChecked]);
  const updateTripChecked = useCallback((fn) => {
    setTripChecked(prev => { const next = typeof fn === "function" ? fn(prev) : fn; saveTrip({ dates: tripDates, checked: next }); return next; });
  }, [tripDates]);

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

  const updateDiary = useCallback((dayNum, field, value) => {
    setDiary(prev => {
      const entry = prev[dayNum] || { date: new Date().toISOString() };
      const next = { ...prev, [dayNum]: { ...entry, [field]: value, date: entry.date || new Date().toISOString() } };
      saveAll({ diary: next });
      return next;
    });
  }, [saveAll]);

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
      const data = { days, goal, spot, board, experience, completed, diary, activeDay, surfDays, exportedAt: new Date().toISOString(), version: "4.0" };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
      a.download = `soulsurf-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { console.error("Export failed:", e); }
  }, [days, goal, spot, board, experience, completed, diary, activeDay, surfDays]);

  const total = program?.program?.reduce((s, d) => s + d.lessons.length, 0) || 0;
  const done = Object.values(completed).filter(Boolean).length;
  const diaryCount = Object.keys(diary).filter(k => { const e = diary[k]; return e && (e.whatWorked || e.whatFailed || e.notes || e.mood); }).length;
  const hasSaved = hydrated && program !== null && days && goal && spot;
  const coaching = useMemo(() => analyzeDiary(diary, CONTENT_POOL), [diary]);

  return {
    days, setDays, goal, setGoal, spot, setSpot, board, setBoard,
    experience, setExperience, program, activeDay, setActiveDay,
    completed, diary, surfDays, hydrated, savedAt, darkMode, toggleDark,
    tripDates, updateTripDates, tripChecked, updateTripChecked,
    toggle, toggleSurfDay, updateDiary, build, resetProgram, saveAll,
    exportData, total, done, diaryCount, hasSaved, streak, coaching,
  };
}
