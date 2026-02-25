// SoulSurf – Spot Suitability v6.5 (Sprint 34: Unified Surf Screen)
// Matches spots to user skill level: difficulty + breakType + hazards → suitability
import { getSchoolsBySpot } from "./data.js";

/**
 * @param {Object} spot - SURF_SPOTS entry { difficulty, breakType, hazards, crowd }
 * @param {string} skillLevel - "beginner" | "lower_intermediate" | "intermediate"
 * @returns {{ level, emoji, color, labelKey, score, reasons }}
 */
export function getSpotSuitability(spot, skillLevel = "beginner") {
  if (!spot) return { level: "unknown", emoji: "⚪", color: "#9E9E9E", labelKey: "suit.unknown", score: 0, reasons: [] };

  let score = 100;
  const reasons = [];
  const sl = skillLevel || "beginner";

  // ─── Difficulty match ───
  const diffMap = { beginner: 0, intermediate: 1, advanced: 2 };
  const spotDiff = diffMap[spot.difficulty] ?? 1;
  const userDiff = sl === "beginner" ? 0 : sl === "lower_intermediate" ? 0.5 : 1;

  if (spotDiff > userDiff + 0.5) {
    score -= 40;
    reasons.push("suit.tooAdvanced");
  } else if (spotDiff > userDiff) {
    score -= 15;
    reasons.push("suit.challenging");
  } else if (spotDiff < userDiff - 0.5) {
    // Spot is easier than user level – small bonus for safety, but maybe boring
    score += 5;
  }

  // ─── BreakType ───
  if (sl === "beginner") {
    if (spot.breakType === "reef") { score -= 20; reasons.push("suit.reefRisk"); }
    if (spot.breakType === "point") { score -= 5; } // Points can be ok for beginners
  }

  // ─── Hazards ───
  const hazards = spot.hazards || [];
  if (sl === "beginner") {
    if (hazards.includes("reef")) { score -= 10; reasons.push("suit.reef"); }
    if (hazards.includes("current")) { score -= 10; reasons.push("suit.current"); }
    if (hazards.includes("locals")) { score -= 5; reasons.push("suit.locals"); }
  } else if (sl === "lower_intermediate") {
    if (hazards.includes("current")) { score -= 5; }
  }

  // ─── Crowd (if available) ───
  if (spot.crowd) {
    if (spot.crowd === "high" && sl === "beginner") { score -= 10; reasons.push("suit.crowded"); }
    if (spot.crowd === "low") { score += 5; }
  }

  // ─── Schools available = bonus for beginners ───
  if (sl === "beginner" || sl === "lower_intermediate") {
    const schools = getSchoolsBySpot(spot.id);
    if (schools.length > 0) { score += 10; reasons.push("suit.schoolsAvail"); }
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Map to levels
  if (score >= 75) return { level: "perfect", emoji: "🟢", color: "#4CAF50", labelKey: "suit.perfect", score, reasons };
  if (score >= 50) return { level: "suitable", emoji: "🟡", color: "#FF9800", labelKey: "suit.suitable", score, reasons };
  return { level: "challenging", emoji: "🔴", color: "#F44336", labelKey: "suit.challenging", score, reasons };
}

/**
 * Sort spots by suitability for a given skill level
 * @param {Array} spots - SURF_SPOTS array
 * @param {string} skillLevel
 * @returns {Array} sorted spots with .suitability attached
 */
export function sortSpotsBySuitability(spots, skillLevel) {
  return spots
    .map(s => ({ ...s, suitability: getSpotSuitability(s, skillLevel) }))
    .sort((a, b) => b.suitability.score - a.suitability.score);
}
