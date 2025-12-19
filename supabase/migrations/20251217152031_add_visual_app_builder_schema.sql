/*
  # Visual App Builder Schema

  ## Overview
  Adds comprehensive support for visual drag-and-drop app building with components, screens, and templates.

  ## New Tables Created

  ### 1. app_screens
  Stores individual screens within a project
  - `id` (uuid, primary key) - Screen identifier
  - `project_id` (uuid, FK to projects) - Parent project
  - `name` (text) - Screen name (e.g., "Home", "Profile", "Settings")
  - `screen_type` (text) - Type of screen (e.g., "home", "list", "detail", "form")
  - `background_color` (text) - Screen background color
  - `order_index` (integer) - Display order in project
  - `is_home_screen` (boolean) - Whether this is the initial screen
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. app_components
  Stores individual UI components placed on screens
  - `id` (uuid, primary key) - Component identifier
  - `screen_id` (uuid, FK to app_screens) - Parent screen
  - `component_type` (text) - Type (e.g., "button", "text", "image", "input", "container")
  - `props` (jsonb) - Component properties (text, color, size, etc.)
  - `styles` (jsonb) - CSS-like styling (position, dimensions, margins, etc.)
  - `position_x` (integer) - X coordinate on screen
  - `position_y` (integer) - Y coordinate on screen
  - `width` (integer) - Component width in pixels
  - `height` (integer) - Component height in pixels
  - `layer_order` (integer) - Z-index for overlapping components
  - `parent_component_id` (uuid) - Parent container (for nested components)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. app_templates
  Pre-built app templates users can start from
  - `id` (uuid, primary key) - Template identifier
  - `name` (text) - Template name (e.g., "Social Media App", "E-commerce Store")
  - `description` (text) - Template description
  - `category` (text) - Category (e.g., "social", "ecommerce", "productivity")
  - `thumbnail_url` (text) - Preview image URL
  - `template_data` (jsonb) - Complete template structure (screens + components)
  - `is_featured` (boolean) - Whether to feature prominently
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. Update projects table
  Add columns to support visual editing mode:
  - `editing_mode` (text) - "ai" or "visual" (default "ai")
  - `current_screen_id` (uuid) - Currently active screen for editing

  ## Security
  - RLS enabled on all new tables
  - Users can only access/modify their own project data
  - Templates are publicly readable but only admins can create

  ## Notes
  - Components support nesting for complex layouts
  - All positions/sizes use pixel values for precision
  - Template system allows rapid app creation from presets
*/

-- =====================================================
-- APP_SCREENS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS app_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Screen',
  screen_type text NOT NULL DEFAULT 'custom' CHECK (screen_type IN ('home', 'list', 'detail', 'form', 'settings', 'profile', 'custom')),
  background_color text NOT NULL DEFAULT '#000000',
  order_index integer NOT NULL DEFAULT 0,
  is_home_screen boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_screens_project_id_idx ON app_screens(project_id);
CREATE INDEX IF NOT EXISTS app_screens_order_idx ON app_screens(project_id, order_index);

ALTER TABLE app_screens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app screens"
  ON app_screens FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_screens.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create app screens for own projects"
  ON app_screens FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_screens.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own app screens"
  ON app_screens FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_screens.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_screens.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own app screens"
  ON app_screens FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = app_screens.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE TRIGGER app_screens_updated_at
  BEFORE UPDATE ON app_screens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- APP_COMPONENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS app_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id uuid NOT NULL REFERENCES app_screens(id) ON DELETE CASCADE,
  component_type text NOT NULL CHECK (component_type IN ('button', 'text', 'image', 'input', 'container', 'list', 'card', 'icon', 'header', 'footer')),
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  styles jsonb NOT NULL DEFAULT '{}'::jsonb,
  position_x integer NOT NULL DEFAULT 0,
  position_y integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 100,
  height integer NOT NULL DEFAULT 50,
  layer_order integer NOT NULL DEFAULT 0,
  parent_component_id uuid REFERENCES app_components(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_components_screen_id_idx ON app_components(screen_id);
CREATE INDEX IF NOT EXISTS app_components_parent_id_idx ON app_components(parent_component_id);
CREATE INDEX IF NOT EXISTS app_components_layer_order_idx ON app_components(screen_id, layer_order);

ALTER TABLE app_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own app components"
  ON app_components FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_screens
      JOIN projects ON projects.id = app_screens.project_id
      WHERE app_screens.id = app_components.screen_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create app components for own screens"
  ON app_components FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_screens
      JOIN projects ON projects.id = app_screens.project_id
      WHERE app_screens.id = app_components.screen_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own app components"
  ON app_components FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_screens
      JOIN projects ON projects.id = app_screens.project_id
      WHERE app_screens.id = app_components.screen_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_screens
      JOIN projects ON projects.id = app_screens.project_id
      WHERE app_screens.id = app_components.screen_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own app components"
  ON app_components FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_screens
      JOIN projects ON projects.id = app_screens.project_id
      WHERE app_screens.id = app_components.screen_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE TRIGGER app_components_updated_at
  BEFORE UPDATE ON app_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- APP_TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS app_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('social', 'ecommerce', 'productivity', 'fitness', 'finance', 'education', 'entertainment', 'custom')),
  thumbnail_url text,
  template_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_templates_category_idx ON app_templates(category);
CREATE INDEX IF NOT EXISTS app_templates_featured_idx ON app_templates(is_featured);

ALTER TABLE app_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON app_templates FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- UPDATE PROJECTS TABLE
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'editing_mode'
  ) THEN
    ALTER TABLE projects ADD COLUMN editing_mode text NOT NULL DEFAULT 'ai' CHECK (editing_mode IN ('ai', 'visual'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'current_screen_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN current_screen_id uuid REFERENCES app_screens(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- INSERT DEFAULT TEMPLATES
-- =====================================================
INSERT INTO app_templates (name, description, category, is_featured, template_data)
VALUES
  (
    'Social Media App',
    'Complete social media app with feed, profile, and messaging',
    'social',
    true,
    '{"screens": [{"name": "Feed", "type": "home", "components": [{"type": "header", "props": {"title": "Feed"}}, {"type": "list", "props": {"itemType": "post"}}]}, {"name": "Profile", "type": "profile", "components": [{"type": "image", "props": {"isAvatar": true}}, {"type": "text", "props": {"isName": true}}]}], "primaryColor": "#3B82F6", "backgroundColor": "#000000"}'::jsonb
  ),
  (
    'E-commerce Store',
    'Full-featured online store with products, cart, and checkout',
    'ecommerce',
    true,
    '{"screens": [{"name": "Products", "type": "list", "components": [{"type": "list", "props": {"itemType": "product"}}, {"type": "button", "props": {"text": "View Cart"}}]}, {"name": "Product Detail", "type": "detail", "components": [{"type": "image"}, {"type": "text", "props": {"text": "Product Name"}}, {"type": "button", "props": {"text": "Add to Cart"}}]}], "primaryColor": "#10B981", "backgroundColor": "#000000"}'::jsonb
  ),
  (
    'Fitness Tracker',
    'Track workouts, set goals, and monitor progress',
    'fitness',
    true,
    '{"screens": [{"name": "Dashboard", "type": "home", "components": [{"type": "card", "props": {"title": "Today"}}, {"type": "button", "props": {"text": "Start Workout"}}]}, {"name": "Workout", "type": "form", "components": [{"type": "input", "props": {"placeholder": "Exercise name"}}, {"type": "button", "props": {"text": "Log Workout"}}]}], "primaryColor": "#F97316", "backgroundColor": "#000000"}'::jsonb
  ),
  (
    'Task Manager',
    'Organize your tasks and boost productivity',
    'productivity',
    true,
    '{"screens": [{"name": "Tasks", "type": "list", "components": [{"type": "header", "props": {"title": "My Tasks"}}, {"type": "list", "props": {"itemType": "task"}}, {"type": "button", "props": {"text": "Add Task"}}]}, {"name": "Add Task", "type": "form", "components": [{"type": "input", "props": {"placeholder": "Task title"}}, {"type": "button", "props": {"text": "Create"}}]}], "primaryColor": "#8B5CF6", "backgroundColor": "#000000"}'::jsonb
  ),
  (
    'Finance Manager',
    'Track expenses and manage your budget',
    'finance',
    true,
    '{"screens": [{"name": "Overview", "type": "home", "components": [{"type": "text", "props": {"text": "Total Balance"}}, {"type": "card", "props": {"title": "Recent Transactions"}}]}, {"name": "Add Transaction", "type": "form", "components": [{"type": "input", "props": {"placeholder": "Amount"}}, {"type": "button", "props": {"text": "Save"}}]}], "primaryColor": "#14B8A6", "backgroundColor": "#000000"}'::jsonb
  )
ON CONFLICT DO NOTHING;