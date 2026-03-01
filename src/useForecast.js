// SoulSurf – useForecast v7.2 (Sprint 36: Tomorrow-aware + lastUpdated)
// Unified forecast hook: weather + swell + hourly → conditions + bestWindow + tomorrowBest
import { useMemo } from "react";
import { useWeather, useSwell, useHourlyForecast, surfScore } from "./weather.js";

export { surfScore };

/**
 * @param {Object|null} spot - SURF_SPOTS entry with lat/lng
 * @returns {{ conditions, loading, error, hourly, swell, bestWindow, tomorrowBest, lastUpdated }}
 */
export default function useForecast(spot) {
  const { weather, loading: wLoad, error: wError } = useWeather(spot);
  const { swell, loading: sLoad } = useSwell(spot);
  const { hourly, loading: hLoad } = useHourlyForecast(spot);

  const loading = wLoad || sLoad || hLoad;
  const error = wError || null;

  const conditions = useMemo(() => {
    if (!weather?.current) return null;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentHourNum = now.getHours();

    let currentHour = null;
    if (hourly) {
      currentHour = hourly.find(h =>
        h.time.slice(0, 10) === todayStr && new Date(h.time).getHours() === currentHourNum
      );
      if (!currentHour) {
        currentHour = hourly.find(h =>
          h.time.slice(0, 10) === todayStr && Math.abs(new Date(h.time).getHours() - currentHourNum) <= 1
        );
      }
    }

    const todaySwell = swell?.[0] || null;

    return {
      waveHeight: currentHour?.waveHeight ?? todaySwell?.waveHeight ?? null,
      wavePeriod: currentHour?.wavePeriod ?? todaySwell?.wavePeriod ?? null,
      waveDir: currentHour?.waveDir ?? todaySwell?.waveDir ?? null,
      wind: currentHour?.wind ?? weather.current?.wind ?? null,
      gusts: currentHour?.gusts ?? null,
      windDir: currentHour?.windDir ?? weather.current?.windDir ?? null,
      surfScore: currentHour ? surfScore(currentHour) : (todaySwell ? 50 : null),
      temp: currentHour?.temp ?? weather.current?.temp ?? null,
      code: currentHour?.code ?? weather.current?.code ?? null,
      _source: currentHour ? "hourly" : "daily",
    };
  }, [weather, swell, hourly]);

  // Best surf window today (6:00-20:00)
  const bestWindow = useMemo(() => {
    if (!hourly) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayHours = hourly.filter(h => {
      const hr = new Date(h.time).getHours();
      return h.time.slice(0, 10) === todayStr && hr >= 6 && hr <= 20;
    });
    if (todayHours.length === 0) return null;

    let bestScore = -1, bestHour = null;
    for (const h of todayHours) {
      const s = surfScore(h);
      if (s > bestScore) { bestScore = s; bestHour = h; }
    }
    if (!bestHour || bestScore < 40) return null;
    return {
      time: bestHour.time,
      hour: new Date(bestHour.time).getHours(),
      score: bestScore,
      waveHeight: bestHour.waveHeight,
      wind: bestHour.wind,
    };
  }, [hourly]);

  // v7.2: Best surf window TOMORROW (for "today bad → tomorrow better" hint)
  const tomorrowBest = useMemo(() => {
    if (!hourly) return null;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const tomorrowHours = hourly.filter(h => {
      const hr = new Date(h.time).getHours();
      return h.time.slice(0, 10) === tomorrowStr && hr >= 6 && hr <= 20;
    });
    if (tomorrowHours.length === 0) return null;

    let bestScore = -1, bestHour = null;
    for (const h of tomorrowHours) {
      const s = surfScore(h);
      if (s > bestScore) { bestScore = s; bestHour = h; }
    }
    if (!bestHour || bestScore < 40) return null;
    return {
      time: bestHour.time,
      hour: new Date(bestHour.time).getHours(),
      score: bestScore,
      waveHeight: bestHour.waveHeight,
      wind: bestHour.wind,
      dayLabel: tomorrowStr,
    };
  }, [hourly]);

  // v7.2: Timestamp when data was last fetched (from weather cache)
  const lastUpdated = useMemo(() => {
    if (!weather) return null;
    try {
      const raw = localStorage.getItem("soulsurf_weather");
      if (!raw) return null;
      const cache = JSON.parse(raw);
      const entry = cache[spot?.id];
      return entry?.ts ? new Date(entry.ts) : null;
    } catch { return null; }
  }, [weather, spot?.id]);

  return { conditions, loading, error, hourly, swell, bestWindow, tomorrowBest, lastUpdated };
}
