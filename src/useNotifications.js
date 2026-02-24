// SoulSurf – Notification Hook (v6.2 – Sprint 31)
import { useState, useEffect, useCallback } from "react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleStreakReminder,
  showForecastAlert,
  showBookingConfirmation,
  showMilestoneNotification,
  getNotificationHistory,
  clearScheduledNotifications,
  hasUserDismissedPermissionRequest,
  markPermissionRequestDismissed,
} from "./notifications.js";

export default function useNotifications(data) {
  const [permission, setPermission] = useState("default");
  const [isSupported, setIsSupported] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [history, setHistory] = useState([]);

  // Check support & permission on mount
  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      const perm = getNotificationPermission();
      setPermission(perm);

      // Show banner if permission not granted and not dismissed
      if (perm === "default" && !hasUserDismissedPermissionRequest()) {
        // Delay banner by 3 seconds (don't annoy immediately)
        setTimeout(() => setShowBanner(true), 3000);
      }

      // Load history
      setHistory(getNotificationHistory());
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
    setShowBanner(false);
    return granted;
  }, []);

  // Dismiss banner (don't ask again)
  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    markPermissionRequestDismissed();
  }, []);

  // Schedule daily streak reminder
  useEffect(() => {
    if (permission !== "granted" || !data) return;

    const today = new Date().toISOString().slice(0, 10);
    const surfedToday = (data.surfDays || []).includes(today);

    // Schedule reminder for 22:00 if not surfed today
    scheduleStreakReminder(surfedToday);

    // Cleanup on unmount
    return () => {
      // Don't clear on unmount - let notifications persist
    };
  }, [permission, data?.surfDays]);

  // Show milestone notifications when achieved
  useEffect(() => {
    if (permission !== "granted" || !data?.streakMilestones) return;

    const { current } = data.streakMilestones;
    if (!current) return;

    // Check if this milestone was just achieved (not shown before)
    const lastShown = localStorage.getItem("soulsurf_last_milestone_shown");
    const milestoneKey = `${current.badge}-${data.streak}`;

    if (lastShown !== milestoneKey && data.streak >= 2) {
      showMilestoneNotification(current);
      try {
        localStorage.setItem("soulsurf_last_milestone_shown", milestoneKey);
      } catch {}
    }
  }, [permission, data?.streak, data?.streakMilestones]);

  // Refresh history when needed
  const refreshHistory = useCallback(() => {
    setHistory(getNotificationHistory());
  }, []);

  return {
    isSupported,
    permission,
    isGranted: permission === "granted",
    showBanner,
    history,
    requestPermission,
    dismissBanner,
    refreshHistory,
    // Helper functions exposed for manual use
    showForecastAlert,
    showBookingConfirmation,
    showMilestoneNotification,
    clearScheduledNotifications,
  };
}
