// SoulSurf – Stripe Client Helper (Sprint 29)
// Handles checkout flow from the browser

const API_BASE = typeof window !== "undefined" ? window.location.origin : "";

/**
 * Create a Stripe Checkout Session and redirect to payment
 * @param {Object} booking - Booking details
 * @returns {Promise<{url: string, sessionId: string}>}
 */
export async function createCheckoutSession(booking) {
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      schoolName: booking.schoolName,
      schoolId: booking.schoolId,
      courseName: booking.courseName,
      courseId: booking.courseId,
      pricePerPerson: booking.pricePerPerson, // cents
      currency: booking.currency || "eur",
      people: booking.people,
      date: booking.date,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      message: booking.message || "",
      locale: booking.locale || "de",
      returnUrl: window.location.origin,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Payment service unavailable" }));
    throw new Error(err.error || "Checkout failed");
  }

  return res.json();
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(booking) {
  const { url } = await createCheckoutSession(booking);
  if (url) {
    window.location.href = url;
  } else {
    throw new Error("No checkout URL received");
  }
}

/**
 * Check if returning from a successful payment
 * Call this on app load
 */
export function checkBookingReturn() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const status = params.get("booking");
  const sessionId = params.get("session_id");

  if (status) {
    // Clean URL without reloading
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
 * Convert price to cents (Stripe uses cents)
 * e.g. 45.00 → 4500
 */
export function priceToCents(price) {
  return Math.round(price * 100);
}
