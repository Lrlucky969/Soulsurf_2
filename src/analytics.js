// SoulSurf – Analytics v6.6 (V1: Decision → Booking Flow)
// Simple localStorage event tracking for conversion funnel
// Events: decision_shown, decision_cta_clicked, booking_started, booking_completed
//
// Future: migrate to Supabase in V5 if auth available

const STORAGE_KEY = "soulsurf_analytics";
const MAX_EVENTS = 500;

function getEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveEvents(events) {
  try {
    // Keep only latest MAX_EVENTS
    const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

/**
 * Track an analytics event
 * @param {string} type - Event type (decision_shown, decision_cta_clicked, etc.)
 * @param {Object} data - Event context data
 */
export function trackEvent(type, data = {}) {
  const event = {
    type,
    data,
    time: new Date().toISOString(),
    session: getSessionId(),
  };
  const events = getEvents();
  events.push(event);
  saveEvents(events);
}

/**
 * Get all tracked events (for debugging/analysis)
 * @param {string} [type] - Optional filter by event type
 * @returns {Array}
 */
export function getTrackedEvents(type) {
  const events = getEvents();
  return type ? events.filter(e => e.type === type) : events;
}

/**
 * Get simple funnel stats
 * @returns {Object} { shown, clicked, booked, conversionRate }
 */
export function getFunnelStats() {
  const events = getEvents();
  const shown = events.filter(e => e.type === "decision_shown").length;
  const clicked = events.filter(e => e.type === "decision_cta_clicked").length;
  const booked = events.filter(e => e.type === "booking_started").length;
  return {
    shown,
    clicked,
    booked,
    clickRate: shown > 0 ? Math.round((clicked / shown) * 100) : 0,
    bookRate: clicked > 0 ? Math.round((booked / clicked) * 100) : 0,
  };
}

/** Clear all analytics (for testing) */
export function clearAnalytics() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// Session ID (persists for 30 min of inactivity)
let _sessionId = null;
let _sessionTime = 0;
function getSessionId() {
  const now = Date.now();
  if (!_sessionId || now - _sessionTime > 30 * 60 * 1000) {
    _sessionId = "s_" + Math.random().toString(36).slice(2, 10);
  }
  _sessionTime = now;
  return _sessionId;
}
