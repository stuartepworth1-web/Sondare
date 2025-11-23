import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
  Share as ShareNative,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Play, Share } from 'lucide-react-native';
import { FileNavigator } from '../../../components/FileNavigator';
import { CodeEditor } from '../../../components/CodeEditor';
import {
  getProject,
  getProjectFiles,
  createProjectFile,
  updateProjectFile,
  deleteProjectFile,
  renameProjectFile,
  getEditorPreferences,
  updateEditorPreferences,
  type Project,
  type ProjectFile,
  type EditorPreferences,
} from '../../../lib/projects';

export default function ProjectEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [preferences, setPreferences] = useState<EditorPreferences>({
    fontSize: 14,
    theme: 'dark',
    autoSave: true,
    showLineNumbers: true,
    wordWrap: true,
  });

  useEffect(() => {
    loadProject();
    loadPreferences();
  }, [id]);

  const loadProject = async () => {
    if (!id) return;

    const proj = await getProject(id);
    if (proj) {
      setProject(proj);
    }

    const projFiles = await getProjectFiles(id);
    setFiles(projFiles);

    if (projFiles.length > 0) {
      setActiveFile(projFiles[0]);
    }
  };

  const loadPreferences = async () => {
    const prefs = await getEditorPreferences();
    setPreferences(prefs);
  };

  const handleFileSelect = (file: ProjectFile) => {
    setActiveFile(file);
  };

  const handleFileCreate = async (path: string) => {
    if (!id) return;

    const newFile = await createProjectFile(id, path);
    if (newFile) {
      setFiles([...files, newFile]);
      setActiveFile(newFile);
    } else {
      Alert.alert('Error', 'Failed to create file');
    }
  };

  const handleFileDelete = async (fileId: string) => {
    const success = await deleteProjectFile(fileId);
    if (success) {
      setFiles(files.filter(f => f.id !== fileId));
      if (activeFile?.id === fileId) {
        setActiveFile(files.find(f => f.id !== fileId) || null);
      }
    } else {
      Alert.alert('Error', 'Failed to delete file');
    }
  };

  const handleFileRename = async (fileId: string, newName: string) => {
    const success = await renameProjectFile(fileId, newName);
    if (success) {
      setFiles(files.map(f => f.id === fileId ? { ...f, file_path: newName } : f));
    } else {
      Alert.alert('Error', 'Failed to rename file');
    }
  };

  const handleCodeChange = async (newCode: string) => {
    if (!activeFile) return;

    const success = await updateProjectFile(activeFile.id, newCode);
    if (success) {
      setFiles(files.map(f =>
        f.id === activeFile.id ? { ...f, file_content: newCode } : f
      ));
      setActiveFile({ ...activeFile, file_content: newCode });
    }
  };

  const handlePreferencesChange = async (newPrefs: Partial<EditorPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await updateEditorPreferences(newPrefs);
  };

  const handleCopy = () => {
    if (activeFile) {
      Clipboard.setString(activeFile.file_content);
      Alert.alert('Copied', 'Code copied to clipboard');
    }
  };

  const handleExport = async () => {
    if (activeFile) {
      try {
        await ShareNative.share({
          message: activeFile.file_content,
          title: activeFile.file_path,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{project.name}</Text>
        </View>

        <TouchableOpacity style={styles.playButton}>
          <Play size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.editorContainer}>
        <View style={styles.sidebar}>
          <FileNavigator
            files={files}
            activeFileId={activeFile?.id}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
          />
        </View>

        <View style={styles.mainEditor}>
          {activeFile ? (
            <CodeEditor
              code={activeFile.file_content}
              onChange={handleCodeChange}
              fileName={activeFile.file_path}
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
              onCopy={handleCopy}
              onExport={handleExport}
            />
          ) : (
            <View style={styles.emptyEditor}>
              <Text style={styles.emptyText}>Select a file to start editing</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playButton: {
    padding: 8,
  },
  editorContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
    borderRightColor: '#38383A',
  },
  mainEditor: {
    flex: 1,
  },
  emptyEditor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
  },
});
