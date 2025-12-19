/*
  # Add Presets System

  1. New Tables
    - `app_presets`
      - `id` (uuid, primary key)
      - `name` (text) - preset name
      - `description` (text) - preset description
      - `category` (text) - preset category (layout, component, screen)
      - `preview_image` (text) - URL to preview image
      - `required_tier` (text) - minimum tier required (free, starter, pro, entrepreneur)
      - `is_featured` (boolean) - whether preset is featured
      - `preset_data` (jsonb) - the actual preset configuration
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on app_presets
    - Allow all authenticated users to read presets
    - Only admin users can create/update/delete presets

  3. Notes
    - Presets with required_tier will be filtered on the frontend based on user's subscription
    - preset_data contains components, positions, styles, etc.
*/

CREATE TABLE IF NOT EXISTS app_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL CHECK (category IN ('layout', 'component', 'screen', 'full_app')),
  preview_image text DEFAULT '',
  required_tier text NOT NULL DEFAULT 'free' CHECK (required_tier IN ('free', 'starter', 'pro', 'entrepreneur')),
  is_featured boolean DEFAULT false,
  preset_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read presets"
  ON app_presets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert presets"
  ON app_presets FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only admins can update presets"
  ON app_presets FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Only admins can delete presets"
  ON app_presets FOR DELETE
  TO authenticated
  USING (false);

-- Insert some sample free presets
INSERT INTO app_presets (name, description, category, required_tier, is_featured, preset_data)
VALUES 
  (
    'Login Screen',
    'Simple login screen with email and password inputs',
    'screen',
    'free',
    true,
    '{"components": [{"type": "text", "props": {"text": "Welcome Back", "fontSize": 24, "fontWeight": "bold", "color": "#FFFFFF"}, "position_x": 20, "position_y": 100, "width": 335, "height": 40}, {"type": "input", "props": {"placeholder": "Email", "backgroundColor": "#1C1C1E", "textColor": "#FFFFFF", "borderColor": "#3A3A3C", "borderRadius": 8}, "position_x": 20, "position_y": 160, "width": 335, "height": 50}, {"type": "input", "props": {"placeholder": "Password", "backgroundColor": "#1C1C1E", "textColor": "#FFFFFF", "borderColor": "#3A3A3C", "borderRadius": 8}, "position_x": 20, "position_y": 220, "width": 335, "height": 50}, {"type": "button", "props": {"text": "Log In", "backgroundColor": "#FF9500", "textColor": "#FFFFFF", "fontSize": 16, "borderRadius": 8}, "position_x": 20, "position_y": 290, "width": 335, "height": 50}]}'::jsonb
  ),
  (
    'Profile Header',
    'User profile header with avatar and info',
    'component',
    'free',
    true,
    '{"components": [{"type": "container", "props": {"backgroundColor": "#1C1C1E", "borderRadius": 12, "borderWidth": 0, "borderColor": "#3A3A3C", "padding": 16}, "position_x": 20, "position_y": 80, "width": 335, "height": 120}, {"type": "text", "props": {"text": "John Doe", "fontSize": 20, "fontWeight": "bold", "color": "#FFFFFF"}, "position_x": 40, "position_y": 100, "width": 200, "height": 30}, {"type": "text", "props": {"text": "john@example.com", "fontSize": 14, "fontWeight": "normal", "color": "#8E8E93"}, "position_x": 40, "position_y": 135, "width": 250, "height": 25}]}'::jsonb
  ),
  (
    'Settings List',
    'Settings screen with list of options',
    'screen',
    'starter',
    true,
    '{"components": [{"type": "header", "props": {"title": "Settings", "backgroundColor": "#1C1C1E", "textColor": "#FFFFFF", "fontSize": 18, "fontWeight": "bold", "showBackButton": true}, "position_x": 0, "position_y": 0, "width": 375, "height": 60}, {"type": "list", "props": {"itemCount": 5, "spacing": 8, "itemHeight": 50, "itemBackgroundColor": "#1C1C1E", "itemBorderRadius": 8}, "position_x": 20, "position_y": 80, "width": 335, "height": 300}]}'::jsonb
  ),
  (
    'Dashboard Cards',
    'Dashboard with metric cards',
    'layout',
    'pro',
    true,
    '{"components": [{"type": "card", "props": {"title": "Total Users", "subtitle": "1,234 active", "backgroundColor": "#1C1C1E", "borderRadius": 12, "padding": 16}, "position_x": 20, "position_y": 80, "width": 160, "height": 100}, {"type": "card", "props": {"title": "Revenue", "subtitle": "$12,345", "backgroundColor": "#1C1C1E", "borderRadius": 12, "padding": 16}, "position_x": 195, "position_y": 80, "width": 160, "height": 100}, {"type": "card", "props": {"title": "Engagement", "subtitle": "89% rate", "backgroundColor": "#1C1C1E", "borderRadius": 12, "padding": 16}, "position_x": 20, "position_y": 195, "width": 160, "height": 100}]}'::jsonb
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_app_presets_category ON app_presets(category);
CREATE INDEX IF NOT EXISTS idx_app_presets_required_tier ON app_presets(required_tier);
CREATE INDEX IF NOT EXISTS idx_app_presets_featured ON app_presets(is_featured);