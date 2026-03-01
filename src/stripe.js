// SoulSurf – Stripe Client Helper v7.2.1 (expanded error mapping)
const API_BASE = typeof window !== "undefined"
  ? (import.meta.env.VITE_APP_URL || window.location.origin)
  : "";

// User-friendly error messages (i18n-ready keys)
const ERROR_MAP = {
  network: "pay.error.network",
  card_declined: "pay.error.card",
  expired_card: "pay.error.expired",
  insufficient_funds: "pay.error.funds",
  incorrect_cvc: "pay.error.cvc",
  processing_error: "pay.error.processing",
  authentication_required: "pay.error.auth",
  default: "pay.error.default",
};

function mapError(err) {
  if (err.message?.includes("NetworkError") || err.message?.includes("Failed to fetch")) {
    return { key: ERROR_MAP.network, fallback: "Keine Internetverbindung. Bitte erneut versuchen." };
  }
  const code = err.code || err.decline_code;
  if (code && ERROR_MAP[code]) {
    return { key: ERROR_MAP[code], fallback: FALLBACKS[code] };
  }
  return { key: ERROR_MAP.default, fallback: FALLBACKS.default };
}

const FALLBACKS = {
  card_declined: "Karte abgelehnt. Bitte andere Zahlungsmethode versuchen.",
  expired_card: "Karte abgelaufen. Bitte aktualisieren.",
  insufficient_funds: "Nicht genug Guthaben auf der Karte.",
  incorrect_cvc: "CVC-Code falsch. Bitte prüfen.",
  processing_error: "Zahlung wird noch verarbeitet. Bitte kurz warten.",
  authentication_required: "3D-Secure Verifizierung fehlgeschlagen. Bitte erneut versuchen.",
  default: "Zahlung fehlgeschlagen. Bitte erneut versuchen oder Anfrage senden.",
};

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(booking) {
  try {
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolName: booking.schoolName,
        schoolId: booking.schoolId,
        courseName: booking.courseName,
        courseId: booking.courseId,
        pricePerPerson: booking.pricePerPerson,
        currency: booking.currency || "eur",
        people: booking.people,
        date: booking.date,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        message: booking.message || "",
        locale: booking.locale || "de",
        returnUrl: booking.returnUrl || window.location.origin + window.location.pathname,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Payment service unavailable" }));
      const err = new Error(errorData.error || "Checkout failed");
      err.code = errorData.code;
      err.type = errorData.type;
      throw err;
    }

    return res.json();
  } catch (error) {
    const mapped = mapError(error);
    const userError = new Error(mapped.fallback);
    userError.i18nKey = mapped.key;
    userError.originalError = error;
    throw userError;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(booking) {
  const { url } = await createCheckoutSession(booking);
  if (!url) throw new Error("No checkout URL received");
  window.location.href = url;
}

/**
 * Check if returning from Stripe payment (call on app mount)
 */
export function checkBookingReturn() {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const status = params.get("booking");
  const sessionId = params.get("session_id");

  if (status) {
    // Clean URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.delete("booking");
    url.searchParams.delete("session_id");
    window.history.replaceState({}, "", url.toString());
  }

  if (status === "success") return { status: "success", sessionId };
  if (status === "cancelled") return { status: "cancelled" };
  return null;
}

/**
 * Convert price to cents (Stripe format)
 */
export function priceToCents(price) {
  return Math.round(parseFloat(price) * 100);
}
