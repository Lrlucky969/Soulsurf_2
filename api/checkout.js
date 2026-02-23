// SoulSurf – Stripe Checkout API (Sprint 30 - FIXED)
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
    console.log("🔵 Checkout API called");
    console.log("🔵 Body:", JSON.stringify(req.body).slice(0, 200));

    const {
      schoolName, schoolId, courseName, courseId,
      pricePerPerson, currency, people, date,
      customerName, customerEmail, message, locale, returnUrl
    } = req.body;

    // Validation
    if (!schoolId || !courseId || !pricePerPerson || !people || !date || !customerEmail) {
      console.error("❌ Missing fields:", { schoolId, courseId, pricePerPerson, people, date, customerEmail });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalAmount = pricePerPerson * people;
    const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);
    const stripeLocale = locale === "pt" ? "pt-BR" : locale === "de" ? "de" : "en";

    console.log("🔵 Creating Stripe session:", {
      totalAmount,
      currency: currency || "eur",
      people,
      locale: stripeLocale
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      locale: stripeLocale,
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency || "eur",
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
        schoolId, schoolName, courseId, courseName,
        date, people: String(people),
        customerName: customerName || "",
        customerEmail,
        message: (message || "").slice(0, 500),
        commissionAmount: String(commissionAmount),
        source: "soulsurf",
      },
      success_url: `${returnUrl}?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?booking=cancelled`,
    });

    console.log("✅ Session created:", session.id);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
    
  } catch (err) {
    console.error("❌ Stripe checkout error:", err);
    return res.status(500).json({ 
      error: err.message || "Payment error",
      type: err.type,
      code: err.code
    });
  }
}
