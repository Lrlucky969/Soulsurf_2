// SoulSurf – Decision Engine v6.9 (V4: Decision Dominance)
// Enhanced: crowd-aware, beginnerZone tips, lesson recommendations
// Rule-based: skillLevel × conditions × spot × crowd → action

const T = {
  FLAT_MAX: 0.3,
  BEGINNER_MAX_WAVE: 1.5,
  LOWER_INT_MAX_WAVE: 1.8,
  BEGINNER_IDEAL_MIN: 0.4,
  BEGINNER_IDEAL_MAX: 1.2,
  BEGINNER_IDEAL_WIND: 15,
  WIND_MODERATE: 20,
  WIND_STRONG: 30,
  GUST_STRONG: 45,
  SCORE_GOOD: 60,
  SCORE_OKAY: 40,
  STORM_CODE: 95,
};

export function getTodayRecommendation(userData, conditions, spot) {
  const { skillLevel = "beginner", wantsSchoolHelp = true, hasSaved, done = 0 } = userData || {};

  if (!conditions || !spot) {
    return rec("unknown", "check_later", "decision.noData", null, null, null, null);
  }

  const wh = conditions.waveHeight;
  const wind = conditions.wind;
  const gusts = conditions.gusts;
  const score = conditions.surfScore;
  const code = conditions.code;
  const isBeginnerSpot = spot.difficulty === "beginner";
  const isReef = spot.breakType === "reef";
  const isCrowded = spot.crowd === "high";
  const beginnerZone = spot.beginnerZones?.[0] || null;

  // Rule 1: Dangerous weather
  if (code != null && code >= T.STORM_CODE) {
    return rec("low", "no_surf", "decision.storm", null,
      hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions, null);
  }

  // Rule 2: Flat
  if (wh != null && wh < T.FLAT_MAX) {
    return rec("high", "no_surf", "decision.flat", null,
      hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions, null);
  }

  // Rule 3: No wave data
  if (wh == null) {
    return rec("unknown", "check_later", "decision.noWaveData", null,
      { text: "decision.cta.checkForecast", screen: "forecast" }, conditions, null);
  }

  // Rule 4: Beginner + Big waves
  if (skillLevel === "beginner" && wh > T.BEGINNER_MAX_WAVE) {
    return rec("low",
      wantsSchoolHelp ? "book_lesson" : "wait_better_day",
      "decision.tooBigBeginner", null,
      wantsSchoolHelp ? { text: "decision.cta.findCoach", screen: "schools" } : { text: "decision.cta.otherSpots", screen: "forecast" },
      conditions, null);
  }

  // Rule 5: Beginner + Reef
  if (skillLevel === "beginner" && isReef) {
    return wantsSchoolHelp
      ? rec("medium", "book_lesson", "decision.reefLesson", null, { text: "decision.cta.findCoach", screen: "schools" }, conditions, null)
      : rec("medium", "surf_with_caution", "decision.reefCaution", null, { text: "decision.cta.spotTips", screen: "forecast" }, conditions, null);
  }

  // Rule 6: Strong wind
  if ((wind != null && wind > T.WIND_STRONG) || (gusts != null && gusts > T.GUST_STRONG)) {
    return rec("low", "no_surf", "decision.tooWindy", null,
      hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions, null);
  }

  // Rule 7: Moderate wind
  if (wind != null && wind > T.WIND_MODERATE) {
    const action = skillLevel === "beginner" && wantsSchoolHelp ? "book_lesson" : "surf_with_caution";
    return rec("medium", action, "decision.windy", null,
      action === "book_lesson" ? { text: "decision.cta.findCoach", screen: "schools" } : { text: "decision.cta.checkForecast", screen: "forecast" },
      conditions, null);
  }

  // Rule 8: Perfect beginner conditions (v6.9: crowd + zone aware)
  if (skillLevel === "beginner" && wh >= T.BEGINNER_IDEAL_MIN && wh <= T.BEGINNER_IDEAL_MAX && (wind == null || wind < T.BEGINNER_IDEAL_WIND) && isBeginnerSpot) {
    return rec("high", "surf_solo", "decision.perfectBeginner", beginnerZone,
      hasSaved ? { text: "decision.cta.todayLesson", screen: "lessons" } : { text: "decision.cta.createProgram", screen: "builder" },
      conditions, isCrowded ? "decision.crowdedTip" : null);
  }

  // Rule 9: Good conditions (v6.9: crowded beginner → suggest coach)
  if (score != null && score >= T.SCORE_GOOD) {
    if (skillLevel === "beginner" && isCrowded && wantsSchoolHelp) {
      return rec("medium", "book_lesson", "decision.crowdedCoach", beginnerZone,
        { text: "decision.cta.findCoach", screen: "schools" }, conditions, "decision.crowdedTip");
    }
    const action = skillLevel === "beginner" && !isBeginnerSpot ? "surf_with_caution" : "surf_solo";
    return rec("high", action, "decision.goodConditions", beginnerZone,
      hasSaved ? { text: "decision.cta.todayLesson", screen: "lessons" } : { text: "decision.cta.createProgram", screen: "builder" },
      conditions, null);
  }

  // Rule 10: Okay conditions
  if (score != null && score >= T.SCORE_OKAY) {
    return rec("medium", "surf_with_caution", "decision.okayConditions", beginnerZone,
      { text: "decision.cta.checkForecast", screen: "forecast" }, conditions, null);
  }

  // Rule 11: Lower intermediate + challenging
  if (skillLevel === "lower_intermediate" && wh > T.LOWER_INT_MAX_WAVE) {
    return rec("medium",
      wantsSchoolHelp ? "book_lesson" : "surf_with_caution",
      "decision.challengingIntermediate", null,
      wantsSchoolHelp ? { text: "decision.cta.findCoach", screen: "schools" } : null,
      conditions, null);
  }

  // Default
  return rec("low", "surf_with_caution", "decision.suboptimal", null,
    hasSaved ? { text: "decision.cta.lesson", screen: "lessons" } : null, conditions, null);
}

function rec(confidence, action, reasonKey, beginnerZone, cta, conditions, secondaryNote) {
  return { confidence, action, reasonKey, reason: reasonKey, cta, conditions, beginnerZone, secondaryNote };
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
