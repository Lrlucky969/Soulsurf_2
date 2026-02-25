// SoulSurf – useForecast v6.4 (Sprint 33)
// Unified forecast hook: merges weather + swell + hourly into single `conditions` object
// Re-exports surfScore for convenience
import { useMemo } from "react";
import { useWeather, useSwell, useHourlyForecast, surfScore } from "./weather.js";

export { surfScore };

/**
 * Unified forecast hook
 * @param {Object|null} spot - SURF_SPOTS entry with lat/lng
 * @returns {{ conditions: Object|null, loading: boolean, error: string|null, hourly: Array|null, swell: Array|null }}
 */
export default function useForecast(spot) {
  const { weather, loading: wLoad, error: wError } = useWeather(spot);
  const { swell, loading: sLoad } = useSwell(spot);
  const { hourly, loading: hLoad } = useHourlyForecast(spot);

  const loading = wLoad || sLoad || hLoad;
  const error = wError || null;

  // Build unified conditions for current time
  const conditions = useMemo(() => {
    if (!weather?.current) return null;

    // Try to find current hour in hourly data
    const now = new Date();
    const currentHourNum = now.getHours();
    const todayStr = now.toISOString().slice(0, 10);

    let currentHour = null;
    if (hourly) {
      currentHour = hourly.find(h => {
        const hDate = h.time.slice(0, 10);
        const hHour = new Date(h.time).getHours();
        return hDate === todayStr && hHour === currentHourNum;
      });
      // Fallback: nearest hour
      if (!currentHour) {
        currentHour = hourly.find(h => h.time.slice(0, 10) === todayStr && Math.abs(new Date(h.time).getHours() - currentHourNum) <= 1);
      }
    }

    // Swell today
    const todaySwell = swell?.[0] || null;

    return {
      // Wave data (prefer hourly, fallback to daily swell)
      waveHeight: currentHour?.waveHeight ?? todaySwell?.waveHeight ?? null,
      wavePeriod: currentHour?.wavePeriod ?? todaySwell?.wavePeriod ?? null,
      waveDir: currentHour?.waveDir ?? todaySwell?.waveDir ?? null,

      // Wind data (prefer hourly, fallback to current weather)
      wind: currentHour?.wind ?? weather.current?.wind ?? null,
      gusts: currentHour?.gusts ?? null,
      windDir: currentHour?.windDir ?? weather.current?.windDir ?? null,

      // Surf score (hourly-based if available)
      surfScore: currentHour ? surfScore(currentHour) : 50,

      // Weather
      temp: currentHour?.temp ?? weather.current?.temp ?? null,
      code: currentHour?.code ?? weather.current?.code ?? null,

      // Raw source refs for advanced display
      _source: currentHour ? "hourly" : "daily",
    };
  }, [weather, swell, hourly]);

  // Today's best window (for secondary display)
  const bestWindow = useMemo(() => {
    if (!hourly) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayHours = hourly.filter(h => {
      const hDate = h.time.slice(0, 10);
      const hHour = new Date(h.time).getHours();
      return hDate === todayStr && hHour >= 6 && hHour <= 20;
    });
    if (todayHours.length === 0) return null;

    let bestScore = -1, bestHour = null;
    todayHours.forEach(h => {
      const s = surfScore(h);
      if (s > bestScore) { bestScore = s; bestHour = h; }
    });
    if (!bestHour) return null;
    return {
      time: bestHour.time,
      hour: new Date(bestHour.time).getHours(),
      score: bestScore,
      waveHeight: bestHour.waveHeight,
      wind: bestHour.wind,
    };
  }, [hourly]);

  return { conditions, loading, error, hourly, swell, bestWindow };
}
