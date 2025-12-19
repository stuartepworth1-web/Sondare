/*
  # Add Conversation Tracking

  1. New Tables
    - `conversation_messages`
      - `id` (uuid, primary key)
      - `project_id` (uuid, FK to projects) - Links messages to a project session
      - `role` (text) - 'user' or 'assistant'
      - `content` (text) - Message content
      - `created_at` (timestamptz)
      
  2. Changes
    - Add `is_active_session` to projects table to track if project is still being worked on
    - Projects start as active_session=true and only become inactive when user explicitly completes
    
  3. Security
    - Enable RLS on conversation_messages
    - Add policies for users to manage their own conversations
*/

-- Add is_active_session to projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_active_session'
  ) THEN
    ALTER TABLE projects ADD COLUMN is_active_session boolean DEFAULT true;
  END IF;
END $$;

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversation_messages_project_id_idx ON conversation_messages(project_id);
CREATE INDEX IF NOT EXISTS conversation_messages_created_at_idx ON conversation_messages(created_at DESC);

-- RLS for conversation_messages
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversation messages"
  ON conversation_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = conversation_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversation messages for own projects"
  ON conversation_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = conversation_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );