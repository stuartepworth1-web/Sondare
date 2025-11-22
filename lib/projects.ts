import { supabase } from './supabase';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  framework: 'react-native' | 'flutter' | 'web' | 'nextjs';
  is_public: boolean;
  thumbnail_url?: string;
  active_file_id?: string;
  last_opened_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  file_content: string;
  file_type: 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' | 'md';
  version: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface EditorPreferences {
  fontSize: number;
  theme: 'dark' | 'light';
  autoSave: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
}

export async function createProject(
  name: string,
  description: string = '',
  framework: Project['framework'] = 'react-native'
): Promise<Project | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      description,
      framework,
      last_opened_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return null;
  }

  await createProjectFile(data.id, 'App.tsx', getDefaultAppContent(framework));

  return data;
}

export async function getUserProjects(limit = 50): Promise<Project[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('last_opened_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
}

export async function getProject(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  await updateProjectLastOpened(projectId);

  return data;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'is_public' | 'thumbnail_url'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project:', error);
    return false;
  }

  return true;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
}

export async function updateProjectLastOpened(projectId: string): Promise<void> {
  await supabase
    .from('projects')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', projectId);
}

export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_deleted', false)
    .order('file_path');

  if (error) {
    console.error('Error fetching project files:', error);
    return [];
  }

  return data || [];
}

export async function createProjectFile(
  projectId: string,
  filePath: string,
  content: string = '',
  fileType?: ProjectFile['file_type']
): Promise<ProjectFile | null> {
  const detectedType = fileType || detectFileType(filePath);

  const { data, error } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      file_path: filePath,
      file_content: content,
      file_type: detectedType,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating file:', error);
    return null;
  }

  return data;
}

export async function updateProjectFile(
  fileId: string,
  content: string
): Promise<boolean> {
  const { error } = await supabase
    .from('project_files')
    .update({ file_content: content })
    .eq('id', fileId);

  if (error) {
    console.error('Error updating file:', error);
    return false;
  }

  return true;
}

export async function renameProjectFile(
  fileId: string,
  newPath: string
): Promise<boolean> {
  const { error } = await supabase
    .from('project_files')
    .update({ file_path: newPath })
    .eq('id', fileId);

  if (error) {
    console.error('Error renaming file:', error);
    return false;
  }

  return true;
}

export async function deleteProjectFile(fileId: string): Promise<boolean> {
  const { error } = await supabase
    .from('project_files')
    .update({ is_deleted: true })
    .eq('id', fileId);

  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }

  return true;
}

export async function getFileVersions(fileId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('project_file_versions')
    .select('*')
    .eq('file_id', fileId)
    .order('version', { ascending: false });

  if (error) {
    console.error('Error fetching file versions:', error);
    return [];
  }

  return data || [];
}

export async function getEditorPreferences(): Promise<EditorPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getDefaultEditorPreferences();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('editor_preferences')
    .eq('id', user.id)
    .single();

  if (error || !data?.editor_preferences) {
    return getDefaultEditorPreferences();
  }

  return data.editor_preferences as EditorPreferences;
}

export async function updateEditorPreferences(
  preferences: Partial<EditorPreferences>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const current = await getEditorPreferences();
  const updated = { ...current, ...preferences };

  const { error } = await supabase
    .from('user_profiles')
    .update({ editor_preferences: updated })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating preferences:', error);
    return false;
  }

  return true;
}

function detectFileType(filePath: string): ProjectFile['file_type'] {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'tsx': return 'tsx';
    case 'ts': return 'ts';
    case 'jsx': return 'jsx';
    case 'js': return 'js';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'md': return 'md';
    default: return 'tsx';
  }
}

function getDefaultEditorPreferences(): EditorPreferences {
  return {
    fontSize: 14,
    theme: 'dark',
    autoSave: true,
    showLineNumbers: true,
    wordWrap: true,
  };
}

function getDefaultAppContent(framework: string): string {
  return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your App!</Text>
      <Text style={styles.subtitle}>Start building something amazing</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
`;
}

export function organizeFilesIntoTree(files: ProjectFile[]) {
  const tree: any = {};

  files.forEach(file => {
    const parts = file.file_path.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = file;
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    });
  });

  return tree;
}
