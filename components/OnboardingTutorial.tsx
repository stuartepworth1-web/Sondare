import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Code,
  Palette,
  FolderOpen,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  icon: any;
  title: string;
  description: string;
  tips: string[];
  color: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Sparkles,
    title: 'Welcome to Sondare!',
    description: 'Create mobile apps with AI-powered tools. Let\'s take a quick tour.',
    tips: [
      'Generate code with AI',
      'Design visually with drag & drop',
      'Manage multiple projects',
      'Export your creations',
    ],
    color: '#f97315',
  },
  {
    icon: Sparkles,
    title: 'AI Builder',
    description: 'Describe what you want to create and AI will generate production-ready React Native code.',
    tips: [
      'Choose a generation type (Component, Page, etc.)',
      'Describe your idea in detail',
      'Click "See Examples" for inspiration',
      'Generated code is ready to use',
    ],
    color: '#FF6B6B',
  },
  {
    icon: Palette,
    title: 'Visual Designer',
    description: 'Build interfaces visually with a Canva-like drag and drop editor.',
    tips: [
      'Add elements from the left panel',
      'Customize in the right properties panel',
      'Change colors, sizes, and positions',
      'Preview in real-time',
    ],
    color: '#4E54C8',
  },
  {
    icon: Code,
    title: 'Code Editor',
    description: 'Write and edit code with a full-featured editor with syntax highlighting.',
    tips: [
      'Navigate files with the file browser',
      'Create, rename, or delete files',
      'Customize font size and theme',
      'Auto-save keeps your work safe',
    ],
    color: '#10B981',
  },
  {
    icon: FolderOpen,
    title: 'Projects',
    description: 'Organize your work into projects. Each project can have multiple files.',
    tips: [
      'Create unlimited projects',
      'Each project supports multiple files',
      'Switch between projects easily',
      'All projects sync automatically',
    ],
    color: '#8B5CF6',
  },
];

interface OnboardingTutorialProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingTutorial({ visible, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onComplete}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleSkip}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: step.color }]}>
              <Icon size={48} color="#FFFFFF" />
            </View>

            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                Step {currentStep + 1} of {steps.length}
              </Text>
            </View>

            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>

            <View style={styles.tipsContainer}>
              {step.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <View style={[styles.tipDot, { backgroundColor: step.color }]} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.pagination}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentStep && [
                      styles.paginationDotActive,
                      { backgroundColor: step.color },
                    ],
                  ]}
                />
              ))}
            </View>

            <View style={styles.buttonRow}>
              {currentStep > 0 && (
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                  <ChevronLeft size={20} color="#8E8E93" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { backgroundColor: step.color },
                  currentStep === 0 && styles.nextButtonFull,
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'Get Started' : 'Next'}
                </Text>
                {isLastStep ? (
                  <Check size={20} color="#000" />
                ) : (
                  <ChevronRight size={20} color="#000" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    maxHeight: height * 0.85,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    alignItems: 'center',
    marginTop: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  tipsContainer: {
    width: '100%',
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#E5E5E7',
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    gap: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38383A',
  },
  paginationDotActive: {
    width: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  nextButtonFull: {
    flex: 2,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
