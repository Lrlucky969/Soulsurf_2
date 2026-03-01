// SoulSurf – Stripe Checkout API v7.1 (CORS fix, debug logs removed)
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const COMMISSION_RATE = 0.15;

const ALLOWED_ORIGINS = [
  "https://soulsurf.app",
  "https://www.soulsurf.app",
  process.env.VITE_APP_URL,
  process.env.NODE_ENV === "development" ? "http://localhost:5173" : null,
  process.env.NODE_ENV === "development" ? "http://localhost:4173" : null,
].filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers?.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      schoolName, schoolId, courseName, courseId,
      pricePerPerson, currency, people, date,
      customerName, customerEmail, message, locale, returnUrl
    } = req.body;

    if (!schoolId || !courseId || !pricePerPerson || !people || !date || !customerEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const totalAmount = pricePerPerson * people;
    const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);
    const stripeLocale = locale === "pt" ? "pt-BR" : locale === "de" ? "de" : "en";

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

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return res.status(500).json({
      error: err.message || "Payment error",
      type: err.type,
      code: err.code,
    });
  }
}
