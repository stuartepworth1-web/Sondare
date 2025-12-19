/*
  # Account Deletion and Subscription Tier Updates

  ## Overview
  Adds account deletion functionality and updates subscription tier names and limits for App Store compliance.

  ## Changes Made

  ### 1. Update Subscription Tiers
  - Rename 'teams' tier to 'entrepreneur'
  - Update credit limits: free (3), pro (50), entrepreneur (200)
  - Add pricing information for display

  ### 2. Account Deletion Function
  Creates a secure function to delete user account and all associated data:
  - Deletes all user projects (cascades to screens, components, generations, deployments)
  - Deletes conversation messages
  - Deletes user profile
  - Deletes auth user record

  ## Security
  - Function is SECURITY DEFINER to allow deletion of auth.users
  - Only the authenticated user can delete their own account
  - All deletions are wrapped in a transaction
*/

-- =====================================================
-- UPDATE PROFILES TABLE CONSTRAINT
-- =====================================================
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
  
  -- Add new constraint with updated tiers
  ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('free', 'pro', 'entrepreneur'));
END $$;

-- =====================================================
-- UPDATE EXISTING 'teams' TIER TO 'entrepreneur'
-- =====================================================
UPDATE profiles
SET subscription_tier = 'entrepreneur'
WHERE subscription_tier = 'teams';

-- =====================================================
-- ACCOUNT DELETION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Verify the requesting user is deleting their own account
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own account';
  END IF;

  -- Delete conversation messages (if the table exists)
  DELETE FROM conversation_messages WHERE project_id IN (
    SELECT id FROM projects WHERE user_id = user_id
  );

  -- Delete all projects (cascades to app_screens, app_components, generations, deployments)
  DELETE FROM projects WHERE user_id = user_id;

  -- Delete profile
  DELETE FROM profiles WHERE id = user_id;

  -- Delete auth user (this is why we need SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = user_id;

  -- Note: The user will be automatically signed out after this completes
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO authenticated;

-- =====================================================
-- UPDATE DEFAULT CREDIT LIMITS
-- =====================================================

-- Update the create_profile_for_user function to set correct defaults
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, subscription_tier, credits_remaining, credits_purchased)
  VALUES (NEW.id, NEW.email, 'free', 3, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADD SUBSCRIPTION METADATA TABLE (Optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_tiers (
  tier_name text PRIMARY KEY CHECK (tier_name IN ('free', 'pro', 'entrepreneur')),
  display_name text NOT NULL,
  price_monthly numeric(10, 2) NOT NULL,
  credits_monthly integer NOT NULL,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert tier definitions
INSERT INTO subscription_tiers (tier_name, display_name, price_monthly, credits_monthly, features)
VALUES
  ('free', 'Free', 0.00, 3, '["3 app generations per month", "Basic templates", "Export to code"]'::jsonb),
  ('pro', 'Starter', 9.99, 50, '["50 app generations per month", "All templates", "Priority support", "Export to code", "Commercial use"]'::jsonb),
  ('entrepreneur', 'Pro', 19.99, 200, '["200 app generations per month", "All templates", "Premium support", "Export to code", "Commercial use", "White label options"]'::jsonb)
ON CONFLICT (tier_name) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  credits_monthly = EXCLUDED.credits_monthly,
  features = EXCLUDED.features;

-- Make subscription_tiers publicly readable
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription tiers are publicly readable"
  ON subscription_tiers FOR SELECT
  TO authenticated
  USING (true);