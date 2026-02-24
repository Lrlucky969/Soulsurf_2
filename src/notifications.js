// SoulSurf – Notification System (v6.2 – Sprint 31)
// Handles Web Push Notifications for Streak Reminders, Forecast Alerts, etc.

const NOTIFICATION_TYPES = {
  STREAK_REMINDER: "streak-reminder",
  FORECAST_ALERT: "forecast-alert",
  BOOKING_CONFIRMATION: "booking-confirmation",
  MILESTONE_ACHIEVED: "milestone-achieved",
};

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported() {
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Get current notification permission status
 * @returns {"default" | "granted" | "denied"}
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

/**
 * Request notification permission from user
 * @returns {Promise<boolean>} true if granted
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported in this browser");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    console.warn("Notification permission previously denied");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("📢 Notification permission:", permission);
    
    if (permission === "granted") {
      // Store permission timestamp
      try {
        localStorage.setItem("soulsurf_notification_granted", new Date().toISOString());
      } catch {}
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return false;
  }
}

/**
 * Show a notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
export async function showNotification(title, options = {}) {
  if (Notification.permission !== "granted") {
    console.warn("Cannot show notification: permission not granted");
    return null;
  }

  const defaultOptions = {
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    requireInteraction: false,
    ...options,
  };

  try {
    // Use Service Worker to show notification (works even when app is closed)
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, defaultOptions);
      console.log("📢 Notification shown via Service Worker:", title);
    } else {
      // Fallback: show notification directly (only works when app is open)
      new Notification(title, defaultOptions);
      console.log("📢 Notification shown directly:", title);
    }

    // Log notification to history
    logNotification(title, options.body, options.tag);
    return true;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return false;
  }
}

/**
 * Schedule a notification for a specific time
 * @param {string} title
 * @param {Object} options
 * @param {Date} scheduledTime
 */
export function scheduleNotification(title, options, scheduledTime) {
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay <= 0) {
    console.warn("Cannot schedule notification in the past");
    return null;
  }

  console.log(`⏰ Notification scheduled for ${scheduledTime.toLocaleString()} (in ${Math.round(delay / 1000 / 60)}min)`);

  const timeoutId = setTimeout(() => {
    showNotification(title, options);
  }, delay);

  // Store timeout ID to cancel later if needed
  try {
    const scheduled = JSON.parse(localStorage.getItem("soulsurf_scheduled_notifications") || "[]");
    scheduled.push({
      id: timeoutId,
      title,
      scheduledTime: scheduledTime.toISOString(),
      type: options.tag || "generic",
    });
    localStorage.setItem("soulsurf_scheduled_notifications", JSON.stringify(scheduled));
  } catch {}

  return timeoutId;
}

/**
 * Schedule daily streak reminder (22:00)
 * @param {boolean} surfedToday - Has user surfed today?
 */
export function scheduleStreakReminder(surfedToday) {
  if (surfedToday) {
    console.log("✅ User surfed today, no reminder needed");
    return null;
  }

  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(22, 0, 0, 0); // 22:00

  // If it's already past 22:00 today, schedule for tomorrow
  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  return scheduleNotification(
    "🔥 Noch 2h für deinen Streak!",
    {
      body: "Logge schnell eine Session, bevor dein Streak endet.",
      tag: NOTIFICATION_TYPES.STREAK_REMINDER,
      icon: "/icon-192.png",
      data: { url: "/?action=log-surf-day" },
    },
    reminderTime
  );
}

/**
 * Show forecast alert notification
 * @param {Object} forecast - Forecast data
 */
export function showForecastAlert(forecast) {
  const { spotName, waveHeight, windSpeed, windDirection, rating } = forecast;

  if (rating < 3) {
    console.log("⚠️ Forecast rating too low, skipping notification");
    return;
  }

  showNotification(
    `🌊 Perfekte Bedingungen morgen!`,
    {
      body: `${spotName}: ${waveHeight}m Wellen, ${windSpeed} km/h ${windDirection}\n⭐ ${rating}/5 Sterne`,
      tag: NOTIFICATION_TYPES.FORECAST_ALERT,
      requireInteraction: true,
      data: { url: "/?screen=forecast" },
    }
  );
}

/**
 * Show booking confirmation notification
 * @param {Object} booking - Booking details
 */
export function showBookingConfirmation(booking) {
  const { schoolName, courseName, date } = booking;

  showNotification(
    "✅ Buchung bestätigt!",
    {
      body: `${courseName} bei ${schoolName}\n📅 ${date}`,
      tag: NOTIFICATION_TYPES.BOOKING_CONFIRMATION,
      requireInteraction: true,
      data: { url: "/?screen=schools" },
    }
  );
}

/**
 * Show milestone achievement notification
 * @param {Object} milestone
 */
export function showMilestoneNotification(milestone) {
  showNotification(
    `${milestone.emoji} ${milestone.title}`,
    {
      body: milestone.desc || "Glückwunsch zu deinem Fortschritt!",
      tag: NOTIFICATION_TYPES.MILESTONE_ACHIEVED,
      requireInteraction: true,
    }
  );
}

/**
 * Log notification to history (for UI display)
 */
function logNotification(title, body, tag) {
  try {
    const history = JSON.parse(localStorage.getItem("soulsurf_notification_history") || "[]");
    history.unshift({
      title,
      body,
      tag,
      timestamp: new Date().toISOString(),
    });
    // Keep only last 10
    localStorage.setItem("soulsurf_notification_history", JSON.stringify(history.slice(0, 10)));
  } catch {}
}

/**
 * Get notification history
 * @returns {Array}
 */
export function getNotificationHistory() {
  try {
    return JSON.parse(localStorage.getItem("soulsurf_notification_history") || "[]");
  } catch {
    return [];
  }
}

/**
 * Clear all scheduled notifications
 */
export function clearScheduledNotifications() {
  try {
    const scheduled = JSON.parse(localStorage.getItem("soulsurf_scheduled_notifications") || "[]");
    scheduled.forEach(s => clearTimeout(s.id));
    localStorage.removeItem("soulsurf_scheduled_notifications");
    console.log("🗑️ Cleared all scheduled notifications");
  } catch {}
}

/**
 * Check if user has dismissed notification permission request
 */
export function hasUserDismissedPermissionRequest() {
  try {
    return localStorage.getItem("soulsurf_notification_dismissed") === "true";
  } catch {
    return false;
  }
}

/**
 * Mark notification permission request as dismissed
 */
export function markPermissionRequestDismissed() {
  try {
    localStorage.setItem("soulsurf_notification_dismissed", "true");
  } catch {}
}
