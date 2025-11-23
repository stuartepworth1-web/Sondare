import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react-native';
import { ProjectFile } from '@/lib/projects';

interface FileNavigatorProps {
  files: ProjectFile[];
  activeFileId?: string;
  onFileSelect: (file: ProjectFile) => void;
  onFileCreate: (path: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
}

export function FileNavigator({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
}: FileNavigatorProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      Alert.alert('Error', 'Please enter a file name');
      return;
    }

    const fileName = newFileName.trim();
    if (!fileName.includes('.')) {
      Alert.alert('Error', 'File name must include an extension (e.g., .tsx)');
      return;
    }

    onFileCreate(fileName);
    setNewFileName('');
    setShowNewFileInput(false);
  };

  const organizedFiles = organizeFiles(files);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Files</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewFileInput(true)}
        >
          <Plus size={18} color="#f97315" />
        </TouchableOpacity>
      </View>

      {showNewFileInput && (
        <View style={styles.newFileContainer}>
          <TextInput
            style={styles.newFileInput}
            placeholder="NewComponent.tsx"
            placeholderTextColor="#8E8E93"
            value={newFileName}
            onChangeText={setNewFileName}
            autoFocus
            onSubmitEditing={handleCreateFile}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleCreateFile}>
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.fileList} showsVerticalScrollIndicator={false}>
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            onSelect={() => onFileSelect(file)}
            onDelete={() => {
              Alert.alert(
                'Delete File',
                `Are you sure you want to delete ${file.file_path}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => onFileDelete(file.id) },
                ]
              );
            }}
            onRename={(newName) => onFileRename(file.id, newName)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface FileItemProps {
  file: ProjectFile;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  depth?: number;
}

function FileItem({ file, isActive, onSelect, onDelete, onRename, depth = 0 }: FileItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.file_path);

  const handleRename = () => {
    if (editName.trim() && editName !== file.file_path) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.fileItemContainer}>
      <TouchableOpacity
        style={[
          styles.fileItem,
          isActive && styles.fileItemActive,
          { paddingLeft: 12 + depth * 16 }
        ]}
        onPress={onSelect}
        onLongPress={() => setIsEditing(true)}
      >
        <File size={16} color={isActive ? '#f97315' : '#8E8E93'} />
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editName}
            onChangeText={setEditName}
            autoFocus
            onSubmitEditing={handleRename}
            onBlur={handleRename}
          />
        ) : (
          <Text style={[styles.fileName, isActive && styles.fileNameActive]} numberOfLines={1}>
            {file.file_path}
          </Text>
        )}
      </TouchableOpacity>

      {isActive && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Trash2 size={14} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function organizeFiles(files: ProjectFile[]) {
  const tree: any = {};

  files.forEach(file => {
    const parts = file.file_path.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        if (!current._files) current._files = [];
        current._files.push(file);
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });

  return tree;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addButton: {
    padding: 4,
  },
  newFileContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  newFileInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#f97315',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  fileList: {
    flex: 1,
  },
  fileItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 12,
    gap: 8,
  },
  fileItemActive: {
    backgroundColor: '#2C2C2E',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  fileNameActive: {
    color: '#f97315',
    fontWeight: '500',
  },
  editInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#FFFFFF',
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
});
