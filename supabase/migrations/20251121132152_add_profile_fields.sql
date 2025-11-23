/*
  # Add Profile Fields

  1. Changes
    - Add `full_name` column to user_profiles
    - Add `bio` column to user_profiles
    - Add `avatar_url` column to user_profiles
    - Add notification preferences columns

  2. Purpose
    - Allow users to customize their profile information
    - Store user avatar images
    - Track notification preferences
*/

-- Add profile fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN full_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'push_notifications_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN push_notifications_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'project_updates_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN project_updates_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'ai_generation_notifications'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN ai_generation_notifications boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'weekly_digest_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN weekly_digest_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'marketing_emails_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN marketing_emails_enabled boolean DEFAULT false;
  END IF;
END $$;
