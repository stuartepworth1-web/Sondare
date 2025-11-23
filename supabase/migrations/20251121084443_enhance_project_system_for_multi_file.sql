/*
  # Enhanced Project System for Multi-File Management

  ## Changes
  - Add editor preferences to user_profiles
  - Add more metadata to projects (active file, editor settings)
  - Add file content versioning support
  - Add project activity log for collaboration
  
  ## New Features
  - Track active file per project
  - Save editor preferences (font size, theme)
  - File history/versions
  - Project activity tracking
*/

-- Add editor preferences to user profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'editor_preferences') THEN
    ALTER TABLE user_profiles ADD COLUMN editor_preferences jsonb DEFAULT '{
      "fontSize": 14,
      "theme": "dark",
      "autoSave": true,
      "showLineNumbers": true,
      "wordWrap": true
    }'::jsonb;
  END IF;
END $$;

-- Add active file tracking to projects
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'active_file_id') THEN
    ALTER TABLE projects ADD COLUMN active_file_id uuid REFERENCES project_files(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_settings') THEN
    ALTER TABLE projects ADD COLUMN project_settings jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'last_opened_at') THEN
    ALTER TABLE projects ADD COLUMN last_opened_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add version tracking to project files
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'version') THEN
    ALTER TABLE project_files ADD COLUMN version integer DEFAULT 1 NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'is_deleted') THEN
    ALTER TABLE project_files ADD COLUMN is_deleted boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create file versions table for history
CREATE TABLE IF NOT EXISTS project_file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid REFERENCES project_files(id) ON DELETE CASCADE NOT NULL,
  version integer NOT NULL,
  file_content text NOT NULL,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  change_description text
);

-- Create project activity log
CREATE TABLE IF NOT EXISTS project_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('created', 'edited', 'deleted', 'renamed', 'opened', 'shared', 'generated')),
  file_id uuid REFERENCES project_files(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_files_version ON project_files(version);
CREATE INDEX IF NOT EXISTS idx_project_files_is_deleted ON project_files(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_project_file_versions_file_id ON project_file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_created_at ON project_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_last_opened ON projects(last_opened_at DESC);

-- Enable RLS
ALTER TABLE project_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file versions
CREATE POLICY "Users can view versions of files in own projects"
  ON project_file_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_files
      JOIN projects ON projects.id = project_files.project_id
      WHERE project_files.id = project_file_versions.file_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for own project files"
  ON project_file_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_files
      JOIN projects ON projects.id = project_files.project_id
      WHERE project_files.id = project_file_versions.file_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for project activity
CREATE POLICY "Users can view activity in own projects"
  ON project_activity FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_activity.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity in own projects"
  ON project_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_activity.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Function to automatically create file version on update
CREATE OR REPLACE FUNCTION create_file_version()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.file_content IS DISTINCT FROM NEW.file_content THEN
    INSERT INTO project_file_versions (file_id, version, file_content, created_by)
    VALUES (OLD.id, OLD.version, OLD.file_content, auth.uid());
    
    NEW.version = OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create version before update
DROP TRIGGER IF EXISTS before_project_file_update ON project_files;
CREATE TRIGGER before_project_file_update
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION create_file_version();

-- Function to log project activity
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO project_activity (project_id, user_id, activity_type, file_id, metadata)
    VALUES (NEW.project_id, auth.uid(), 'created', NEW.id, jsonb_build_object('file_path', NEW.file_path));
  ELSIF TG_OP = 'UPDATE' AND OLD.file_content IS DISTINCT FROM NEW.file_content THEN
    INSERT INTO project_activity (project_id, user_id, activity_type, file_id, metadata)
    VALUES (NEW.project_id, auth.uid(), 'edited', NEW.id, jsonb_build_object('file_path', NEW.file_path));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO project_activity (project_id, user_id, activity_type, file_id, metadata)
    VALUES (OLD.project_id, auth.uid(), 'deleted', OLD.id, jsonb_build_object('file_path', OLD.file_path));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to log file activity
DROP TRIGGER IF EXISTS log_file_activity ON project_files;
CREATE TRIGGER log_file_activity
  AFTER INSERT OR UPDATE OR DELETE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION log_project_activity();
