-- =============================================================================
-- SoulSurf Sprint 30: Complete RLS Policies
-- Run after initial bookings.sql migration
-- =============================================================================

-- ============================================
-- 1. USER_DATA Table (Program & Progress)
-- ============================================

CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. USER_TRIPS Table (Trip Planning)
-- ============================================

CREATE TABLE IF NOT EXISTS user_trips (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON user_trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON user_trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON user_trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON user_trips FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. COMMUNITY_POSTS Table (Forum)
-- ============================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  spot TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_spot ON community_posts(spot);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can read posts
CREATE POLICY "Anyone can view posts"
  ON community_posts FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own posts
CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. COMMUNITY_LIKES Table
-- ============================================

CREATE TABLE IF NOT EXISTS community_likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);

ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Users can view all likes (for UI display)
CREATE POLICY "Anyone can view likes"
  ON community_likes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Users can only manage their own likes
CREATE POLICY "Users can insert own likes"
  ON community_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON community_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Helper Functions (for likes counter)
-- ============================================

CREATE OR REPLACE FUNCTION increment_likes(pid UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = pid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(pid UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = pid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. BOOKINGS Table (already created, add missing policies)
-- ============================================

-- Extend bookings table with missing policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Service role (webhook) can insert
DROP POLICY IF EXISTS "Service role can insert" ON bookings;
CREATE POLICY "Service role can insert"
  ON bookings FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can update
DROP POLICY IF EXISTS "Service role can update" ON bookings;
CREATE POLICY "Service role can update"
  ON bookings FOR UPDATE
  TO service_role
  USING (true);

-- ============================================
-- 7. STORAGE Bucket for Photos (if using Supabase Storage)
-- ============================================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('surf-photos', 'surf-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'surf-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'surf-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'surf-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- 8. Updated_at Triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_trips_updated_at
  BEFORE UPDATE ON user_trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
