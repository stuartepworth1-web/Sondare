import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Palette, Layers, Type, LayoutGrid as Layout, Eye, Download } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DesignElement {
  id: string;
  type: 'button' | 'card' | 'header' | 'input';
  title: string;
  description: string;
  colors: string[];
}

export default function DesignScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Components');

  const categories = [
    { name: 'Components', icon: Layers },
    { name: 'Colors', icon: Palette },
    { name: 'Typography', icon: Type },
    { name: 'Layouts', icon: Layout },
  ];

  const designElements: DesignElement[] = [
    {
      id: '1',
      type: 'button',
      title: 'Primary Button',
      description: 'Modern gradient button with hover effects',
      colors: ['#7c3aed', '#3b82f6'],
    },
    {
      id: '2',
      type: 'card',
      title: 'Feature Card',
      description: 'Elegant card design with shadow and rounded corners',
      colors: ['#ffffff', '#f8fafc'],
    },
    {
      id: '3',
      type: 'header',
      title: 'App Header',
      description: 'Clean header with gradient background',
      colors: ['#1e3a8a', '#7c3aed'],
    },
    {
      id: '4',
      type: 'input',
      title: 'Text Input',
      description: 'Modern input field with focus states',
      colors: ['#ffffff', '#e2e8f0'],
    },
  ];

  const colorPalettes = [
    {
      name: 'Ocean Blue',
      colors: ['#000000', '#1C1C1E', '#2C2C2E', '#38383A', '#48484A'],
    },
    {
      name: 'Purple Dreams',
      colors: ['#FF9500', '#FF9F0A', '#FFAB14', '#FFB71E', '#FFC328'],
    },
    {
      name: 'Forest Green',
      colors: ['#30D158', '#FF453A', '#007AFF', '#5856D6', '#AF52DE'],
    },
    {
      name: 'Sunset Orange',
      colors: ['#8E8E93', '#AEAEB2', '#C7C7CC', '#D1D1D6', '#E5E5EA'],
    },
  ];

  const renderComponentPreview = (element: DesignElement) => {
    switch (element.type) {
      case 'button':
        return (
          <View style={[styles.previewButton, { backgroundColor: element.colors[0] }]}>
            <Text style={styles.previewButtonText}>Click Me</Text>
          </View>
        );
      case 'card':
        return (
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader} />
            <View style={styles.previewCardContent}>
              <View style={styles.previewCardLine} />
              <View style={styles.previewCardLineShort} />
            </View>
          </View>
        );
      case 'header':
        return (
          <View style={[styles.previewHeader, { backgroundColor: element.colors[0] }]}>
            <View style={styles.previewHeaderContent}>
              <View style={styles.previewHeaderIcon} />
              <View style={styles.previewHeaderText} />
            </View>
          </View>
        );
      case 'input':
        return (
          <View style={styles.previewInput}>
            <View style={styles.previewInputText} />
          </View>
        );
      default:
        return <View style={styles.previewDefault} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Design System</Text>
          <Text style={styles.headerSubtitle}>
            Beautiful components and design patterns
          </Text>
        </View>
      </View>

      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsList}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              
              return (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.tab,
                    isSelected && styles.tabSelected
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <IconComponent 
                    size={20} 
                    color={isSelected ? '#FF9500' : '#8E8E93'} 
                  />
                  <Text style={[
                    styles.tabText,
                    isSelected && styles.tabTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedCategory === 'Components' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UI Components</Text>
            {designElements.map((element) => (
              <View key={element.id} style={styles.componentCard}>
                <View style={styles.componentPreview}>
                  {renderComponentPreview(element)}
                </View>
                
                <View style={styles.componentInfo}>
                  <Text style={styles.componentTitle}>{element.title}</Text>
                  <Text style={styles.componentDescription}>
                    {element.description}
                  </Text>
                  
                  <View style={styles.componentActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Eye size={16} color="#FF9500" />
                      <Text style={styles.actionButtonText}>Preview</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                      <Download size={16} color="#30D158" />
                      <Text style={styles.actionButtonText}>Use</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedCategory === 'Colors' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Palettes</Text>
            {colorPalettes.map((palette, index) => (
              <View key={index} style={styles.paletteCard}>
                <Text style={styles.paletteName}>{palette.name}</Text>
                <View style={styles.paletteColors}>
                  {palette.colors.map((color, colorIndex) => (
                    <View
                      key={colorIndex}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color }
                      ]}
                    />
                  ))}
                </View>
                <TouchableOpacity style={styles.usePaletteButton}>
                  <Text style={styles.usePaletteButtonText}>Use Palette</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {selectedCategory === 'Typography' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Typography Scale</Text>
            <View style={styles.typographyCard}>
              <Text style={styles.typographyHeading1}>Heading 1</Text>
              <Text style={styles.typographyHeading2}>Heading 2</Text>
              <Text style={styles.typographyHeading3}>Heading 3</Text>
              <Text style={styles.typographyBody}>Body Text</Text>
              <Text style={styles.typographyCaption}>Caption</Text>
            </View>
          </View>
        )}

        {selectedCategory === 'Layouts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Layout Templates</Text>
            <View style={styles.layoutCard}>
              <Text style={styles.layoutTitle}>Grid Layout</Text>
              <View style={styles.layoutPreview}>
                <View style={styles.layoutGrid}>
                  <View style={styles.layoutGridItem} />
                  <View style={styles.layoutGridItem} />
                  <View style={styles.layoutGridItem} />
                  <View style={styles.layoutGridItem} />
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  categoryTabs: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  tabsList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    marginRight: 12,
  },
  tabSelected: {
    backgroundColor: '#38383A',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.24,
    marginLeft: 8,
  },
  tabTextSelected: {
    color: '#FF9500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
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
  componentCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  componentPreview: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    marginBottom: 16,
  },
  previewButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  previewButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.41,
  },
  previewCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 16,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewCardHeader: {
    height: 8,
    backgroundColor: '#FF9500',
    borderRadius: 4,
    marginBottom: 12,
  },
  previewCardContent: {
    gap: 8,
  },
  previewCardLine: {
    height: 4,
    backgroundColor: '#38383A',
    borderRadius: 2,
  },
  previewCardLineShort: {
    height: 4,
    backgroundColor: '#38383A',
    borderRadius: 2,
    width: '60%',
  },
  previewHeader: {
    width: 160,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  previewHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewHeaderIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    marginRight: 8,
  },
  previewHeaderText: {
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    flex: 1,
  },
  previewInput: {
    width: 140,
    height: 40,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38383A',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  previewInputText: {
    height: 4,
    backgroundColor: '#8E8E93',
    borderRadius: 2,
    width: '80%',
  },
  previewDefault: {
    width: 80,
    height: 60,
    backgroundColor: '#38383A',
    borderRadius: 8,
  },
  componentInfo: {
    alignItems: 'center',
  },
  componentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.38,
    marginBottom: 4,
  },
  componentDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.24,
    textAlign: 'center',
    marginBottom: 16,
  },
  componentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.08,
    marginLeft: 4,
  },
  paletteCard: {
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
  paletteName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.38,
    marginBottom: 16,
  },
  paletteColors: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#38383A',
  },
  usePaletteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FF9500',
    borderRadius: 8,
  },
  usePaletteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.24,
  },
  typographyCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  typographyHeading1: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.37,
    marginBottom: 16,
  },
  typographyHeading2: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.35,
    marginBottom: 12,
  },
  typographyHeading3: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.38,
    marginBottom: 12,
  },
  typographyBody: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.41,
    lineHeight: 22,
    marginBottom: 8,
  },
  typographyCaption: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'System',
    letterSpacing: -0.08,
  },
  layoutCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  layoutTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
    letterSpacing: 0.38,
    marginBottom: 16,
  },
  layoutPreview: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 16,
  },
  layoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  layoutGridItem: {
    width: (width - 120) / 2 - 4,
    height: 60,
    backgroundColor: '#38383A',
    borderRadius: 8,
  },
});