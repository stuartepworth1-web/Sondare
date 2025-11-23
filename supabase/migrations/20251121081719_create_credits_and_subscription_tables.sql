/*
  # Credits and Subscription System

  ## New Tables
  
  ### `user_profiles`
  - Extended user data with credits and subscription info
  - Brand kit storage
  - Referral system
  
  ### `credit_transactions`
  - All credit movements
  
  ### `ai_generations`
  - History of AI code generations
  
  ### `project_files`
  - Files within projects
  
  ### `templates`
  - Pre-built component library
  
  ### `subscriptions`
  - RevenueCat subscription data
  
  ### `project_likes`
  - Social likes
  
  ### `achievements`
  - Gamification
*/

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer DEFAULT 50 NOT NULL,
  total_credits_earned integer DEFAULT 50 NOT NULL,
  total_credits_spent integer DEFAULT 0 NOT NULL,
  subscription_tier text DEFAULT 'free' NOT NULL CHECK (subscription_tier IN ('free', 'starter', 'pro', 'entrepreneur')),
  subscription_status text DEFAULT 'active' NOT NULL CHECK (subscription_status IN ('active', 'canceled', 'expired', 'trialing')),
  subscription_period_end timestamptz,
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  brand_colors jsonb DEFAULT '[]'::jsonb,
  brand_fonts jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('subscription', 'purchase', 'referral', 'generation', 'refund', 'bonus')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- AI Generations
CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  generation_type text NOT NULL CHECK (generation_type IN ('component', 'page', 'camera_to_code', 'refactor', 'review', 'design_system')),
  prompt text NOT NULL,
  generated_code text NOT NULL,
  credits_used integer NOT NULL,
  success boolean DEFAULT true NOT NULL,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Project Files
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_content text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('tsx', 'ts', 'jsx', 'js', 'css', 'json', 'md')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(project_id, file_path)
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('ui', 'navigation', 'auth', 'data', 'animation', 'layout', 'form', 'media')),
  tier_required text DEFAULT 'free' NOT NULL CHECK (tier_required IN ('free', 'starter', 'pro', 'entrepreneur')),
  preview_url text,
  code text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  use_count integer DEFAULT 0 NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  revenue_cat_user_id text NOT NULL,
  product_id text NOT NULL CHECK (product_id IN ('starter', 'pro', 'entrepreneur')),
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'in_trial')),
  current_period_start timestamptz DEFAULT now() NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Project Likes
CREATE TABLE IF NOT EXISTS project_likes (
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, project_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  earned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_project_id ON ai_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON ai_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON templates(tier_required);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Credit Transactions
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- AI Generations
CREATE POLICY "Users can view own generations"
  ON ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations"
  ON ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Project Files
CREATE POLICY "Users can view files in own projects"
  ON project_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view files in public projects"
  ON project_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.is_public = true
    )
  );

CREATE POLICY "Users can manage files in own projects"
  ON project_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_files.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Templates
CREATE POLICY "Users can view templates for their tier"
  ON templates FOR SELECT
  TO authenticated
  USING (
    tier_required = 'free' OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (
        (tier_required = 'starter' AND user_profiles.subscription_tier IN ('starter', 'pro', 'entrepreneur')) OR
        (tier_required = 'pro' AND user_profiles.subscription_tier IN ('pro', 'entrepreneur')) OR
        (tier_required = 'entrepreneur' AND user_profiles.subscription_tier = 'entrepreneur')
      )
    )
  );

-- Subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription"
  ON subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Project Likes
CREATE POLICY "Users can view all likes"
  ON project_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON project_likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Functions

-- Generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    credits,
    total_credits_earned,
    referral_code
  ) VALUES (
    NEW.id,
    50,
    50,
    generate_referral_code()
  );
  
  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    NEW.id,
    50,
    'bonus',
    'Welcome bonus'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_project_files_updated_at ON project_files;
CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
