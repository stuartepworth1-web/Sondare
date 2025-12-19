/*
  # Add Starter Subscription Tier

  1. Changes
    - Update subscription_tier CHECK constraint on profiles to include 'starter' tier
    - Update subscription_tiers table CHECK constraint to include 'starter' tier  
    - Add starter tier to subscription_tiers table with $9.99 pricing
  
  2. Pricing Structure
    - Free: $0 (3 credits/month)
    - Starter: $9.99 (50 credits/month) 
    - Pro: $19.99 (200 credits/month)
    - Entrepreneur: $49.99 (500 credits/month)

  3. Security
    - Maintains existing RLS policies
*/

-- Update profiles table constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('free', 'starter', 'pro', 'entrepreneur'));

-- Update subscription_tiers table constraint
ALTER TABLE subscription_tiers DROP CONSTRAINT IF EXISTS subscription_tiers_tier_name_check;
ALTER TABLE subscription_tiers ADD CONSTRAINT subscription_tiers_tier_name_check 
  CHECK (tier_name IN ('free', 'starter', 'pro', 'entrepreneur'));

-- Delete existing subscription tiers to rebuild with correct pricing
DELETE FROM subscription_tiers WHERE tier_name IN ('free', 'pro', 'entrepreneur');

-- Insert all tiers with correct pricing
INSERT INTO subscription_tiers (tier_name, display_name, price_monthly, credits_monthly, features)
VALUES 
  ('free', 'Free', 0, 3, '["3 app generations/month", "Basic templates", "Export to code", "Community support"]'::jsonb),
  ('starter', 'Starter', 9.99, 50, '["50 app generations/month", "All templates", "Export to code", "Priority support", "Commercial use"]'::jsonb),
  ('pro', 'Pro', 19.99, 200, '["200 app generations/month", "All templates", "Export to code", "Premium support", "Commercial use", "Advanced features"]'::jsonb),
  ('entrepreneur', 'Entrepreneur', 49.99, 500, '["500 app generations/month", "All templates", "Export to code", "Premium support", "Commercial use", "White label options", "API access"]'::jsonb)
ON CONFLICT (tier_name) 
DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  credits_monthly = EXCLUDED.credits_monthly,
  features = EXCLUDED.features;