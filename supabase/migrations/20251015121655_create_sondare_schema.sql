/*
  # Sondare Database Schema - Initial Setup

  ## Overview
  Complete database structure for Sondare AI app builder platform.
  
  ## Tables Created
  
  ### 1. profiles
  Extends auth.users with subscription and credit information
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email for display
  - `subscription_tier` (text) - 'free', 'pro', 'teams'
  - `credits_remaining` (integer) - AI generation credits left
  - `credits_purchased` (integer) - Additional credits bought
  - `created_at` (timestamptz) - Account creation date
  - `updated_at` (timestamptz) - Last profile update
  
  ### 2. projects
  Stores user's app projects
  - `id` (uuid) - Project identifier
  - `user_id` (uuid, FK to profiles) - Project owner
  - `name` (text) - Project name
  - `description` (text) - User's app idea description
  - `app_type` (text) - 'social', 'ecommerce', 'productivity', 'fitness', 'finance', 'custom'
  - `status` (text) - 'draft', 'generating', 'completed', 'error'
  - `color_scheme` (jsonb) - Generated color palette
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. generations
  AI generation history with code and schema
  - `id` (uuid) - Generation identifier
  - `project_id` (uuid, FK to projects) - Associated project
  - `prompt` (text) - User's input prompt
  - `generated_code` (jsonb) - Component code files
  - `generated_schema` (jsonb) - Screen/feature structure
  - `ai_model` (text) - Model used (e.g., 'claude-3-5-sonnet')
  - `processing_time` (integer) - Generation time in seconds
  - `status` (text) - 'processing', 'completed', 'error'
  - `error_message` (text) - Error details if failed
  - `created_at` (timestamptz)
  
  ### 4. deployments
  Deployment history (Phase 2 feature)
  - `id` (uuid) - Deployment identifier
  - `project_id` (uuid, FK to projects)
  - `url` (text) - Deployed app URL
  - `status` (text) - 'pending', 'live', 'failed'
  - `deployed_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Authenticated access required for all operations
  
  ## Notes
  - Free tier users get 3 credits on signup (via trigger)
  - Credits roll over indefinitely
  - All timestamps use UTC
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'teams')),
  credits_remaining integer NOT NULL DEFAULT 3,
  credits_purchased integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, credits_remaining)
  VALUES (NEW.id, NEW.email, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  app_type text NOT NULL DEFAULT 'custom' CHECK (app_type IN ('social', 'ecommerce', 'productivity', 'fitness', 'finance', 'custom')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error')),
  color_scheme jsonb DEFAULT '{"primary": "#FF9500", "background": "#000000"}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);

-- RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- GENERATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  generated_code jsonb DEFAULT '{}'::jsonb,
  generated_schema jsonb DEFAULT '{}'::jsonb,
  ai_model text DEFAULT 'claude-3-5-sonnet',
  processing_time integer DEFAULT 0,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS generations_project_id_idx ON generations(project_id);
CREATE INDEX IF NOT EXISTS generations_status_idx ON generations(status);
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON generations(created_at DESC);

-- RLS for generations
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generations.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create generations for own projects"
  ON generations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- DEPLOYMENTS TABLE (Phase 2)
-- =====================================================
CREATE TABLE IF NOT EXISTS deployments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'failed')),
  deployed_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS deployments_project_id_idx ON deployments(project_id);
CREATE INDEX IF NOT EXISTS deployments_status_idx ON deployments(status);

-- RLS for deployments
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deployments"
  ON deployments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credit(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  remaining_credits integer;
  purchased_credits integer;
BEGIN
  -- Get current credits
  SELECT credits_remaining, credits_purchased
  INTO remaining_credits, purchased_credits
  FROM profiles
  WHERE id = user_uuid;
  
  -- Check if user has credits
  IF remaining_credits <= 0 AND purchased_credits <= 0 THEN
    RETURN false;
  END IF;
  
  -- Deduct from purchased first, then remaining
  IF purchased_credits > 0 THEN
    UPDATE profiles
    SET credits_purchased = credits_purchased - 1
    WHERE id = user_uuid;
  ELSE
    UPDATE profiles
    SET credits_remaining = credits_remaining - 1
    WHERE id = user_uuid;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add purchased credits
CREATE OR REPLACE FUNCTION add_credits(user_uuid uuid, amount integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET credits_purchased = credits_purchased + amount
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;