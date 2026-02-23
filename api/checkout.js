// SoulSurf – Stripe Checkout API (Sprint 30 - ENHANCED DEBUG)
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const COMMISSION_RATE = 0.15;

export default async function handler(req, res) {
  // CORS Preflight
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔵 [API] Checkout API called");
    console.log("🔵 [API] Body:", JSON.stringify(req.body, null, 2));

    const {
      schoolName, schoolId, courseName, courseId,
      pricePerPerson, currency, people, date,
      customerName, customerEmail, message, locale, returnUrl
    } = req.body;

    // Validation
    if (!schoolId || !courseId || !pricePerPerson || !people || !date || !customerEmail) {
      const missing = [];
      if (!schoolId) missing.push("schoolId");
      if (!courseId) missing.push("courseId");
      if (!pricePerPerson) missing.push("pricePerPerson");
      if (!people) missing.push("people");
      if (!date) missing.push("date");
      if (!customerEmail) missing.push("customerEmail");
      
      console.error("❌ [API] Missing fields:", missing);
      return res.status(400).json({ 
        error: "Missing required fields",
        missing: missing
      });
    }

    const totalAmount = pricePerPerson * people;
    const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);
    const stripeLocale = locale === "pt" ? "pt-BR" : locale === "de" ? "de" : "en";

    console.log("🔵 [API] Creating Stripe session:", {
      totalAmount,
      pricePerPerson,
      currency: currency || "eur",
      people,
      locale: stripeLocale,
      returnUrl
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      locale: stripeLocale,
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: (currency || "eur").toLowerCase(),
            product_data: {
              name: courseName,
              description: `${schoolName} · ${date} · ${people} ${people === 1 ? "person" : "people"}`,
            },
            unit_amount: pricePerPerson,
          },
          quantity: people,
        },
      ],
      metadata: {
        schoolId, 
        schoolName, 
        courseId, 
        courseName,
        date, 
        people: String(people),
        customerName: customerName || "",
        customerEmail,
        message: (message || "").slice(0, 500),
        commissionAmount: String(commissionAmount),
        source: "soulsurf",
      },
      success_url: `${returnUrl}?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?booking=cancelled`,
    });

    console.log("✅ [API] Session created:", session.id);
    console.log("✅ [API] Checkout URL:", session.url);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (err) {
    console.error("❌ [API] Stripe checkout error:", err);
    return res.status(500).json({
      error: err.message || "Payment error",
      type: err.type,
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
