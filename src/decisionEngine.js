// SoulSurf – Decision Engine v6.4.1 (Sprint 33: Bugfix Release)
// Rule-based recommendation: skillLevel × conditions × spot → action

// ─── Thresholds (no magic numbers) ───
const T = {
  FLAT_MAX: 0.3,            // m – below this = flat
  BEGINNER_MAX_WAVE: 1.5,   // m – above this = too big for beginner
  LOWER_INT_MAX_WAVE: 1.8,  // m – above this = challenging for lower_int
  BEGINNER_IDEAL_MIN: 0.4,  // m – ideal wave range for beginners
  BEGINNER_IDEAL_MAX: 1.2,  // m
  BEGINNER_IDEAL_WIND: 15,  // km/h – max wind for perfect beginner
  WIND_MODERATE: 20,        // km/h – above = caution
  WIND_STRONG: 30,          // km/h – above = no surf
  GUST_STRONG: 45,          // km/h
  SCORE_GOOD: 60,           // surfScore threshold
  SCORE_OKAY: 40,
  STORM_CODE: 95,           // WMO weather code
};

/**
 * @param {Object} userData - { skillLevel, primaryGoal, wantsSchoolHelp, done, streak, hasSaved }
 * @param {Object|null} conditions - { waveHeight, wavePeriod, wind, gusts, surfScore, temp, code }
 * @param {Object|null} spot - SURF_SPOTS entry { id, difficulty, breakType, hazards, ... }
 * @returns {Object} recommendation
 */
export function getTodayRecommendation(userData, conditions, spot) {
  const { skillLevel = "beginner", wantsSchoolHelp = true, hasSaved, done = 0 } = userData || {};

  // ─── No data fallback ───
  if (!conditions || !spot) {
    return rec("unknown", "check_later", "decision.noData", "Forecast-Daten laden...", null, null);
  }

  const wh = conditions.waveHeight;
  const wind = conditions.wind;
  const gusts = conditions.gusts;
  const score = conditions.surfScore;
  const code = conditions.code;
  const isBeginnerSpot = spot.difficulty === "beginner";
  const isReef = spot.breakType === "reef";

  // ─── Rule 1: Dangerous weather (storms, lightning) ───
  if (code != null && code >= T.STORM_CODE) {
    return rec("low", "no_surf", "decision.storm", "Gewitter – heute nicht sicher", null, conditions);
  }

  // ─── Rule 2: Flat / no waves (explicit null check: null = unknown, 0 = flat) ───
  if (wh != null && wh < T.FLAT_MAX) {
    return rec("high", "no_surf", "decision.flat", "Flat – keine surfbaren Wellen",
      hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions);
  }

  // ─── Rule 3: No wave data at all → can't recommend ───
  if (wh == null) {
    return rec("unknown", "check_later", "decision.noWaveData", "Keine Wellendaten verfügbar",
      { text: "decision.cta.checkForecast", screen: "forecast" }, conditions);
  }

  // ─── Rule 4: Beginner + Big waves ───
  if (skillLevel === "beginner" && wh > T.BEGINNER_MAX_WAVE) {
    return rec("low",
      wantsSchoolHelp ? "book_lesson" : "wait_better_day",
      "decision.tooBigBeginner", "Wellen zu groß für dein Level",
      wantsSchoolHelp ? { text: "decision.cta.findCoach", screen: "schools" } : { text: "decision.cta.otherSpots", screen: "forecast" },
      conditions);
  }

  // ─── Rule 5: Beginner + Reef → suggest lesson or caution ───
  if (skillLevel === "beginner" && isReef) {
    return wantsSchoolHelp
      ? rec("medium", "book_lesson", "decision.reefLesson", "Riff-Spot – ein Guide hilft beim Einstieg", { text: "decision.cta.findCoach", screen: "schools" }, conditions)
      : rec("medium", "surf_with_caution", "decision.reefCaution", "Riff-Spot – besonders vorsichtig sein", { text: "decision.cta.spotTips", screen: "forecast" }, conditions);
  }

  // ─── Rule 6: Strong wind ───
  if ((wind != null && wind > T.WIND_STRONG) || (gusts != null && gusts > T.GUST_STRONG)) {
    return rec("low", "no_surf", "decision.tooWindy", "Zu windig – unruhige Bedingungen",
      hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions);
  }

  // ─── Rule 7: Moderate wind (20-30) → caution ───
  if (wind != null && wind > T.WIND_MODERATE) {
    const action = skillLevel === "beginner" && wantsSchoolHelp ? "book_lesson" : "surf_with_caution";
    return rec("medium", action, "decision.windy", "Windiger Tag – Bedingungen sind unruhig",
      action === "book_lesson" ? { text: "decision.cta.findCoach", screen: "schools" } : { text: "decision.cta.checkForecast", screen: "forecast" },
      conditions);
  }

  // ─── Rule 8: Perfect conditions for beginners ───
  if (skillLevel === "beginner" && wh >= T.BEGINNER_IDEAL_MIN && wh <= T.BEGINNER_IDEAL_MAX && (wind == null || wind < T.BEGINNER_IDEAL_WIND) && isBeginnerSpot) {
    return rec("high", "surf_solo", "decision.perfectBeginner", "Perfekte Bedingungen für dein Level!",
      hasSaved ? { text: "decision.cta.todayLesson", screen: "lessons" } : { text: "decision.cta.createProgram", screen: "builder" },
      conditions);
  }

  // ─── Rule 9: Good conditions (score >= 60) ───
  if (score != null && score >= T.SCORE_GOOD) {
    const action = skillLevel === "beginner" && !isBeginnerSpot ? "surf_with_caution" : "surf_solo";
    return rec("high", action, "decision.goodConditions", "Gute Bedingungen – ab ins Wasser!",
      hasSaved ? { text: "decision.cta.todayLesson", screen: "lessons" } : { text: "decision.cta.createProgram", screen: "builder" },
      conditions);
  }

  // ─── Rule 10: Okay conditions (score 40-60) ───
  if (score != null && score >= T.SCORE_OKAY) {
    return rec("medium", "surf_with_caution", "decision.okayConditions", "Mittelmäßige Bedingungen – kann gehen",
      { text: "decision.cta.checkForecast", screen: "forecast" }, conditions);
  }

  // ─── Rule 11: Lower intermediate + challenging waves ───
  if (skillLevel === "lower_intermediate" && wh > T.LOWER_INT_MAX_WAVE) {
    return rec("medium",
      wantsSchoolHelp ? "book_lesson" : "surf_with_caution",
      "decision.challengingIntermediate", "Anspruchsvolle Bedingungen – Coach empfohlen",
      wantsSchoolHelp ? { text: "decision.cta.findCoach", screen: "schools" } : null,
      conditions);
  }

  // ─── Default: suboptimal ───
  return rec("low", "surf_with_caution", "decision.suboptimal", "Nicht die besten Bedingungen",
    hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions);
}

function rec(confidence, action, reasonKey, reason, cta, conditions) {
  return { confidence, action, reasonKey, reason, cta, conditions };
}

export function confidenceDisplay(confidence) {
  switch (confidence) {
    case "high": return { emoji: "🟢", color: "#4CAF50", label: "decision.confidence.high" };
    case "medium": return { emoji: "🟡", color: "#FF9800", label: "decision.confidence.medium" };
    case "low": return { emoji: "🔴", color: "#F44336", label: "decision.confidence.low" };
    default: return { emoji: "⚪", color: "#9E9E9E", label: "decision.confidence.unknown" };
  }
}

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
