// SoulSurf – Decision Engine v6.4 (Sprint 33: Strategic Refocus)
// Rule-based recommendation system: skillLevel × conditions × spot → action
//
// Input:  userData (from useSurfData), conditions (from useForecast), spot (from data.js)
// Output: { confidence, action, reason, reasonKey, cta, conditions }

/**
 * @param {Object} userData - { skillLevel, primaryGoal, wantsSchoolHelp, done, streak, hasSaved }
 * @param {Object|null} conditions - { waveHeight, wavePeriod, wind, gusts, surfScore, temp, code }
 * @param {Object|null} spot - SURF_SPOTS entry { id, difficulty, breakType, hazards, ... }
 * @returns {Object} recommendation
 */
export function getTodayRecommendation(userData, conditions, spot) {
  const { skillLevel = "beginner", wantsSchoolHelp = true, hasSaved, done = 0, primaryGoal } = userData || {};

  // ─── No data fallback ───
  if (!conditions || !spot) {
    return {
      confidence: "unknown",
      action: "check_later",
      reasonKey: "decision.noData",
      reason: "Forecast-Daten laden...",
      cta: null,
      conditions: null,
    };
  }

  const { waveHeight, wavePeriod, wind, gusts, surfScore: score, code } = conditions;
  const isBeginnerSpot = spot.difficulty === "beginner";
  const isReef = spot.breakType === "reef";
  const hasStrongCurrent = (spot.hazards || []).includes("current");

  // ─── Rule 1: Dangerous weather (storms, lightning) ───
  if (code >= 95) {
    return rec("low", "no_surf", "decision.storm", "Gewitter – heute nicht sicher", null, conditions);
  }

  // ─── Rule 2: Flat / no waves ───
  if (waveHeight != null && waveHeight < 0.3) {
    return rec("high", "no_surf", "decision.flat", "Flat – keine surfbaren Wellen", 
      hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions);
  }

  // ─── Rule 3: Beginner + Big waves (>1.5m) ───
  if (skillLevel === "beginner" && waveHeight > 1.5) {
    return rec("low",
      wantsSchoolHelp ? "book_lesson" : "wait_better_day",
      "decision.tooBigBeginner",
      "Wellen zu groß für dein Level",
      wantsSchoolHelp ? { text: "decision.cta.findCoach", screen: "schools" } : { text: "decision.cta.otherSpots", screen: "forecast" },
      conditions
    );
  }

  // ─── Rule 4: Beginner + Reef + no school help ───
  if (skillLevel === "beginner" && isReef && !wantsSchoolHelp) {
    return rec("medium", "surf_with_caution", "decision.reefCaution", 
      "Riff-Spot – besonders vorsichtig sein",
      { text: "decision.cta.spotTips", screen: "forecast" }, conditions);
  }

  // ─── Rule 5: Beginner + Reef → suggest lesson ───
  if (skillLevel === "beginner" && isReef && wantsSchoolHelp) {
    return rec("medium", "book_lesson", "decision.reefLesson",
      "Riff-Spot – ein Guide hilft beim Einstieg",
      { text: "decision.cta.findCoach", screen: "schools" }, conditions);
  }

  // ─── Rule 6: Strong wind (>30 km/h) ───
  if (wind > 30 || (gusts && gusts > 45)) {
    return rec("low", "no_surf", "decision.tooWindy",
      "Zu windig – unruhige Bedingungen",
      hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions);
  }

  // ─── Rule 7: Moderate wind (20-30) → caution ───
  if (wind > 20) {
    const action = skillLevel === "beginner" ? (wantsSchoolHelp ? "book_lesson" : "surf_with_caution") : "surf_with_caution";
    return rec("medium", action, "decision.windy",
      "Windiger Tag – Bedingungen sind unruhig",
      action === "book_lesson" ? { text: "decision.cta.findCoach", screen: "schools" } : { text: "decision.cta.checkForecast", screen: "forecast" },
      conditions);
  }

  // ─── Rule 8: Perfect conditions for beginners ───
  if (skillLevel === "beginner" && waveHeight >= 0.4 && waveHeight <= 1.2 && wind < 15 && isBeginnerSpot) {
    return rec("high", "surf_solo", "decision.perfectBeginner",
      "Perfekte Bedingungen für dein Level!",
      hasSaved ? { text: "decision.cta.todayLesson", screen: "lessons" } : { text: "decision.cta.createProgram", screen: "builder" },
      conditions);
  }

  // ─── Rule 9: Good conditions (score >= 60) ───
  if (score >= 60) {
    const action = skillLevel === "beginner" && !isBeginnerSpot ? "surf_with_caution" : "surf_solo";
    return rec("high", action, "decision.goodConditions",
      "Gute Bedingungen – ab ins Wasser!",
      hasSaved ? { text: "decision.cta.todayLesson", screen: "lessons" } : { text: "decision.cta.createProgram", screen: "builder" },
      conditions);
  }

  // ─── Rule 10: Okay conditions (score 40-60) ───
  if (score >= 40) {
    return rec("medium", "surf_with_caution", "decision.okayConditions",
      "Mittelmäßige Bedingungen – kann gehen",
      { text: "decision.cta.checkForecast", screen: "forecast" }, conditions);
  }

  // ─── Rule 11: Lower intermediate + challenging waves ───
  if (skillLevel === "lower_intermediate" && waveHeight > 1.8) {
    return rec("medium",
      wantsSchoolHelp ? "book_lesson" : "surf_with_caution",
      "decision.challengingIntermediate",
      "Anspruchsvolle Bedingungen – Coach empfohlen",
      wantsSchoolHelp ? { text: "decision.cta.findCoach", screen: "schools" } : null,
      conditions);
  }

  // ─── Default: suboptimal ───
  return rec("low", "surf_with_caution", "decision.suboptimal",
    "Nicht die besten Bedingungen",
    hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions);
}

// Helper to build recommendation object
function rec(confidence, action, reasonKey, reason, cta, conditions) {
  return { confidence, action, reasonKey, reason, cta, conditions };
}

// ─── Confidence → visual mapping ───
export function confidenceDisplay(confidence) {
  switch (confidence) {
    case "high": return { emoji: "🟢", color: "#4CAF50", label: "decision.confidence.high" };
    case "medium": return { emoji: "🟡", color: "#FF9800", label: "decision.confidence.medium" };
    case "low": return { emoji: "🔴", color: "#F44336", label: "decision.confidence.low" };
    default: return { emoji: "⚪", color: "#9E9E9E", label: "decision.confidence.unknown" };
  }
}

// ─── Action → visual mapping ───
export function actionDisplay(action) {
  switch (action) {
    case "surf_solo": return { emoji: "🏄", color: "#4CAF50", label: "decision.action.surfSolo" };
    case "book_lesson": return { emoji: "🏫", color: "#FF9800", label: "decision.action.bookLesson" };
    case "surf_with_caution": return { emoji: "⚠️", color: "#FFC107", label: "decision.action.caution" };
    case "wait_better_day": return { emoji: "⏳", color: "#90A4AE", label: "decision.action.wait" };
    case "no_surf": return { emoji: "🚫", color: "#F44336", label: "decision.action.noSurf" };
    case "check_later": return { emoji: "⏳", color: "#9E9E9E", label: "decision.action.checkLater" };
    default: return { emoji: "❓", color: "#9E9E9E", label: "decision.action.unknown" };
  }
}
