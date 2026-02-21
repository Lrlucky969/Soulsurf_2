// SoulSurf – Stripe Checkout API (Sprint 29)
// Vercel Serverless Function: POST /api/checkout
// Creates a Stripe Checkout Session for surf school bookings

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Commission model: SoulSurf takes 15% from school
const COMMISSION_RATE = 0.15;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      schoolName,
      schoolId,
      courseName,
      courseId,
      pricePerPerson, // in cents (e.g. 4500 = €45.00)
      currency,       // "eur", "brl", "usd"
      people,
      date,
      customerName,
      customerEmail,
      message,
      locale,         // "de", "en", "pt"
      returnUrl,      // URL to redirect after payment
    } = req.body;

    // Validate required fields
    if (!schoolId || !courseId || !pricePerPerson || !people || !date || !customerEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalAmount = pricePerPerson * people; // in cents
    const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);

    // Map locale to Stripe locale
    const stripeLocale = locale === "pt" ? "pt-BR" : locale === "de" ? "de" : "en";

    // Create Checkout Session
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
              metadata: {
                schoolId,
                courseId,
                date,
                people: String(people),
              },
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
      success_url: `${returnUrl || "https://surf-app-4j47.vercel.app"}?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || "https://surf-app-4j47.vercel.app"}?booking=cancelled`,
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: err.message || "Payment error" });
  }
}
