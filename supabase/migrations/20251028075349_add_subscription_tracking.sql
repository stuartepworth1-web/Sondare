/*
  # Add Subscription Tracking for Hybrid Payments

  1. Changes
    - Add `payment_provider` column to profiles (apple_iap, stripe, or null)
    - Add `subscription_id` column to store provider-specific subscription IDs
    - Add `subscription_status` column to track active/cancelled/expired
    - Add `subscription_expires_at` column for expiration tracking
    - Add index on subscription_status for efficient queries

  2. Security
    - No changes to RLS policies (profiles already protected)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'payment_provider'
  ) THEN
    ALTER TABLE profiles ADD COLUMN payment_provider text CHECK (payment_provider IN ('apple_iap', 'stripe'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'grace_period'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_expires_at timestamptz;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_payment_provider ON profiles(payment_provider);
