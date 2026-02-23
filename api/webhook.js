// SoulSurf – Stripe Webhook Handler (Sprint 30)
// Vercel Serverless Function: POST /api/webhook
// Receives Stripe webhook events (checkout.session.completed)
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Supabase admin client (service role for server-side writes)
const supabase = process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

// Vercel requires raw body for webhook verification
export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let event;
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers["stripe-signature"];

    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else {
      // Fallback for development (no signature verification)
      event = JSON.parse(rawBody.toString());
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    console.log("✅ Payment completed:", {
      schoolId: meta.schoolId,
      courseName: meta.courseName,
      amount: session.amount_total,
      customer: meta.customerEmail,
    });

    // Store confirmed booking in Supabase
    if (supabase && meta.schoolId) {
      try {
        const { error } = await supabase.from("bookings").insert({
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
          school_id: meta.schoolId,
          school_name: meta.schoolName,
          course_id: meta.courseId,
          course_name: meta.courseName,
          date: meta.date,
          people: parseInt(meta.people) || 1,
          customer_name: meta.customerName,
          customer_email: meta.customerEmail,
          message: meta.message,
          amount_total: session.amount_total, // in cents
          currency: session.currency,
          commission_amount: parseInt(meta.commissionAmount) || 0,
          status: "confirmed",
          paid_at: new Date().toISOString(),
        });

        if (error) console.error("Supabase booking insert error:", error);
        else console.log("✅ Booking saved to Supabase");
      } catch (err) {
        console.error("Supabase error:", err);
      }
    }
  }

  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
}
