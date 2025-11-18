import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { Plus, Folder, Clock, Download, Share, Trash2, CreditCard as Edit3, Play, X, FileUp, Code } from 'lucide-react-native';
import { CreditsBar } from '@/components/CreditsBar';
import { useCredits } from '@/contexts/CreditsContext';
import { UpgradeModalIAP } from '@/components/UpgradeModalIAP';
import { router } from 'expo-router';

interface Project {
  id: string;
  name: string;
  description: string;
  framework: string;
  lastModified: string;
  status: 'In Progress' | 'Completed' | 'Draft';
}

export default function ProjectsScreen() {
  const { credits, creditsUsed, currentTier, refreshSubscriptionStatus } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');

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
    <LinearGradient
      colors={['#1C1C1E', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <CreditsBar
        credits={credits}
        creditsUsed={creditsUsed}
        onUpgrade={() => setShowUpgradeModal(true)}
      />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Projects</Text>
          <Text style={styles.headerSubtitle}>
            Manage and organize your app projects
          </Text>
        </View>
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.newProjectButton}
          onPress={() => setShowNewProjectModal(true)}
        >
          <Plus size={20} color="#000000" />
          <Text style={styles.newProjectButtonText}>New Project</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.importButton}
          onPress={() => setShowImportModal(true)}
        >
          <FileUp size={20} color="#FFFFFF" />
          <Text style={styles.importButtonText}>Import App</Text>
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
                <TouchableOpacity
                  style={styles.projectActionButton}
                  onPress={() => router.push('/(tabs)/design')}
                >
                  <Edit3 size={16} color="#FF9500" />
                  <Text style={styles.projectActionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.projectActionButton}
                  onPress={() => {
                    setPreviewProject(project);
                    setShowPreviewModal(true);
                  }}
                >
                  <Play size={16} color="#30D158" />
                  <Text style={styles.projectActionText}>Preview</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.projectActionButton}
                  onPress={() => Alert.alert('Exported!', `${project.name} has been exported`)}
                >
                  <Download size={16} color="#FF9500" />
                  <Text style={styles.projectActionText}>Export</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.projectActionButton}
                  onPress={() => Alert.alert('Share', `Share link for ${project.name} copied!`)}
                >
                  <Share size={16} color="#007AFF" />
                  <Text style={styles.projectActionText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.projectActionButtonDanger}
                  onPress={() =>
                    Alert.alert(
                      'Delete Project',
                      `Are you sure you want to delete ${project.name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            setProjects(projects.filter(p => p.id !== project.id));
                            Alert.alert('Deleted', `${project.name} has been deleted`);
                          },
                        },
                      ]
                    )
                  }
                >
                  <Trash2 size={16} color="#FF453A" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.bottomSpacer} />
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
              <Text style={styles.createButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPreviewModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              Preview: {previewProject?.name}
            </Text>
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => {
                setShowPreviewModal(false);
                setPreviewProject(null);
              }}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.previewContent}>
            <View style={styles.deviceFrame}>
              <WebView
                source={{ html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body {
                          margin: 0;
                          padding: 20px;
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          min-height: 100vh;
                        }
                        h1 {
                          font-size: 32px;
                          margin-bottom: 10px;
                        }
                        p {
                          font-size: 18px;
                          opacity: 0.9;
                          text-align: center;
                        }
                        .status {
                          background: rgba(255, 255, 255, 0.2);
                          padding: 8px 16px;
                          border-radius: 20px;
                          margin-top: 20px;
                          font-size: 14px;
                        }
                      </style>
                    </head>
                    <body>
                      <h1>${previewProject?.name || 'Project'}</h1>
                      <p>${previewProject?.description || 'No description'}</p>
                      <div class="status">Status: ${previewProject?.status || 'Draft'}</div>
                    </body>
                  </html>
                ` }}
                style={styles.webview}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showImportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import Existing App</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowImportModal(false);
                setImportCode('');
              }}
            >
              <X size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.importInfo}>
              <Code size={32} color="#FF9500" />
              <Text style={styles.importInfoTitle}>Import Your App Code</Text>
              <Text style={styles.importInfoText}>
                Paste your HTML, React, or any frontend code below. We'll analyze it and let you modify the design using our visual designer.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Paste Your Code</Text>
              <TextInput
                style={[styles.modalInput, styles.codeTextArea]}
                placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>&#10;    Your code here...&#10;  </body>&#10;</html>"
                multiline
                numberOfLines={15}
                value={importCode}
                onChangeText={setImportCode}
                placeholderTextColor="#8E8E93"
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.createButton, !importCode.trim() && styles.createButtonDisabled]}
              onPress={() => {
                if (importCode.trim()) {
                  const newProject: Project = {
                    id: Date.now().toString(),
                    name: 'Imported App',
                    description: 'Imported from existing code',
                    framework: 'HTML/JS',
                    lastModified: 'Just now',
                    status: 'Draft',
                  };
                  setProjects([newProject, ...projects]);
                  Alert.alert(
                    'Import Successful!',
                    'Your app code has been imported. Tap Edit to modify the design.',
                    [{ text: 'OK' }]
                  );
                  setShowImportModal(false);
                  setImportCode('');
                }
              }}
              disabled={!importCode.trim()}
            >
              <Text style={styles.createButtonText}>Import & Analyze</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <UpgradeModalIAP
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        onUpgradeSuccess={async () => {
          await refreshSubscriptionStatus();
        }}
      />
    </LinearGradient>
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
    flexDirection: 'row',
    gap: 12,
  },
  newProjectButton: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newProjectButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.41,
    marginLeft: 8,
  },
  importButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  importButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: -0.41,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  projectsSection: {
    marginTop: 24,
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
  bottomSpacer: {
    height: 32,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  previewCloseButton: {
    padding: 8,
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  deviceFrame: {
    width: '100%',
    maxWidth: 375,
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  importInfo: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 24,
  },
  importInfoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    marginTop: 12,
    marginBottom: 8,
  },
  importInfoText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 20,
  },
  codeTextArea: {
    minHeight: 300,
    fontFamily: 'Courier',
    fontSize: 13,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
});