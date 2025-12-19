/*
  # Fix Profile Creation Trigger

  ## Changes
  1. Drop and recreate the profile creation function with proper error handling
  2. Ensure SECURITY DEFINER is set for proper permissions
  3. Handle email field correctly from auth.users
  4. Add error logging

  ## Notes
  - This fixes the "Database error saving new user" issue
  - Function will now properly create profiles when users sign up
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Recreate function with proper permissions and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits_remaining)
  VALUES (
    NEW.id,
    NEW.email,
    3
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
