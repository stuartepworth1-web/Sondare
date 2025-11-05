import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Folder, Clock, Download, Share, Trash2, CreditCard as Edit3, Play, X } from 'lucide-react-native';

interface Project {
  id: string;
  name: string;
  description: string;
  framework: string;
  lastModified: string;
  status: 'In Progress' | 'Completed' | 'Draft';
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'FitTrack Pro',
      description: 'AI-powered fitness tracking app',
      framework: 'React Native',
      lastModified: '2 hours ago',
      status: 'In Progress',
    },
    {
      id: '2',
      name: 'LocalEats',
      description: 'Restaurant discovery with AR',
      framework: 'Flutter',
      lastModified: '1 day ago',
      status: 'Completed',
    },
    {
      id: '3',
      name: 'MindfulMoments',
      description: 'Meditation app for professionals',
      framework: 'React Native',
      lastModified: '3 days ago',
      status: 'Draft',
    },
  ]);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return '#FF9500';
      case 'Completed': return '#30D158';
      case 'Draft': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const createNewProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName,
        description: newProjectDescription,
        framework: 'React Native',
        lastModified: 'Just now',
        status: 'Draft',
      };
      setProjects([newProject, ...projects]);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowNewProjectModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Projects</Text>
          <Text style={styles.headerSubtitle}>
            Manage and organize your app projects
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.newProjectButton}
          onPress={() => setShowNewProjectModal(true)}
        >
          <LinearGradient
            colors={['#FF9500', '#FF6B00']}
            style={styles.newProjectButton}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.newProjectButtonText}>New Project</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          {projects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={styles.projectIconSection}>
                  <View style={styles.projectIcon}>
                    <Folder size={24} color="#FF9500" />
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectDescription}>
                      {project.description}
                    </Text>
                  </View>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(project.status) }
                ]}>
                  <Text style={styles.statusText}>{project.status}</Text>
                </View>
              </View>

              <View style={styles.projectMeta}>
                <View style={styles.projectMetaItem}>
                  <Clock size={14} color="#8E8E93" />
                  <Text style={styles.projectMetaText}>{project.lastModified}</Text>
                </View>
                <Text style={styles.projectFramework}>{project.framework}</Text>
              </View>

              <View style={styles.projectActions}>
                <TouchableOpacity style={styles.projectActionButton}>
                  <Edit3 size={16} color="#FF9500" />
                  <Text style={styles.projectActionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.projectActionButton}>
                  <Play size={16} color="#30D158" />
                  <Text style={styles.projectActionText}>Preview</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.projectActionButton}>
                  <Download size={16} color="#FF9500" />
                  <Text style={styles.projectActionText}>Export</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.projectActionButton}>
                  <Share size={16} color="#007AFF" />
                  <Text style={styles.projectActionText}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.projectActionButtonDanger}>
                  <Trash2 size={16} color="#FF453A" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showNewProjectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Project</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowNewProjectModal(false)}
            >
              <X size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter project name..."
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Describe your project..."
                multiline
                numberOfLines={4}
                value={newProjectDescription}
                onChangeText={setNewProjectDescription}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={createNewProject}
            >
              <LinearGradient
                colors={['#FF9500', '#FF6B00']}
                style={styles.createButton}
              >
                <Text style={styles.createButtonText}>Create Project</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.37,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.41,
    textAlign: 'center',
  },
  actionsBar: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  newProjectButton: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  newProjectButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.41,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  projectsSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.35,
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectIconSection: {
    flexDirection: 'row',
    flex: 1,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.38,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.08,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectMetaText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.08,
    marginLeft: 4,
  },
  projectFramework: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9500',
    fontFamily: 'System',
    letterSpacing: -0.08,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  projectActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  projectActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  projectActionButtonDanger: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  projectActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.08,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.35,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: -0.41,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 16,
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: -0.41,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  modalTextArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.41,
  },
});