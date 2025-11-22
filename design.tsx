// Design Screen - Updated with drag functionality and complete IAP integration
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  Type,
  Image as ImageIcon,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  X,
  Upload,
  Settings,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Edit3,
  Move,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Save,
  Grid3x3,
  Download,
  Music,
  Video,
  FileUp,
} from 'lucide-react-native';
import { CreditsBar } from '@/components/CreditsBar';
import { useCredits } from '@/contexts/CreditsContext';
import { UpgradeModalIAP } from '@/components/UpgradeModalIAP';
import { supabase } from '@/lib/supabase';

interface CanvasElement {
  id: string;
  type: 'text' | 'button' | 'image' | 'container' | 'audio' | 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  text?: string;
  fontSize?: number;
  borderRadius?: number;
  imageUri?: string;
  audioUri?: string;
  videoUri?: string;
  textColor?: string;
  borderWidth?: number;
  borderColor?: string;
  zIndex?: number;
  opacity?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffset?: { x: number; y: number };
  padding?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

interface PresetDesign {
  id: string;
  name: string;
  type: 'button' | 'text' | 'image' | 'container';
  template: Partial<CanvasElement>;
}

const COLORS = [
  '#f97315', '#007AFF', '#34C759', '#FF3B30', '#5856D6',
  '#AF52DE', '#FF2D55', '#FFCC00', '#000000', '#FFFFFF',
  '#8E8E93', '#F5F5F5', '#2C2C2E', '#1C1C1E', '#38383A',
];

const GRADIENT_PRESETS = [
  { name: 'Sunset', colors: ['#FF6B6B', '#FF8E53'] },
  { name: 'Ocean', colors: ['#4E54C8', '#8F94FB'] },
  { name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { name: 'Fire', colors: ['#f97315', '#FF3B30'] },
  { name: 'Night', colors: ['#000000', '#2C2C2E'] },
  { name: 'Dawn', colors: ['#F5F5F5', '#E5E5E5'] },
];

const presetDesigns: PresetDesign[] = [
  {
    id: 'button-primary',
    name: 'Primary Button',
    type: 'button',
    template: {
      type: 'button',
      width: 200,
      height: 48,
      backgroundColor: '#f97315',
      text: 'Get Started',
      fontSize: 16,
      borderRadius: 12,
      textColor: '#FFFFFF',
    },
  },
  {
    id: 'button-secondary',
    name: 'Secondary Button',
    type: 'button',
    template: {
      type: 'button',
      width: 200,
      height: 48,
      backgroundColor: '#007AFF',
      text: 'Learn More',
      fontSize: 16,
      borderRadius: 12,
      textColor: '#FFFFFF',
    },
  },
  {
    id: 'button-outline',
    name: 'Outline Button',
    type: 'button',
    template: {
      type: 'button',
      width: 180,
      height: 44,
      backgroundColor: 'transparent',
      text: 'Cancel',
      fontSize: 15,
      borderRadius: 10,
      textColor: '#f97315',
      borderWidth: 2,
      borderColor: '#f97315',
    },
  },
  {
    id: 'button-gradient',
    name: 'Gradient Button',
    type: 'button',
    template: {
      type: 'button',
      width: 220,
      height: 52,
      backgroundColor: '#5856D6',
      text: 'Continue',
      fontSize: 17,
      borderRadius: 16,
      textColor: '#FFFFFF',
    },
  },
  {
    id: 'button-small',
    name: 'Small Button',
    type: 'button',
    template: {
      type: 'button',
      width: 100,
      height: 36,
      backgroundColor: '#34C759',
      text: 'Save',
      fontSize: 14,
      borderRadius: 8,
      textColor: '#FFFFFF',
    },
  },
  {
    id: 'button-danger',
    name: 'Danger Button',
    type: 'button',
    template: {
      type: 'button',
      width: 160,
      height: 44,
      backgroundColor: '#FF3B30',
      text: 'Delete',
      fontSize: 15,
      borderRadius: 10,
      textColor: '#FFFFFF',
    },
  },
  {
    id: 'text-heading',
    name: 'Heading',
    type: 'text',
    template: {
      type: 'text',
      width: 280,
      height: 45,
      backgroundColor: 'transparent',
      text: 'Welcome Back',
      fontSize: 32,
      textColor: '#000000',
    },
  },
  {
    id: 'text-subtitle',
    name: 'Subtitle',
    type: 'text',
    template: {
      type: 'text',
      width: 250,
      height: 35,
      backgroundColor: 'transparent',
      text: 'Start building today',
      fontSize: 20,
      textColor: '#000000',
    },
  },
  {
    id: 'text-body',
    name: 'Body Text',
    type: 'text',
    template: {
      type: 'text',
      width: 280,
      height: 80,
      backgroundColor: 'transparent',
      text: 'This is a sample paragraph of body text that wraps.',
      fontSize: 15,
      textColor: '#000000',
    },
  },
  {
    id: 'text-caption',
    name: 'Caption',
    type: 'text',
    template: {
      type: 'text',
      width: 200,
      height: 25,
      backgroundColor: 'transparent',
      text: 'Small caption text',
      fontSize: 12,
      textColor: '#8E8E93',
    },
  },
  {
    id: 'text-title',
    name: 'Title',
    type: 'text',
    template: {
      type: 'text',
      width: 280,
      height: 50,
      backgroundColor: 'transparent',
      text: 'App Title',
      fontSize: 36,
      textColor: '#000000',
    },
  },
  {
    id: 'image-square',
    name: 'Square Image',
    type: 'image',
    template: {
      type: 'image',
      width: 200,
      height: 200,
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
    },
  },
  {
    id: 'image-wide',
    name: 'Wide Image',
    type: 'image',
    template: {
      type: 'image',
      width: 280,
      height: 160,
      backgroundColor: '#F5F5F5',
      borderRadius: 16,
    },
  },
  {
    id: 'image-circle',
    name: 'Circle Avatar',
    type: 'image',
    template: {
      type: 'image',
      width: 120,
      height: 120,
      backgroundColor: '#F5F5F5',
      borderRadius: 60,
    },
  },
  {
    id: 'image-banner',
    name: 'Banner Image',
    type: 'image',
    template: {
      type: 'image',
      width: 300,
      height: 120,
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
    },
  },
  {
    id: 'container-card',
    name: 'Card Container',
    type: 'container',
    template: {
      type: 'container',
      width: 280,
      height: 180,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E5E5',
    },
  },
  {
    id: 'container-section',
    name: 'Section Container',
    type: 'container',
    template: {
      type: 'container',
      width: 300,
      height: 200,
      backgroundColor: '#F9F9F9',
      borderRadius: 12,
    },
  },
  {
    id: 'container-panel',
    name: 'Panel',
    type: 'container',
    template: {
      type: 'container',
      width: 260,
      height: 140,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#f97315',
    },
  },
];

function DraggableElement({ element, isSelected, onDrag, onDragEnd, onSelect, children }: {
  element: CanvasElement;
  isSelected: boolean;
  onDrag: (newX: number, newY: number) => void;
  onDragEnd: () => void;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  const startX = useSharedValue(element.x);
  const startY = useSharedValue(element.y);

  const gesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onSelect)();
      startX.value = element.x;
      startY.value = element.y;
    })
    .onUpdate((e) => {
      const newX = startX.value + e.translationX;
      const newY = startY.value + e.translationY;
      runOnJS(onDrag)(newX, newY);
    })
    .onEnd(() => {
      runOnJS(onDragEnd)();
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={{ flex: 1, width: '100%', height: '100%' }}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

function ResizeHandle({ corner, element, onResize, screenType, screenSizes, snapToGridValue }: {
  corner: 'nw' | 'ne' | 'sw' | 'se';
  element: CanvasElement;
  onResize: (props: { width: number; height: number; x: number; y: number }) => void;
  screenType: 'mobile' | 'tablet' | 'desktop';
  screenSizes: any;
  snapToGridValue: (value: number) => number;
}) {
  const startValues = useRef({ width: 0, height: 0, elementX: 0, elementY: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      startValues.current = {
        width: element.width,
        height: element.height,
        elementX: element.x,
        elementY: element.y,
      };
    })
    .onUpdate((e) => {
      const deltaX = e.translationX;
      const deltaY = e.translationY;

      let newWidth = startValues.current.width;
      let newHeight = startValues.current.height;
      let newX = startValues.current.elementX;
      let newY = startValues.current.elementY;

      const maxWidth = screenSizes[screenType].width;
      const maxHeight = screenSizes[screenType].height;

      if (corner === 'se') {
        newWidth = Math.max(50, Math.min(maxWidth - element.x, startValues.current.width + deltaX));
        newHeight = Math.max(30, Math.min(maxHeight - element.y, startValues.current.height + deltaY));
      } else if (corner === 'sw') {
        const widthChange = -deltaX;
        const potentialWidth = startValues.current.width + widthChange;
        const potentialX = startValues.current.elementX - widthChange;
        newWidth = Math.max(50, potentialWidth);
        newX = Math.max(0, Math.min(potentialX, startValues.current.elementX + startValues.current.width - 50));
        newHeight = Math.max(30, Math.min(maxHeight - element.y, startValues.current.height + deltaY));
      } else if (corner === 'ne') {
        newWidth = Math.max(50, Math.min(maxWidth - element.x, startValues.current.width + deltaX));
        const heightChange = -deltaY;
        const potentialHeight = startValues.current.height + heightChange;
        const potentialY = startValues.current.elementY - heightChange;
        newHeight = Math.max(30, potentialHeight);
        newY = Math.max(0, Math.min(potentialY, startValues.current.elementY + startValues.current.height - 30));
      } else if (corner === 'nw') {
        const widthChange = -deltaX;
        const potentialWidth = startValues.current.width + widthChange;
        const potentialX = startValues.current.elementX - widthChange;
        newWidth = Math.max(50, potentialWidth);
        newX = Math.max(0, Math.min(potentialX, startValues.current.elementX + startValues.current.width - 50));
        const heightChange = -deltaY;
        const potentialHeight = startValues.current.height + heightChange;
        const potentialY = startValues.current.elementY - heightChange;
        newHeight = Math.max(30, potentialHeight);
        newY = Math.max(0, Math.min(potentialY, startValues.current.elementY + startValues.current.height - 30));
      }

      runOnJS(onResize)({
        width: snapToGridValue(newWidth),
        height: snapToGridValue(newHeight),
        x: snapToGridValue(newX),
        y: snapToGridValue(newY),
      });
    });

  const cornerStyles = {
    nw: styles.cornerTopLeft,
    ne: styles.cornerTopRight,
    sw: styles.cornerBottomLeft,
    se: styles.cornerBottomRight,
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cornerDot, cornerStyles[corner]]} />
    </GestureDetector>
  );
}

export default function DesignScreen() {
  const { credits, profile } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [showLayersModal, setShowLayersModal] = useState(false);
  const [showEditTextModal, setShowEditTextModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [screenType, setScreenType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [editingText, setEditingText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState<{
    color?: string;
    gradient?: string[];
    opacity: number;
  }>({
    color: '#FFFFFF',
    opacity: 1,
  });
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const moveSpeedRef = useRef<{ current: number }>({ current: 1 });
  const accelerationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const screenSizes = {
    mobile: { width: 320, height: 568 },
    tablet: { width: 400, height: 600 },
    desktop: { width: 500, height: 400 },
  };

  const gridSize = 10;

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const saveToHistory = (elements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(elements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const addElement = (type: 'text' | 'button' | 'image' | 'container' | 'audio' | 'video') => {
    const maxZ = Math.max(0, ...canvasElements.map(el => el.zIndex || 0));
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 100,
      width: type === 'button' ? 160 : type === 'text' ? 150 : type === 'audio' ? 300 : type === 'video' ? 320 : 200,
      height: type === 'button' ? 44 : type === 'text' ? 30 : type === 'audio' ? 60 : type === 'video' ? 180 : 150,
      backgroundColor: type === 'button' ? '#f97315' : type === 'container' ? '#F5F5F5' : type === 'audio' ? '#1C1C1E' : type === 'video' ? '#000000' : 'transparent',
      text: type === 'text' ? 'Text Label' : type === 'button' ? 'Button' : type === 'audio' ? 'Audio Player' : type === 'video' ? 'Video Player' : undefined,
      fontSize: type === 'text' ? 16 : type === 'button' ? 15 : undefined,
      borderRadius: type === 'button' ? 12 : type === 'container' ? 16 : 8,
      textColor: type === 'button' ? '#FFFFFF' : '#000000',
      zIndex: maxZ + 1,
    };
    const newElements = [...canvasElements, newElement];
    setCanvasElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(newElement.id);
  };

  const addPresetElement = (preset: PresetDesign) => {
    const maxZ = Math.max(0, ...canvasElements.map(el => el.zIndex || 0));
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      x: 50,
      y: 100,
      zIndex: maxZ + 1,
      ...preset.template,
    } as CanvasElement;
    const newElements = [...canvasElements, newElement];
    setCanvasElements(newElements);
    saveToHistory(newElements);
    setSelectedElement(newElement.id);
    setShowPresetsModal(false);
  };

  const deleteElement = (id: string) => {
    const newElements = canvasElements.filter(el => el.id !== id);
    setCanvasElements(newElements);
    saveToHistory(newElements);
    if (selectedElement === id) setSelectedElement(null);
  };

  const duplicateElement = (id: string) => {
    const element = canvasElements.find(el => el.id === id);
    if (element) {
      const maxZ = Math.max(0, ...canvasElements.map(el => el.zIndex || 0));
      const newElement = {
        ...element,
        id: Date.now().toString(),
        x: element.x + 20,
        y: element.y + 20,
        zIndex: maxZ + 1,
      };
      const newElements = [...canvasElements, newElement];
      setCanvasElements(newElements);
      saveToHistory(newElements);
    }
  };

  const updateElementProperty = (id: string, property: keyof CanvasElement, value: any) => {
    const newElements = canvasElements.map(el => (el.id === id ? { ...el, [property]: value } : el));
    setCanvasElements(newElements);
    saveToHistory(newElements);
  };

  const updateElementProperties = (id: string, properties: Partial<CanvasElement>) => {
    const newElements = canvasElements.map(el => (el.id === id ? { ...el, ...properties } : el));
    setCanvasElements(newElements);
    saveToHistory(newElements);
  };

  const moveElement = (id: string, deltaX: number, deltaY: number) => {
    const element = canvasElements.find(el => el.id === id);
    if (!element) return;

    const newX = snapToGridValue(Math.max(0, Math.min(element.x + deltaX, screenSizes[screenType].width - element.width)));
    const newY = snapToGridValue(Math.max(0, Math.min(element.y + deltaY, screenSizes[screenType].height - element.height)));

    const newElements = canvasElements.map(el =>
      el.id === id ? { ...el, x: newX, y: newY } : el
    );
    setCanvasElements(newElements);
  };

  const handleElementDrag = (id: string, newX: number, newY: number) => {
    const element = canvasElements.find(el => el.id === id);
    if (!element) return;

    const clampedX = snapToGridValue(Math.max(0, Math.min(newX, screenSizes[screenType].width - element.width)));
    const clampedY = snapToGridValue(Math.max(0, Math.min(newY, screenSizes[screenType].height - element.height)));

    const newElements = canvasElements.map(el =>
      el.id === id ? { ...el, x: clampedX, y: clampedY } : el
    );
    setCanvasElements(newElements);
  };

  const startContinuousMove = (id: string, deltaX: number, deltaY: number) => {
    moveSpeedRef.current.current = 1;

    moveElement(id, deltaX * moveSpeedRef.current.current, deltaY * moveSpeedRef.current.current);

    accelerationTimerRef.current = setTimeout(() => {
      moveSpeedRef.current.current = 3;
    }, 500);

    moveIntervalRef.current = setInterval(() => {
      moveElement(id, deltaX * moveSpeedRef.current.current, deltaY * moveSpeedRef.current.current);
    }, 50);
  };

  const stopContinuousMove = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
      saveToHistory(canvasElements);
    }
    if (accelerationTimerRef.current) {
      clearTimeout(accelerationTimerRef.current);
      accelerationTimerRef.current = null;
    }
    if (moveSpeedRef.current) {
      moveSpeedRef.current.current = 1;
    }
  };

  useEffect(() => {
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, []);

  const moveElementUp = (id: string) => {
    const element = canvasElements.find(el => el.id === id);
    if (!element) return;
    const higherElements = canvasElements.filter(el => (el.zIndex || 0) > (element.zIndex || 0));
    if (higherElements.length === 0) return;
    const nextZ = Math.min(...higherElements.map(el => el.zIndex || 0));
    const newElements = canvasElements.map(el => {
      if (el.id === id) return { ...el, zIndex: nextZ };
      if (el.zIndex === nextZ) return { ...el, zIndex: element.zIndex };
      return el;
    });
    setCanvasElements(newElements);
    saveToHistory(newElements);
  };

  const moveElementDown = (id: string) => {
    const element = canvasElements.find(el => el.id === id);
    if (!element) return;
    const lowerElements = canvasElements.filter(el => (el.zIndex || 0) < (element.zIndex || 0));
    if (lowerElements.length === 0) return;
    const prevZ = Math.max(...lowerElements.map(el => el.zIndex || 0));
    const newElements = canvasElements.map(el => {
      if (el.id === id) return { ...el, zIndex: prevZ };
      if (el.zIndex === prevZ) return { ...el, zIndex: element.zIndex };
      return el;
    });
    setCanvasElements(newElements);
    saveToHistory(newElements);
  };

  const alignElement = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedElement) return;
    const element = canvasElements.find(el => el.id === selectedElement);
    if (!element) return;
    const canvasWidth = screenSizes[screenType].width;
    let newX = element.x;
    if (alignment === 'left') newX = 10;
    if (alignment === 'center') newX = (canvasWidth - element.width) / 2;
    if (alignment === 'right') newX = canvasWidth - element.width - 10;
    updateElementProperty(selectedElement, 'x', snapToGridValue(newX));
  };

  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Not Supported', 'Image upload is not supported in web preview. This feature works on iOS and Android devices.');
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access photos is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (!asset.uri) {
          Alert.alert('Error', 'Failed to load image. Please try again.');
          return;
        }
        if (selectedElement) {
          updateElementProperty(selectedElement, 'imageUri', asset.uri);
        } else {
          const maxZ = Math.max(0, ...canvasElements.map(el => el.zIndex || 0));
          const newElement: CanvasElement = {
            id: Date.now().toString(),
            type: 'image',
            x: 50,
            y: 100,
            width: 200,
            height: 200,
            backgroundColor: '#F5F5F5',
            borderRadius: 12,
            imageUri: asset.uri,
            zIndex: maxZ + 1,
          };
          const newElements = [...canvasElements, newElement];
          setCanvasElements(newElements);
          saveToHistory(newElements);
          setSelectedElement(newElement.id);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to load image. Please try again.');
    }
  };

  const startEditText = () => {
    const element = canvasElements.find(el => el.id === selectedElement);
    if (element && (element.type === 'text' || element.type === 'button')) {
      setEditingText(element.text || '');
      setShowEditTextModal(true);
    }
  };

  const saveEditedText = () => {
    if (selectedElement) {
      updateElementProperty(selectedElement, 'text', editingText);
      setShowEditTextModal(false);
    }
  };

  const saveProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to save projects');
        return;
      }

      const projectData = {
        user_id: user.id,
        name: projectName,
        screen_type: screenType,
        elements: canvasElements,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .insert([projectData]);

      if (error) throw error;

      Alert.alert('Success', 'Project saved successfully!');
      setShowSaveModal(false);
      setProjectName('');
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save project');
    }
  };

  const exportDesign = async () => {
    if (canvasElements.length === 0) {
      Alert.alert('Nothing to Export', 'Add some elements to your design first');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please login to export designs');
        return;
      }

      const exportData = {
        user_id: user.id,
        name: `Export_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
        screen_type: screenType,
        elements: canvasElements,
        is_export: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .insert([exportData]);

      if (error) throw error;

      const designJson = JSON.stringify({
        screenType,
        elements: canvasElements,
        exportedAt: new Date().toISOString(),
      }, null, 2);

      console.log('Exported Design JSON:', designJson);

      Alert.alert(
        'Export Successful',
        `Your design has been exported!\n\nElements: ${canvasElements.length}\nScreen: ${screenType}\n\nExported to your projects library.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting design:', error);
      Alert.alert('Error', 'Failed to export design');
    }
  };

  const sortedElements = [...canvasElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  const selectedElementData = canvasElements.find(el => el.id === selectedElement);

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

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Designer</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, historyIndex === 0 && styles.headerButtonDisabled]}
            onPress={undo}
            disabled={historyIndex === 0}
          >
            <Undo size={18} color={historyIndex === 0 ? '#38383A' : '#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, historyIndex === history.length - 1 && styles.headerButtonDisabled]}
            onPress={redo}
            disabled={historyIndex === history.length - 1}
          >
            <Redo size={18} color={historyIndex === history.length - 1 ? '#38383A' : '#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, showGrid && styles.headerButtonActive]}
            onPress={() => setShowGrid(!showGrid)}
          >
            <Grid3x3 size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowLayersModal(true)}
          >
            <Layers size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSaveModal(true)}
          >
            <Save size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={exportDesign}
          >
            <Download size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.toolbarContent}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => setShowPresetsModal(true)}
            >
              <Sparkles size={20} color="#30D158" />
              <Text style={styles.toolButtonText}>Presets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={pickImage}
            >
              <Upload size={20} color="#5856D6" />
              <Text style={styles.toolButtonText}>Upload</Text>
            </TouchableOpacity>

            <View style={styles.toolbarDivider} />

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('text')}
            >
              <Type size={20} color="#f97315" />
              <Text style={styles.toolButtonText}>Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('button')}
            >
              <Palette size={20} color="#f97315" />
              <Text style={styles.toolButtonText}>Button</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('image')}
            >
              <ImageIcon size={20} color="#f97315" />
              <Text style={styles.toolButtonText}>Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('container')}
            >
              <Layout size={20} color="#f97315" />
              <Text style={styles.toolButtonText}>Container</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('audio')}
            >
              <Music size={20} color="#f97315" />
              <Text style={styles.toolButtonText}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('video')}
            >
              <Video size={20} color="#f97315" />
              <Text style={styles.toolButtonText}>Video</Text>
            </TouchableOpacity>

            {selectedElement && (
              <>
                <View style={styles.toolbarDivider} />

                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => alignElement('left')}
                >
                  <AlignLeft size={20} color="#007AFF" />
                  <Text style={styles.toolButtonText}>Left</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => alignElement('center')}
                >
                  <AlignCenter size={20} color="#007AFF" />
                  <Text style={styles.toolButtonText}>Center</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => alignElement('right')}
                >
                  <AlignRight size={20} color="#007AFF" />
                  <Text style={styles.toolButtonText}>Right</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.screenSizeSelector}>
        <View style={styles.screenTypeButtons}>
          <TouchableOpacity
            style={[
              styles.sizeButton,
              screenType === 'mobile' && styles.sizeButtonActive,
            ]}
            onPress={() => setScreenType('mobile')}
          >
            <Smartphone size={20} color={screenType === 'mobile' ? '#f97315' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sizeButton,
              screenType === 'tablet' && styles.sizeButtonActive,
            ]}
            onPress={() => setScreenType('tablet')}
          >
            <Tablet size={20} color={screenType === 'tablet' ? '#f97315' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sizeButton,
              screenType === 'desktop' && styles.sizeButtonActive,
            ]}
            onPress={() => setScreenType('desktop')}
          >
            <Monitor size={20} color={screenType === 'desktop' ? '#f97315' : '#8E8E93'} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.gridToggleButton,
            snapToGrid && styles.sizeButtonActive,
          ]}
          onPress={() => setSnapToGrid(!snapToGrid)}
        >
          <Grid3x3 size={20} color={snapToGrid ? '#f97315' : '#8E8E93'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.canvasContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setSelectedElement(null);
              setSelectedBackground(true);
            }}
            style={[
              styles.canvas,
              {
                width: screenSizes[screenType].width,
                height: screenSizes[screenType].height,
                backgroundColor: backgroundStyle.gradient ? 'transparent' : backgroundStyle.color,
                opacity: backgroundStyle.opacity,
                overflow: 'hidden',
              },
              selectedBackground && styles.canvasSelected,
            ]}
          >
            {backgroundStyle.gradient && (
              <LinearGradient
                colors={backgroundStyle.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }}
              />
            )}
            {showGrid && (
              <View style={styles.gridOverlay}>
                {Array.from({ length: Math.ceil(screenSizes[screenType].height / gridSize) }).map((_, i) => (
                  <View
                    key={`h-${i}`}
                    style={[styles.gridLine, { top: i * gridSize, width: screenSizes[screenType].width }]}
                  />
                ))}
                {Array.from({ length: Math.ceil(screenSizes[screenType].width / gridSize) }).map((_, i) => (
                  <View
                    key={`v-${i}`}
                    style={[styles.gridLineVertical, { left: i * gridSize, height: screenSizes[screenType].height }]}
                  />
                ))}
              </View>
            )}

            {canvasElements.length === 0 ? (
              <View style={styles.emptyCanvas}>
                <Plus size={48} color="#38383A" />
                <Text style={styles.emptyCanvasText}>
                  Tap tools or presets to add elements
                </Text>
              </View>
            ) : (
              sortedElements.map(element => {
                const isSelected = selectedElement === element.id;
                return (
                  <TouchableOpacity
                    key={element.id}
                    onPress={() => {
                      setSelectedElement(element.id);
                      setSelectedBackground(false);
                    }}
                    activeOpacity={0.9}
                    style={[
                      styles.canvasElement,
                      {
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        backgroundColor: element.backgroundColor,
                        borderWidth: isSelected ? 2 : element.borderWidth || 0,
                        borderColor: isSelected ? '#f97315' : element.borderColor || 'transparent',
                        borderRadius: element.borderRadius || 8,
                        zIndex: element.zIndex || 0,
                        opacity: element.opacity || 1,
                        padding: element.padding || 0,
                      },
                    ]}
                  >
                    <DraggableElement
                      element={element}
                      isSelected={isSelected}
                      onDrag={(newX, newY) => handleElementDrag(element.id, newX, newY)}
                      onDragEnd={() => saveToHistory(canvasElements)}
                      onSelect={() => setSelectedElement(element.id)}
                    >
                      {element.type === 'text' && (
                      <Text
                        style={[
                          styles.elementText,
                          {
                            fontSize: element.fontSize,
                            color: element.textColor || '#000000',
                            textAlign: element.textAlign || 'center',
                            fontWeight: element.fontWeight || '400',
                          },
                        ]}
                      >
                        {element.text}
                      </Text>
                    )}
                    {element.type === 'button' && (
                      <View style={styles.buttonTextContainer}>
                        <Text
                          style={[
                            styles.buttonText,
                            {
                              fontSize: element.fontSize,
                              color: element.textColor || '#FFFFFF',
                              textAlign: element.textAlign || 'center',
                              fontWeight: element.fontWeight || '600',
                            },
                          ]}
                        >
                          {element.text}
                        </Text>
                      </View>
                    )}
                    {element.type === 'image' && (
                      <View style={styles.imagePlaceholder}>
                        {element.imageUri ? (
                          <Image source={{ uri: element.imageUri }} style={styles.uploadedImage} />
                        ) : (
                          <ImageIcon size={32} color="#8E8E93" />
                        )}
                      </View>
                    )}
                    {element.type === 'audio' && (
                      <View style={[styles.mediaPlaceholder, {justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8}]}>
                        <Music size={24} color="#f97315" />
                        <Text style={{color: '#FFFFFF', fontSize: 14}}>{element.text}</Text>
                      </View>
                    )}
                    {element.type === 'video' && (
                      <View style={[styles.mediaPlaceholder, {justifyContent: 'center', alignItems: 'center'}]}>
                        {element.videoUri ? (
                          <Text style={{color: '#FFFFFF', fontSize: 12, textAlign: 'center'}}>Video: {element.videoUri.substring(0, 20)}...</Text>
                        ) : (
                          <Video size={32} color="#8E8E93" />
                        )}
                      </View>
                    )}
                    {element.type === 'container' && (
                      <View style={styles.containerPlaceholder}>
                        <Layout size={24} color="#8E8E93" />
                      </View>
                    )}
                    </DraggableElement>

                    {isSelected && (
                      <View style={styles.arrowControls}>
                        <TouchableOpacity
                          style={[styles.arrowButton, styles.arrowUp]}
                          onPressIn={() => startContinuousMove(element.id, 0, -1)}
                          onPressOut={stopContinuousMove}
                        >
                          <ArrowUp size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.arrowButton, styles.arrowDown]}
                          onPressIn={() => startContinuousMove(element.id, 0, 1)}
                          onPressOut={stopContinuousMove}
                        >
                          <ArrowDown size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.arrowButton, styles.arrowLeft]}
                          onPressIn={() => startContinuousMove(element.id, -1, 0)}
                          onPressOut={stopContinuousMove}
                        >
                          <ArrowLeft size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.arrowButton, styles.arrowRight]}
                          onPressIn={() => startContinuousMove(element.id, 1, 0)}
                          onPressOut={stopContinuousMove}
                        >
                          <ArrowRight size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.cornerIndicators}>
                          <ResizeHandle
                            corner="nw"
                            element={element}
                            onResize={(newProps) => {
                              updateElementProperties(element.id, {
                                width: newProps.width,
                                height: newProps.height,
                                x: newProps.x,
                                y: newProps.y,
                              });
                            }}
                            screenType={screenType}
                            screenSizes={screenSizes}
                            snapToGridValue={snapToGridValue}
                          />
                          <ResizeHandle
                            corner="ne"
                            element={element}
                            onResize={(newProps) => {
                              updateElementProperties(element.id, {
                                width: newProps.width,
                                height: newProps.height,
                                y: newProps.y,
                              });
                            }}
                            screenType={screenType}
                            screenSizes={screenSizes}
                            snapToGridValue={snapToGridValue}
                          />
                          <ResizeHandle
                            corner="sw"
                            element={element}
                            onResize={(newProps) => {
                              updateElementProperties(element.id, {
                                width: newProps.width,
                                height: newProps.height,
                                x: newProps.x,
                              });
                            }}
                            screenType={screenType}
                            screenSizes={screenSizes}
                            snapToGridValue={snapToGridValue}
                          />
                          <ResizeHandle
                            corner="se"
                            element={element}
                            onResize={(newProps) => {
                              updateElementProperties(element.id, {
                                width: newProps.width,
                                height: newProps.height,
                              });
                            }}
                            screenType={screenType}
                            screenSizes={screenSizes}
                            snapToGridValue={snapToGridValue}
                          />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </TouchableOpacity>

          {canvasElements.length > 0 && (
            <View style={styles.canvasInfo}>
              <Text style={styles.canvasInfoText}>
                {canvasElements.length} element{canvasElements.length !== 1 ? 's' : ''}
                {selectedElement && ' • Use arrows for pixel-perfect movement'}
              </Text>
            </View>
          )}
        </View>

        {selectedElement && selectedElementData && (
          <View style={styles.propertiesPanel}>
            <Text style={styles.propertiesTitle}>
              {selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)} Actions
            </Text>
            <View style={styles.propertiesActions}>
              {(selectedElementData.type === 'text' || selectedElementData.type === 'button') && (
                <TouchableOpacity
                  style={styles.propertyButton}
                  onPress={startEditText}
                >
                  <Edit3 size={18} color="#f97315" />
                  <Text style={styles.propertyButtonText}>Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.propertyButton}
                onPress={() => setShowPropertiesModal(true)}
              >
                <Settings size={18} color="#007AFF" />
                <Text style={styles.propertyButtonText}>Style</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.propertyButton}
                onPress={() => duplicateElement(selectedElement)}
              >
                <Copy size={18} color="#34C759" />
                <Text style={styles.propertyButtonText}>Duplicate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.propertyButton, styles.propertyButtonDanger]}
                onPress={() => deleteElement(selectedElement)}
              >
                <Trash2 size={18} color="#FF453A" />
                <Text style={styles.propertyButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.layerControls}>
              <Text style={styles.moveControlsTitle}>Layer Order</Text>
              <View style={styles.layerButtonsRow}>
                <TouchableOpacity
                  style={styles.layerButton}
                  onPress={() => {
                    const maxZ = Math.max(0, ...canvasElements.map(el => el.zIndex || 0));
                    updateElementProperty(selectedElement, 'zIndex', maxZ + 1);
                  }}
                >
                  <Layers size={18} color="#FFFFFF" />
                  <Text style={styles.layerButtonText}>Bring to Front</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.layerButton}
                  onPress={() => moveElementUp(selectedElement)}
                >
                  <ChevronUp size={18} color="#FFFFFF" />
                  <Text style={styles.layerButtonText}>Forward</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.layerButton}
                  onPress={() => moveElementDown(selectedElement)}
                >
                  <ChevronDown size={18} color="#FFFFFF" />
                  <Text style={styles.layerButtonText}>Backward</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.layerButton}
                  onPress={() => {
                    updateElementProperty(selectedElement, 'zIndex', 0);
                  }}
                >
                  <Layers size={18} color="#FFFFFF" />
                  <Text style={styles.layerButtonText}>Send to Back</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.moveControls}>
              <Text style={styles.moveControlsTitle}>Precise Movement</Text>
              <View style={styles.moveButtonsGrid}>
                <View style={styles.moveButtonRow}>
                  <View style={styles.moveButtonSpacer} />
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => moveElement(selectedElement, 0, -10)}
                  >
                    <ChevronUp size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.moveButtonSpacer} />
                </View>
                <View style={styles.moveButtonRow}>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => moveElement(selectedElement, -10, 0)}
                  >
                    <ChevronLeft size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.moveButtonCenter}>
                    <Text style={styles.moveButtonCenterText}>10px</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => moveElement(selectedElement, 10, 0)}
                  >
                    <ChevronRight size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.moveButtonRow}>
                  <View style={styles.moveButtonSpacer} />
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => moveElement(selectedElement, 0, 10)}
                  >
                    <ChevronDown size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.moveButtonSpacer} />
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedBackground && (
          <View style={styles.propertiesPanel}>
            <Text style={styles.propertiesTitle}>Canvas Background</Text>
            <View style={styles.propertiesActions}>
              <TouchableOpacity
                style={styles.propertyButton}
                onPress={() => setShowPropertiesModal(true)}
              >
                <Palette size={18} color="#007AFF" />
                <Text style={styles.propertyButtonText}>Style</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showSaveModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save Project</Text>
            <TouchableOpacity onPress={() => setShowSaveModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Project name"
              placeholderTextColor="#8E8E93"
              autoFocus
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveProject}>
              <Text style={styles.saveButtonText}>Save Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditTextModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditTextModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Text</Text>
            <TouchableOpacity onPress={() => setShowEditTextModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              value={editingText}
              onChangeText={setEditingText}
              placeholder="Enter text"
              placeholderTextColor="#8E8E93"
              multiline
              autoFocus
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveEditedText}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLayersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLayersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Layers</Text>
            <TouchableOpacity onPress={() => setShowLayersModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {[...canvasElements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)).map((element, index) => (
              <View key={element.id} style={styles.layerItem}>
                <View style={styles.layerInfo}>
                  {element.type === 'text' && <Type size={20} color="#f97315" />}
                  {element.type === 'button' && <Palette size={20} color="#f97315" />}
                  {element.type === 'image' && <ImageIcon size={20} color="#f97315" />}
                  {element.type === 'audio' && <Music size={20} color="#f97315" />}
                  {element.type === 'video' && <Video size={20} color="#f97315" />}
                  {element.type === 'container' && <Layout size={20} color="#f97315" />}
                  <View style={styles.layerTextInfo}>
                    <Text style={styles.layerName}>
                      {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                    </Text>
                    {(element.type === 'text' || element.type === 'button') && (
                      <Text style={styles.layerSubtext} numberOfLines={1}>
                        {element.text}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.layerActions}>
                  <TouchableOpacity
                    style={styles.layerButton}
                    onPress={() => moveElementUp(element.id)}
                    disabled={index === 0}
                  >
                    <ChevronUp size={18} color={index === 0 ? '#38383A' : '#FFFFFF'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.layerButton}
                    onPress={() => moveElementDown(element.id)}
                    disabled={index === canvasElements.length - 1}
                  >
                    <ChevronDown size={18} color={index === canvasElements.length - 1 ? '#38383A' : '#FFFFFF'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.layerButton}
                    onPress={() => {
                      setSelectedElement(element.id);
                      setShowLayersModal(false);
                    }}
                  >
                    <Move size={18} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showPresetsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPresetsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Design Presets</Text>
            <TouchableOpacity onPress={() => setShowPresetsModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.presetSectionTitle}>Buttons</Text>
            {presetDesigns.filter(p => p.type === 'button').map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetItem}
                onPress={() => addPresetElement(preset)}
              >
                <View
                  style={[
                    styles.presetPreview,
                    {
                      backgroundColor: preset.template.backgroundColor || '#F5F5F5',
                      borderRadius: preset.template.borderRadius || 8,
                      borderWidth: preset.template.borderWidth || 0,
                      borderColor: preset.template.borderColor || 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetPreviewText,
                      {
                        fontSize: preset.template.fontSize,
                        color: preset.template.textColor || '#FFFFFF',
                      },
                    ]}
                  >
                    {preset.template.text}
                  </Text>
                </View>
                <Text style={styles.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.presetSectionTitle}>Text</Text>
            {presetDesigns.filter(p => p.type === 'text').map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetItem}
                onPress={() => addPresetElement(preset)}
              >
                <View style={styles.presetPreview}>
                  <Text
                    style={[
                      styles.presetPreviewText,
                      {
                        fontSize: preset.template.fontSize,
                        color: preset.template.textColor || '#000000',
                      },
                    ]}
                  >
                    {preset.template.text}
                  </Text>
                </View>
                <Text style={styles.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.presetSectionTitle}>Images</Text>
            {presetDesigns.filter(p => p.type === 'image').map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetItem}
                onPress={() => addPresetElement(preset)}
              >
                <View
                  style={[
                    styles.presetPreview,
                    {
                      backgroundColor: preset.template.backgroundColor,
                      borderRadius: preset.template.borderRadius,
                      width: 100,
                      height: 80,
                    },
                  ]}
                >
                  <ImageIcon size={24} color="#8E8E93" />
                </View>
                <Text style={styles.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.presetSectionTitle}>Containers</Text>
            {presetDesigns.filter(p => p.type === 'container').map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={styles.presetItem}
                onPress={() => addPresetElement(preset)}
              >
                <View
                  style={[
                    styles.presetPreview,
                    {
                      backgroundColor: preset.template.backgroundColor,
                      borderRadius: preset.template.borderRadius,
                      width: 100,
                      height: 60,
                      borderWidth: preset.template.borderWidth || 0,
                      borderColor: preset.template.borderColor || 'transparent',
                    },
                  ]}
                >
                  <Layout size={24} color="#8E8E93" />
                </View>
                <Text style={styles.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showPropertiesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPropertiesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Element Properties</Text>
            <TouchableOpacity onPress={() => setShowPropertiesModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedElementData && (
              <>
                {(selectedElementData.type === 'button' || selectedElementData.type === 'container') && (
                  <>
                    <Text style={styles.propertySectionTitle}>Background Color</Text>
                    <View style={styles.colorGrid}>
                      {COLORS.map(color => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: color },
                            selectedElementData.backgroundColor === color && styles.colorSwatchSelected,
                          ]}
                          onPress={() => updateElementProperty(selectedElement!, 'backgroundColor', color)}
                        />
                      ))}
                    </View>
                  </>
                )}

                {(selectedElementData.type === 'text' || selectedElementData.type === 'button') && (
                  <>
                    <Text style={styles.propertySectionTitle}>Text Color</Text>
                    <View style={styles.colorGrid}>
                      {COLORS.map(color => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: color },
                            selectedElementData.textColor === color && styles.colorSwatchSelected,
                          ]}
                          onPress={() => updateElementProperty(selectedElement!, 'textColor', color)}
                        />
                      ))}
                    </View>

                    <Text style={styles.propertySectionTitle}>Font Size</Text>
                    <View style={styles.radiusOptions}>
                      {[12, 14, 16, 18, 20, 24, 28, 32, 36].map(size => (
                        <TouchableOpacity
                          key={size}
                          style={[
                            styles.radiusButton,
                            selectedElementData.fontSize === size && styles.radiusButtonActive,
                          ]}
                          onPress={() => updateElementProperty(selectedElement!, 'fontSize', size)}
                        >
                          <Text
                            style={[
                              styles.radiusButtonText,
                              selectedElementData.fontSize === size && styles.radiusButtonTextActive,
                            ]}
                          >
                            {size}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {selectedElementData.type === 'image' && (
                  <>
                    <Text style={styles.propertySectionTitle}>Image</Text>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                      <Upload size={20} color="#f97315" />
                      <Text style={styles.uploadButtonText}>
                        {selectedElementData.imageUri ? 'Change Image' : 'Upload Image'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <Text style={styles.propertySectionTitle}>Border Radius</Text>
                <View style={styles.radiusOptions}>
                  {[0, 8, 12, 16, 24, 50].map(radius => (
                    <TouchableOpacity
                      key={radius}
                      style={[
                        styles.radiusButton,
                        selectedElementData.borderRadius === radius && styles.radiusButtonActive,
                      ]}
                      onPress={() => updateElementProperty(selectedElement!, 'borderRadius', radius)}
                    >
                      <Text
                        style={[
                          styles.radiusButtonText,
                          selectedElementData.borderRadius === radius && styles.radiusButtonTextActive,
                        ]}
                      >
                        {radius}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.propertySectionTitle}>Size</Text>
                <View style={styles.sizeControls}>
                  <View style={styles.sizeControl}>
                    <Text style={styles.sizeLabel}>Width</Text>
                    <View style={styles.sizeButtons}>
                      <TouchableOpacity
                        style={styles.sizeButton}
                        onPress={() => updateElementProperty(selectedElement!, 'width', Math.max(50, selectedElementData.width - 10))}
                      >
                        <Text style={styles.sizeButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.sizeValue}>{selectedElementData.width}</Text>
                      <TouchableOpacity
                        style={styles.sizeButton}
                        onPress={() => updateElementProperty(selectedElement!, 'width', Math.min(screenSizes[screenType].width, selectedElementData.width + 10))}
                      >
                        <Text style={styles.sizeButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.sizeControl}>
                    <Text style={styles.sizeLabel}>Height</Text>
                    <View style={styles.sizeButtons}>
                      <TouchableOpacity
                        style={styles.sizeButton}
                        onPress={() => updateElementProperty(selectedElement!, 'height', Math.max(20, selectedElementData.height - 10))}
                      >
                        <Text style={styles.sizeButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.sizeValue}>{selectedElementData.height}</Text>
                      <TouchableOpacity
                        style={styles.sizeButton}
                        onPress={() => updateElementProperty(selectedElement!, 'height', Math.min(screenSizes[screenType].height, selectedElementData.height + 10))}
                      >
                        <Text style={styles.sizeButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <Text style={styles.propertySectionTitle}>Opacity</Text>
                <View style={styles.radiusOptions}>
                  {[0.1, 0.25, 0.5, 0.75, 1].map(op => (
                    <TouchableOpacity
                      key={op}
                      style={[
                        styles.radiusButton,
                        (selectedElementData.opacity || 1) === op && styles.radiusButtonActive,
                      ]}
                      onPress={() => updateElementProperty(selectedElement!, 'opacity', op)}
                    >
                      <Text
                        style={[
                          styles.radiusButtonText,
                          (selectedElementData.opacity || 1) === op && styles.radiusButtonTextActive,
                        ]}
                      >
                        {Math.round(op * 100)}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.propertySectionTitle}>Border</Text>
                <View style={styles.radiusOptions}>
                  {[0, 1, 2, 3, 4, 6].map(width => (
                    <TouchableOpacity
                      key={width}
                      style={[
                        styles.radiusButton,
                        (selectedElementData.borderWidth || 0) === width && styles.radiusButtonActive,
                      ]}
                      onPress={() => updateElementProperty(selectedElement!, 'borderWidth', width)}
                    >
                      <Text
                        style={[
                          styles.radiusButtonText,
                          (selectedElementData.borderWidth || 0) === width && styles.radiusButtonTextActive,
                        ]}
                      >
                        {width}px
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(selectedElementData.borderWidth || 0) > 0 && (
                  <>
                    <Text style={styles.propertySectionTitle}>Border Color</Text>
                    <View style={styles.colorGrid}>
                      {COLORS.map(color => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorSwatch,
                            { backgroundColor: color },
                            selectedElementData.borderColor === color && styles.colorSwatchSelected,
                          ]}
                          onPress={() => updateElementProperty(selectedElement!, 'borderColor', color)}
                        />
                      ))}
                    </View>
                  </>
                )}

                {(selectedElementData.type === 'text' || selectedElementData.type === 'button') && (
                  <>
                    <Text style={styles.propertySectionTitle}>Text Alignment</Text>
                    <View style={styles.radiusOptions}>
                      <TouchableOpacity
                        style={[
                          styles.radiusButton,
                          (selectedElementData.textAlign || 'center') === 'left' && styles.radiusButtonActive,
                        ]}
                        onPress={() => updateElementProperty(selectedElement!, 'textAlign', 'left')}
                      >
                        <AlignLeft size={18} color={(selectedElementData.textAlign || 'center') === 'left' ? '#FFFFFF' : '#8E8E93'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.radiusButton,
                          (selectedElementData.textAlign || 'center') === 'center' && styles.radiusButtonActive,
                        ]}
                        onPress={() => updateElementProperty(selectedElement!, 'textAlign', 'center')}
                      >
                        <AlignCenter size={18} color={(selectedElementData.textAlign || 'center') === 'center' ? '#FFFFFF' : '#8E8E93'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.radiusButton,
                          (selectedElementData.textAlign || 'center') === 'right' && styles.radiusButtonActive,
                        ]}
                        onPress={() => updateElementProperty(selectedElement!, 'textAlign', 'right')}
                      >
                        <AlignRight size={18} color={(selectedElementData.textAlign || 'center') === 'right' ? '#FFFFFF' : '#8E8E93'} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            )}

            {selectedBackground && (
              <>
                <Text style={styles.propertySectionTitle}>Background Color</Text>
                <View style={styles.colorGrid}>
                  {COLORS.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        backgroundStyle.color === color && !backgroundStyle.gradient && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setBackgroundStyle({color, opacity: backgroundStyle.opacity})}
                    />
                  ))}
                </View>

                <Text style={styles.propertySectionTitle}>Gradient Presets</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                  <View style={{flexDirection: 'row', gap: 12}}>
                    {GRADIENT_PRESETS.map((preset, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setBackgroundStyle({gradient: preset.colors, opacity: backgroundStyle.opacity})}
                        style={{alignItems: 'center'}}
                      >
                        <LinearGradient
                          colors={preset.colors}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[
                            styles.colorSwatch,
                            {width: 60, height: 60},
                            backgroundStyle.gradient &&
                            JSON.stringify(backgroundStyle.gradient) === JSON.stringify(preset.colors) &&
                            styles.colorSwatchSelected,
                          ]}
                        />
                        <Text style={{color: '#FFFFFF', fontSize: 11, marginTop: 4}}>{preset.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.propertySectionTitle}>Background Opacity</Text>
                <View style={styles.radiusOptions}>
                  {[0.1, 0.25, 0.5, 0.75, 1].map(op => (
                    <TouchableOpacity
                      key={op}
                      style={[
                        styles.radiusButton,
                        backgroundStyle.opacity === op && styles.radiusButtonActive,
                      ]}
                      onPress={() => setBackgroundStyle({...backgroundStyle, opacity: op})}
                    >
                      <Text
                        style={[
                          styles.radiusButtonText,
                          backgroundStyle.opacity === op && styles.radiusButtonTextActive,
                        ]}
                      >
                        {Math.round(op * 100)}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </Modal>

      <UpgradeModalIAP
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={"free" as any}
        onUpgradeSuccess={async () => {
          {}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  headerButtonDisabled: {
    opacity: 0.3,
  },
  headerButtonActive: {
    backgroundColor: '#f97315',
  },
  toolbar: {
    backgroundColor: '#1C1C1E',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#38383A',
    paddingVertical: 12,
  },
  toolbarContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    minWidth: 70,
  },
  toolButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  toolbarDivider: {
    width: 1,
    backgroundColor: '#38383A',
    marginHorizontal: 8,
  },
  screenSizeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  screenTypeButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  gridToggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  sizeButtonActive: {
    borderColor: '#f97315',
    backgroundColor: '#2C2C2E',
  },
  sizeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sizeButtonTextActive: {
    color: '#f97315',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  canvasContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  canvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  canvasSelected: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
    height: 0.5,
    backgroundColor: '#E5E5E5',
  },
  gridLineVertical: {
    position: 'absolute',
    width: 0.5,
    backgroundColor: '#E5E5E5',
  },
  emptyCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCanvasText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 12,
  },
  canvasElement: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  elementText: {
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  containerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  arrowControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  arrowButton: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97315',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  arrowUp: {
    top: -40,
    left: '50%',
    marginLeft: -16,
  },
  arrowDown: {
    bottom: -40,
    left: '50%',
    marginLeft: -16,
  },
  arrowLeft: {
    left: -40,
    top: '50%',
    marginTop: -16,
  },
  arrowRight: {
    right: -40,
    top: '50%',
    marginTop: -16,
  },
  cornerIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cornerDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#f97315',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cornerTopLeft: {
    top: -10,
    left: -10,
  },
  cornerTopRight: {
    top: -10,
    right: -10,
  },
  cornerBottomLeft: {
    bottom: -10,
    left: -10,
  },
  cornerBottomRight: {
    bottom: -10,
    right: -10,
  },
  canvasInfo: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
  },
  canvasInfoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  propertiesPanel: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  propertiesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  propertiesActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  propertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    gap: 6,
  },
  propertyButtonDanger: {
    backgroundColor: '#2C2C2E',
  },
  propertyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moveControls: {
    marginTop: 16,
  },
  moveControlsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  moveButtonsGrid: {
    alignItems: 'center',
  },
  moveButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moveButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97315',
    borderRadius: 24,
  },
  moveButtonSpacer: {
    width: 48,
    height: 48,
  },
  moveButtonCenter: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 24,
  },
  moveButtonCenterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  layerControls: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#38383A',
  },
  layerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  layerButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    gap: 6,
  },
  layerButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  textInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#f97315',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  layerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  layerTextInfo: {
    flex: 1,
  },
  layerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  layerSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
  },
  layerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  layerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
  },
  presetSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  presetPreview: {
    width: 120,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetPreviewText: {
    fontWeight: '600',
  },
  presetName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  propertySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#38383A',
  },
  colorSwatchSelected: {
    borderColor: '#f97315',
    borderWidth: 3,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f97315',
  },
  radiusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#38383A',
  },
  radiusButtonActive: {
    borderColor: '#f97315',
    backgroundColor: '#2C2C2E',
  },
  radiusButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  radiusButtonTextActive: {
    color: '#f97315',
  },
  sizeControls: {
    gap: 16,
  },
  sizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 12,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  sizeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sizeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f97315',
    minWidth: 40,
    textAlign: 'center',
  },
});
