/*
  # Add User Onboarding Tracking

  1. Changes
    - Add `onboarding_completed` column to `user_profiles` table
    - Add `onboarding_completed_at` column to track when they finished
    - Set default to false for new users

  2. Purpose
    - Track whether users have completed the interactive onboarding flow
    - Show onboarding only once per user
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_completed_at timestamptz;
  END IF;
END $$;
