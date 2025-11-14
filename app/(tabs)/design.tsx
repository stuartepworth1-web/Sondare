import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Layout,
  Smartphone,
  Palette,
  Layers,
  Plus,
  Trash2,
  Copy,
  Move,
} from 'lucide-react-native';
import { CreditsBar } from '@/components/CreditsBar';
import { useCredits } from '@/contexts/CreditsContext';
import { UpgradeModalIAP } from '@/components/UpgradeModalIAP';

interface CanvasElement {
  id: string;
  type: 'text' | 'button' | 'image' | 'container';
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  text?: string;
  fontSize?: number;
}

export default function DesignScreen() {
  const { credits, creditsUsed, currentTier, refreshSubscriptionStatus } = useCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [screenType, setScreenType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const screenSizes = {
    mobile: { width: 320, height: 568, label: 'Mobile (375x812)' },
    tablet: { width: 400, height: 600, label: 'Tablet (768x1024)' },
    desktop: { width: 500, height: 400, label: 'Desktop (1920x1080)' },
  };

  const addElement = (type: 'text' | 'button' | 'image' | 'container') => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 100,
      width: type === 'button' ? 120 : type === 'text' ? 150 : 200,
      height: type === 'button' ? 40 : type === 'text' ? 30 : 150,
      backgroundColor: type === 'button' ? '#FF9500' : type === 'container' ? '#1C1C1E' : 'transparent',
      text: type === 'text' ? 'Text Label' : type === 'button' ? 'Button' : undefined,
      fontSize: type === 'text' ? 16 : type === 'button' ? 14 : undefined,
    };
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const deleteElement = (id: string) => {
    setCanvasElements(canvasElements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const duplicateElement = (id: string) => {
    const element = canvasElements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now().toString(),
        x: element.x + 20,
        y: element.y + 20,
      };
      setCanvasElements([...canvasElements, newElement]);
    }
  };

  const exportDesign = () => {
    Alert.alert(
      'Export Design',
      'Your design will be exported as:\n\n• React Native code\n• Figma file\n• PNG/SVG assets\n\nChoose your format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'React Native', onPress: () => Alert.alert('Exported!', 'React Native code copied to clipboard') },
        { text: 'Figma', onPress: () => Alert.alert('Exported!', 'Design exported to Figma') },
      ]
    );
  };

  const renderCanvasElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id;

    return (
      <TouchableOpacity
        key={element.id}
        style={[
          styles.canvasElement,
          {
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            backgroundColor: element.backgroundColor,
            borderWidth: isSelected ? 2 : 0,
            borderColor: '#FF9500',
          },
        ]}
        onPress={() => setSelectedElement(element.id)}
      >
        {element.type === 'text' && (
          <Text style={[styles.elementText, { fontSize: element.fontSize }]}>
            {element.text}
          </Text>
        )}
        {element.type === 'button' && (
          <Text style={[styles.buttonText, { fontSize: element.fontSize }]}>
            {element.text}
          </Text>
        )}
        {element.type === 'image' && (
          <View style={styles.imagePlaceholder}>
            <ImageIcon size={32} color="#8E8E93" />
          </View>
        )}
        {element.type === 'container' && (
          <View style={styles.containerPlaceholder}>
            <Layout size={24} color="#8E8E93" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CreditsBar
        credits={credits}
        creditsUsed={creditsUsed}
        onUpgrade={() => setShowUpgradeModal(true)}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>App Designer</Text>
        <Text style={styles.headerSubtitle}>Drag, drop, and design your app</Text>
      </View>

      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.toolbarContent}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('text')}
            >
              <Type size={20} color="#FF9500" />
              <Text style={styles.toolButtonText}>Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('button')}
            >
              <Square size={20} color="#FF9500" />
              <Text style={styles.toolButtonText}>Button</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('image')}
            >
              <ImageIcon size={20} color="#FF9500" />
              <Text style={styles.toolButtonText}>Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => addElement('container')}
            >
              <Layout size={20} color="#FF9500" />
              <Text style={styles.toolButtonText}>Container</Text>
            </TouchableOpacity>

            <View style={styles.toolbarDivider} />

            <TouchableOpacity
              style={styles.toolButton}
              onPress={exportDesign}
            >
              <Layers size={20} color="#30D158" />
              <Text style={styles.toolButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <View style={styles.screenSizeSelector}>
        {(['mobile', 'tablet', 'desktop'] as const).map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              screenType === size && styles.sizeButtonActive,
            ]}
            onPress={() => setScreenType(size)}
          >
            <Smartphone size={16} color={screenType === size ? '#FF9500' : '#8E8E93'} />
            <Text
              style={[
                styles.sizeButtonText,
                screenType === size && styles.sizeButtonTextActive,
              ]}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.canvasContainer}>
          <View
            style={[
              styles.canvas,
              {
                width: screenSizes[screenType].width,
                height: screenSizes[screenType].height,
              },
            ]}
          >
            {canvasElements.length === 0 ? (
              <View style={styles.emptyCanvas}>
                <Plus size={48} color="#38383A" />
                <Text style={styles.emptyCanvasText}>
                  Tap tools above to add elements
                </Text>
              </View>
            ) : (
              canvasElements.map(renderCanvasElement)
            )}
          </View>

          {canvasElements.length > 0 && (
            <View style={styles.canvasInfo}>
              <Text style={styles.canvasInfoText}>
                {screenSizes[screenType].label} • {canvasElements.length} elements
              </Text>
            </View>
          )}
        </View>

        {selectedElement && (
          <View style={styles.propertiesPanel}>
            <Text style={styles.propertiesTitle}>Element Actions</Text>
            <View style={styles.propertiesActions}>
              <TouchableOpacity
                style={styles.propertyButton}
                onPress={() => duplicateElement(selectedElement)}
              >
                <Copy size={18} color="#FF9500" />
                <Text style={styles.propertyButtonText}>Duplicate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.propertyButton}
                onPress={() => Alert.alert('Move', 'Drag functionality will be available in the native app')}
              >
                <Move size={18} color="#007AFF" />
                <Text style={styles.propertyButtonText}>Move</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.propertyButton, styles.propertyButtonDanger]}
                onPress={() => deleteElement(selectedElement)}
              >
                <Trash2 size={18} color="#FF453A" />
                <Text style={styles.propertyButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <UpgradeModalIAP
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier}
        onUpgradeSuccess={async () => {
          await refreshSubscriptionStatus();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38383A',
    gap: 6,
  },
  sizeButtonActive: {
    borderColor: '#FF9500',
    backgroundColor: '#2C2C2E',
  },
  sizeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sizeButtonTextActive: {
    color: '#FF9500',
  },
  content: {
    flex: 1,
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
    borderRadius: 8,
  },
  elementText: {
    color: '#000000',
    fontWeight: '500',
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  containerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    borderRadius: 8,
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
    gap: 8,
  },
  propertyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
  bottomSpacer: {
    height: 32,
  },
});
