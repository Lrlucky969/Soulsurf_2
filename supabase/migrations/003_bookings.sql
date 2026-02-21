-- SoulSurf Sprint 29: Bookings table for Stripe payments
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  school_id TEXT NOT NULL,
  school_name TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  date TEXT NOT NULL,
  people INTEGER DEFAULT 1,
  customer_name TEXT,
  customer_email TEXT NOT NULL,
  message TEXT,
  amount_total INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'eur',
  commission_amount INTEGER DEFAULT 0, -- SoulSurf commission in cents
  status TEXT DEFAULT 'confirmed', -- confirmed | cancelled | refunded
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_bookings_school ON bookings(school_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe ON bookings(stripe_session_id);

-- RLS: Only service role can write (webhook), users can read their own
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Service role can insert"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update"
  ON bookings FOR UPDATE
  USING (true);
