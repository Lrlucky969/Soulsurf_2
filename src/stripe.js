// SoulSurf – Stripe Client Helper (Sprint 30 - PRODUCTION READY)

const API_BASE = typeof window !== "undefined" 
  ? (import.meta.env.VITE_APP_URL || window.location.origin)
  : "";

/**
 * Create a Stripe Checkout Session
 * @param {Object} booking - Booking details
 * @returns {Promise<{url: string, sessionId: string}>}
 */
export async function createCheckoutSession(booking) {
  try {
    const endpoint = `${API_BASE}/api/checkout`;
    console.log("🔵 [Stripe] Creating checkout session:", endpoint);
    console.log("🔵 [Stripe] Booking:", {
      school: booking.schoolName,
      course: booking.courseName,
      amount: booking.pricePerPerson,
      people: booking.people
    });
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
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
        returnUrl: booking.returnUrl || window.location.origin, // ← FIX
      }),
    });

    console.log("🔵 [Stripe] Response status:", res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ [Stripe] Checkout error:", res.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Payment service error (${res.status}): ${errorText.slice(0, 200)}`);
      }
      
      throw new Error(errorData.error || "Checkout failed");
    }

    const data = await res.json();
    console.log("✅ [Stripe] Session created:", data.sessionId);
    return data;
    
  } catch (error) {
    console.error("❌ [Stripe] Client error:", error);
    
    // User-friendly error messages
    if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
      throw new Error("Netzwerkfehler. Bitte Internetverbindung prüfen.");
    }
    
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(booking) {
  try {
    const { url } = await createCheckoutSession(booking);
    
    if (!url) {
      throw new Error("No checkout URL received from server");
    }
    
    console.log("🔵 [Stripe] Redirecting to:", url);
    
    // Small delay to ensure console logs are visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    window.location.href = url;
    
  } catch (error) {
    console.error("❌ [Stripe] Redirect failed:", error);
    throw error;
  }
}

/**
 * Check if returning from Stripe payment
 * Call this on app mount
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

  if (status === "success") {
    console.log("✅ [Stripe] Payment successful:", sessionId);
    return { status: "success", sessionId };
  }
  
  if (status === "cancelled") {
    console.log("⚠️ [Stripe] Payment cancelled");
    return { status: "cancelled" };
  }
  
  return null;
}

/**
 * Convert price to cents (Stripe format)
 * @param {number} price - Price in Euros/Dollars (e.g. 45.00)
 * @returns {number} Price in cents (e.g. 4500)
 */
export function priceToCents(price) {
  return Math.round(parseFloat(price) * 100);
}

/**
 * Format price from cents
 * @param {number} cents - Price in cents (e.g. 4500)
 * @param {string} currency - Currency code (e.g. "eur")
 * @returns {string} Formatted price (e.g. "€45.00")
 */
export function formatPriceFromCents(cents, currency = "eur") {
  const amount = cents / 100;
  const symbol = currency === "eur" ? "€" : currency === "brl" ? "R$" : "$";
  return `${symbol}${amount.toFixed(2)}`;
}
