import { Type, Square, Image, Edit, Layout, List, CreditCard, Tag } from 'lucide-react';

export interface ComponentDefinition {
  type: string;
  name: string;
  icon: any;
  defaultProps: Record<string, any>;
  defaultStyles: Record<string, any>;
  defaultWidth: number;
  defaultHeight: number;
}

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    type: 'text',
    name: 'Text',
    icon: Type,
    defaultProps: {
      text: 'Sample Text',
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: 'normal',
      fontFamily: 'System',
      textAlign: 'left',
      textDecoration: 'none',
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: 'none',
      opacity: 1,
      backgroundColor: 'transparent',
      gradientColors: null,
      gradientDirection: 'vertical',
      paddingHorizontal: 0,
      paddingVertical: 0,
      shadowColor: '#000000',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      rotation: 0,
      animation: 'none',
      animationDuration: 300,
    },
    defaultStyles: {},
    defaultWidth: 200,
    defaultHeight: 40,
  },
  {
    type: 'button',
    name: 'Button',
    icon: Square,
    defaultProps: {
      text: 'Button',
      backgroundColor: '#FF9500',
      textColor: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'System',
      fontWeight: '600',
      borderRadius: 8,
      opacity: 1,
      borderWidth: 0,
      borderColor: '#FF9500',
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000000',
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      rotation: 0,
      gradientColors: null,
      gradientDirection: 'vertical',
      animation: 'none',
      animationDuration: 300,
      action: 'none',
      navigationTarget: '',
      externalUrl: '',
    },
    defaultStyles: {},
    defaultWidth: 150,
    defaultHeight: 44,
  },
  {
    type: 'input',
    name: 'Input Field',
    icon: Edit,
    defaultProps: {
      placeholder: 'Enter text...',
      backgroundColor: '#1C1C1E',
      textColor: '#FFFFFF',
      borderColor: '#3A3A3C',
      borderWidth: 1,
      borderRadius: 8,
      opacity: 1,
      shadowColor: '#000000',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
    defaultStyles: {},
    defaultWidth: 300,
    defaultHeight: 44,
  },
  {
    type: 'image',
    name: 'Image',
    icon: Image,
    defaultProps: {
      source: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400',
      borderRadius: 0,
      aspectRatio: '16:9',
      opacity: 1,
      borderWidth: 0,
      borderColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      filterBrightness: 100,
      filterContrast: 100,
      filterSaturation: 100,
      filterBlur: 0,
      filterGrayscale: 0,
      filterSepia: 0,
      animation: 'none',
      animationDuration: 300,
    },
    defaultStyles: {},
    defaultWidth: 300,
    defaultHeight: 200,
  },
  {
    type: 'container',
    name: 'Container',
    icon: Layout,
    defaultProps: {
      backgroundColor: '#1C1C1E',
      gradientColors: null,
      gradientDirection: 'vertical',
      borderRadius: 12,
      borderColor: '#3A3A3C',
      borderWidth: 1,
      padding: 16,
      opacity: 1,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      animation: 'none',
      animationDuration: 300,
    },
    defaultStyles: {},
    defaultWidth: 320,
    defaultHeight: 200,
  },
  {
    type: 'list',
    name: 'List',
    icon: List,
    defaultProps: {
      itemCount: 5,
      itemHeight: 60,
      itemBackgroundColor: '#1C1C1E',
      itemBorderRadius: 8,
      spacing: 8,
      opacity: 1,
      borderWidth: 0,
      borderColor: '#3A3A3C',
      shadowColor: '#000000',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
    defaultStyles: {},
    defaultWidth: 320,
    defaultHeight: 340,
  },
  {
    type: 'card',
    name: 'Card',
    icon: CreditCard,
    defaultProps: {
      title: 'Card Title',
      subtitle: 'Card subtitle text',
      backgroundColor: '#1C1C1E',
      gradientColors: null,
      gradientDirection: 'vertical',
      borderRadius: 12,
      padding: 16,
      opacity: 1,
      borderWidth: 0,
      borderColor: '#3A3A3C',
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      animation: 'none',
      animationDuration: 300,
    },
    defaultStyles: {},
    defaultWidth: 320,
    defaultHeight: 120,
  },
  {
    type: 'header',
    name: 'Header',
    icon: Tag,
    defaultProps: {
      title: 'Screen Title',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
      showBackButton: false,
      opacity: 1,
      borderWidth: 0,
      borderColor: '#3A3A3C',
      shadowColor: '#000000',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
    defaultStyles: {},
    defaultWidth: 375,
    defaultHeight: 60,
  },
];

interface ComponentLibraryProps {
  onSelectComponent: (component: ComponentDefinition) => void;
}

export function ComponentLibrary({ onSelectComponent }: ComponentLibraryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold">Components</h3>
        <p className="text-xs text-white/60">Drag to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {COMPONENT_LIBRARY.map((component) => {
          const Icon = component.icon;
          return (
            <button
              key={component.type}
              onClick={() => onSelectComponent(component)}
              className="w-full glass-card p-3 flex items-center gap-3 hover:bg-white/10 transition-colors active:scale-95 text-left"
            >
              <div className="bg-orange-500/20 p-2 rounded-lg flex-shrink-0">
                <Icon className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{component.name}</p>
                <p className="text-xs text-white/60 truncate">{component.type}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
