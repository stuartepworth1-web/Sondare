/*
  # Update Teams tier to Entrepreneur tier

  1. Changes
    - Update subscription_tier CHECK constraint to replace 'teams' with 'entrepreneur'
    - Migrate existing 'teams' users to 'entrepreneur' tier
  
  2. Security
    - No changes to RLS policies
    - All existing security remains intact
*/

-- Update any existing teams tier users to entrepreneur
UPDATE profiles 
SET subscription_tier = 'entrepreneur' 
WHERE subscription_tier = 'teams';

-- Drop the old constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- Add new constraint with entrepreneur instead of teams
ALTER TABLE profiles 
ADD CONSTRAINT profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'entrepreneur'));