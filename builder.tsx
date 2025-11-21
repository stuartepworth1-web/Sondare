import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Clipboard,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Sparkles,
  Copy,
  Download,
  Star,
  HelpCircle,
  Lightbulb,
  Code,
  FileCode,
  Wand2,
  X,
  ChevronRight,
  Camera,
  ImageIcon,
  Mic,
  Save,
  FolderPlus,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { CreditsBar } from '@/components/CreditsBar';
import { useCredits } from '@/contexts/CreditsContext';
import { UpgradeModalIAP } from '@/components/UpgradeModalIAP';
import { generateCode, CREDIT_COSTS, type GenerationType } from '@/lib/credits';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  tags: string[];
  is_featured: boolean;
}

interface GeneratedCode {
  id: string;
  code: string;
  prompt: string;
  creditsUsed: number;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function BuilderScreen() {
  const { credits, profile, refreshProfile } = useCredits();
  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState<GenerationType>('component');
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadProjects();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_featured', true)
      .limit(10);

    if (!error && data) {
      setTemplates(data);
    }
  };

  const loadProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  const generationTypes: Array<{
    key: GenerationType;
    label: string;
    description: string;
    cost: number;
    icon: any;
    example: string;
  }> = [
    {
      key: 'component',
      label: 'Component',
      description: 'Create reusable UI elements',
      cost: CREDIT_COSTS.component,
      icon: Code,
      example: 'A card with an image, title, and button',
    },
    {
      key: 'page',
      label: 'Full Screen',
      description: 'Complete page layouts',
      cost: CREDIT_COSTS.page,
      icon: FileCode,
      example: 'A profile page with stats and settings',
    },
    {
      key: 'refactor',
      label: 'Improve Code',
      description: 'Clean up and optimize',
      cost: CREDIT_COSTS.refactor,
      icon: Wand2,
      example: 'Make this code more efficient',
    },
    {
      key: 'review',
      label: 'Get Feedback',
      description: 'AI code review',
      cost: CREDIT_COSTS.review,
      icon: Lightbulb,
      example: 'Review this login form code',
    },
  ];

  const examplePrompts = [
    { text: 'A modern login screen with email and password', type: 'page' as GenerationType },
    { text: 'A button with gradient background', type: 'component' as GenerationType },
    { text: 'A profile card with avatar and bio', type: 'component' as GenerationType },
    { text: 'A settings screen with toggle switches', type: 'page' as GenerationType },
    { text: 'A pricing card with features list', type: 'component' as GenerationType },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please describe what you want to create');
      return;
    }

    if (credits < CREDIT_COSTS[generationType]) {
      Alert.alert(
        'Not Enough Credits',
        `You need ${CREDIT_COSTS[generationType]} credits but only have ${credits}. Upgrade your plan to continue.`
      );
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateCode(prompt, generationType);

      if (result.success && result.code) {
        const newCode: GeneratedCode = {
          id: Date.now().toString(),
          code: result.code,
          prompt,
          creditsUsed: CREDIT_COSTS[generationType],
        };

        setGeneratedCodes([newCode, ...generatedCodes]);
        setPrompt('');
        await refreshProfile();

        Alert.alert('Success', 'Code generated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to generate code');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    Clipboard.setString(code);
    Alert.alert('Copied', 'Code copied to clipboard');
  };

  const handleSaveToProject = (codeId: string) => {
    setSelectedCodeId(codeId);
    setShowProjectSelector(true);
  };

  const saveToProject = async (projectId: string) => {
    if (!selectedCodeId) return;

    const codeItem = generatedCodes.find(c => c.id === selectedCodeId);
    if (!codeItem) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileName = `generated_${Date.now()}.tsx`;

    const { error } = await supabase.from('project_files').insert({
      project_id: projectId,
      user_id: user.id,
      name: fileName,
      content: codeItem.code,
      file_type: 'tsx',
    });

    if (error) {
      Alert.alert('Error', 'Failed to save code to project');
    } else {
      Alert.alert('Success', 'Code saved to project!', [
        {
          text: 'View Project',
          onPress: () => router.push(`/(tabs)/projects/${projectId}`),
        },
        { text: 'OK' },
      ]);
      setShowProjectSelector(false);
      setSelectedCodeId(null);
    }
  };

  const createNewProject = async () => {
    if (!selectedCodeId) return;

    const codeItem = generatedCodes.find(c => c.id === selectedCodeId);
    if (!codeItem) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const projectName = codeItem.prompt.substring(0, 50);

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectName,
        description: 'Generated with AI',
      })
      .select()
      .single();

    if (projectError || !project) {
      Alert.alert('Error', 'Failed to create project');
      return;
    }

    const fileName = `generated_${Date.now()}.tsx`;

    const { error: fileError } = await supabase.from('project_files').insert({
      project_id: project.id,
      user_id: user.id,
      name: fileName,
      content: codeItem.code,
      file_type: 'tsx',
    });

    if (fileError) {
      Alert.alert('Error', 'Failed to save code');
    } else {
      await loadProjects();
      Alert.alert('Success', 'New project created!', [
        {
          text: 'View Project',
          onPress: () => router.push(`/(tabs)/projects/${project.id}`),
        },
        { text: 'OK' },
      ]);
      setShowProjectSelector(false);
      setSelectedCodeId(null);
    }
  };

  const useExample = (example: string, type: GenerationType) => {
    setPrompt(example);
    setGenerationType(type);
    setShowExamples(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setPrompt('Generate code based on this screenshot');
      setGenerationType('camera_to_code' as GenerationType);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setPrompt('Generate code based on this screenshot');
      setGenerationType('camera_to_code' as GenerationType);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (generationType === 'camera_to_code') {
      setPrompt('');
      setGenerationType('component');
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      Alert.alert(
        'Voice Input Demo',
        'Voice recognition would work here on a real device. For now, try typing your prompt manually!',
        [{ text: 'OK' }]
      );
    } else {
      setIsListening(true);
      Alert.alert(
        'Voice Input',
        'Speak your prompt now...',
        [
          {
            text: 'Cancel',
            onPress: () => setIsListening(false),
            style: 'cancel',
          },
          {
            text: 'Use Sample',
            onPress: () => {
              setPrompt('A modern login screen with gradient background and animated buttons');
              setIsListening(false);
            },
          },
        ]
      );
    }
  };

  return (
    <LinearGradient
      colors={['#010202', '#101623']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <CreditsBar
        credits={credits}
        creditsUsed={profile?.total_credits_spent ?? 0}
        onUpgrade={() => setShowUpgradeModal(true)}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>AI Builder</Text>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setShowHowItWorks(true)}
            >
              <HelpCircle size={24} color="#f97315" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            Describe what you want to create, and AI will generate the code
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowExamples(true)}
          >
            <Sparkles size={18} color="#f97315" />
            <Text style={styles.quickActionText}>Examples</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={takePhoto}
          >
            <Camera size={18} color="#f97315" />
            <Text style={styles.quickActionText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={pickImage}
          >
            <ImageIcon size={18} color="#f97315" />
            <Text style={styles.quickActionText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What do you want to create?</Text>
          <Text style={styles.sectionSubtitle}>Choose a generation type</Text>

          <View style={styles.typeGrid}>
            {generationTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = generationType === type.key;

              return (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                  onPress={() => setGenerationType(type.key)}
                >
                  <View style={styles.typeCardHeader}>
                    <View style={[styles.typeIcon, isSelected && styles.typeIconSelected]}>
                      <Icon size={20} color={isSelected ? '#000' : '#f97315'} />
                    </View>
                    <View style={styles.typeCost}>
                      <Zap size={12} color="#FFD700" />
                      <Text style={styles.typeCostText}>{type.cost}</Text>
                    </View>
                  </View>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe Your Idea</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedImage ? 'Describe what you want from this screenshot' : 'Be specific about colors, layout, and functionality'}
          </Text>

          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={selectedImage ? "Describe changes or additions..." : "Example: A login card with email, password fields and a blue gradient button"}
                placeholderTextColor="#666"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
                onPress={toggleVoiceInput}
              >
                <Mic size={20} color={isListening ? "#FF0000" : "#f97315"} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Sparkles size={20} color="#000" />
                <Text style={styles.generateButtonText}>
                  Generate ({CREDIT_COSTS[generationType]} credits)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {generatedCodes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generated Code</Text>

            {generatedCodes.map((item) => (
              <View key={item.id} style={styles.codeCard}>
                <View style={styles.codeCardHeader}>
                  <Text style={styles.codePrompt} numberOfLines={2}>
                    {item.prompt}
                  </Text>
                  <View style={styles.codeActions}>
                    <TouchableOpacity
                      style={styles.codeAction}
                      onPress={() => handleSaveToProject(item.id)}
                    >
                      <Save size={18} color="#f97315" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.codeAction}
                      onPress={() => handleCopy(item.code)}
                    >
                      <Copy size={18} color="#f97315" />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  style={styles.codeContent}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  <Text style={styles.codeText}>{item.code}</Text>
                </ScrollView>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showHowItWorks}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHowItWorks(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>How AI Builder Works</Text>
            <TouchableOpacity onPress={() => setShowHowItWorks(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.howItWorksStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Choose Generation Type</Text>
                <Text style={styles.stepDescription}>
                  Select what you want to create: a single component (like a button), a full screen (like a login page), code improvements, or get feedback on existing code.
                </Text>
              </View>
            </View>

            <View style={styles.howItWorksStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Describe Your Idea</Text>
                <Text style={styles.stepDescription}>
                  Be specific! Include details about colors, layout, functionality, and any special features. The more details you provide, the better the result.
                </Text>
              </View>
            </View>

            <View style={styles.howItWorksStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Generate & Use</Text>
                <Text style={styles.stepDescription}>
                  Click generate and AI will create production-ready React Native code. You can copy it, save it to a project, or use it as a starting point for your app.
                </Text>
              </View>
            </View>

            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Tips for Better Results</Text>
              <View style={styles.tip}>
                <Text style={styles.tipText}>• Mention specific colors (e.g., "orange button", "dark blue background")</Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipText}>• Describe the layout (e.g., "centered", "at the bottom", "in a grid")</Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipText}>• Include functionality (e.g., "validates email", "shows loading state")</Text>
              </View>
              <View style={styles.tip}>
                <Text style={styles.tipText}>• Reference similar apps (e.g., "like Instagram's profile card")</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showExamples}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExamples(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Example Prompts</Text>
            <TouchableOpacity onPress={() => setShowExamples(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.examplesSubtitle}>
              Tap any example to use it as your prompt
            </Text>

            {examplePrompts.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={styles.exampleCard}
                onPress={() => useExample(example.text, example.type)}
              >
                <View style={styles.exampleContent}>
                  <Text style={styles.exampleText}>{example.text}</Text>
                  <View style={styles.exampleMeta}>
                    <Text style={styles.exampleType}>
                      {generationTypes.find(t => t.key === example.type)?.label}
                    </Text>
                    <View style={styles.exampleCost}>
                      <Zap size={12} color="#FFD700" />
                      <Text style={styles.exampleCostText}>
                        {CREDIT_COSTS[example.type]}
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showProjectSelector}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProjectSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save to Project</Text>
            <TouchableOpacity onPress={() => setShowProjectSelector(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableOpacity
              style={styles.createProjectButton}
              onPress={createNewProject}
            >
              <View style={styles.createProjectIcon}>
                <FolderPlus size={24} color="#f97315" />
              </View>
              <View style={styles.createProjectContent}>
                <Text style={styles.createProjectTitle}>Create New Project</Text>
                <Text style={styles.createProjectSubtitle}>
                  Start a new project with this code
                </Text>
              </View>
              <ChevronRight size={20} color="#8E8E93" />
            </TouchableOpacity>

            {projects.length > 0 && (
              <>
                <Text style={styles.projectListTitle}>Or save to existing project:</Text>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={styles.projectCard}
                    onPress={() => saveToProject(project.id)}
                  >
                    <View style={styles.projectIcon}>
                      <FileCode size={20} color="#f97315" />
                    </View>
                    <View style={styles.projectContent}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      {project.description && (
                        <Text style={styles.projectDescription} numberOfLines={1}>
                          {project.description}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={20} color="#8E8E93" />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      <UpgradeModalIAP
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={profile?.subscription_tier || 'free'}
        onUpgradeSuccess={async () => {
          await refreshProfile();
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helpButton: {
    padding: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: '#f97315',
    backgroundColor: '#2C2C2E',
  },
  typeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconSelected: {
    backgroundColor: '#f97315',
  },
  typeCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeCostText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    paddingRight: 56,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  voiceButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#FF0000',
  },
  generateButton: {
    backgroundColor: '#f97315',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  codeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  codeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  codePrompt: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeAction: {
    padding: 6,
  },
  codeContent: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#00FF00',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  howItWorksStep: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97315',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },
  tipsSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tip: {
    marginBottom: 12,
  },
  tipText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
  },
  examplesSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exampleContent: {
    flex: 1,
    marginRight: 12,
  },
  exampleText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 20,
  },
  exampleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exampleType: {
    fontSize: 13,
    color: '#8E8E93',
  },
  exampleCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exampleCostText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f97315',
  },
  createProjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createProjectContent: {
    flex: 1,
  },
  createProjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  createProjectSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  projectListTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
});
