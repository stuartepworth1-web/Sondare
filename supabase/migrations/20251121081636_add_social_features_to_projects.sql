/*
  # Add Social Features to Projects

  ## Changes
  - Add missing columns to projects table (is_public, is_template, social counts)
  - Add thumbnail_url for previews
  - Add metadata jsonb field
*/

-- Add missing columns to projects table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_public') THEN
    ALTER TABLE projects ADD COLUMN is_public boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_template') THEN
    ALTER TABLE projects ADD COLUMN is_template boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE projects ADD COLUMN thumbnail_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'remix_count') THEN
    ALTER TABLE projects ADD COLUMN remix_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'like_count') THEN
    ALTER TABLE projects ADD COLUMN like_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'view_count') THEN
    ALTER TABLE projects ADD COLUMN view_count integer DEFAULT 0 NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'metadata') THEN
    ALTER TABLE projects ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_projects_is_template ON projects(is_template) WHERE is_template = true;
