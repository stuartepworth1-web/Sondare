import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Screen {
  id: string;
  name: string;
  background_color: string;
  order_index: number;
}

interface Component {
  id: string;
  screen_id: string;
  component_type: string;
  props: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  layer_order: number;
}

interface PreviewModalProps {
  screens: Screen[];
  components: Component[];
  currentScreenId: string;
  onClose: () => void;
}

export function PreviewModal({ screens, components, currentScreenId, onClose }: PreviewModalProps) {
  const [activeScreenId, setActiveScreenId] = useState(currentScreenId);

  const currentScreen = screens.find(s => s.id === activeScreenId);
  const screenComponents = components.filter(c => c.screen_id === activeScreenId);

  const currentIndex = screens.findIndex(s => s.id === activeScreenId);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < screens.length - 1;

  const goToPrevious = () => {
    if (canGoBack) {
      setActiveScreenId(screens[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (canGoForward) {
      setActiveScreenId(screens[currentIndex + 1].id);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreenId]);

  const renderComponent = (component: Component) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${component.position_x}px`,
      top: `${component.position_y}px`,
      width: `${component.width}px`,
      height: `${component.height}px`,
    };

    switch (component.component_type) {
      case 'text':
        return (
          <div key={component.id} style={baseStyle}>
            <p
              style={{
                fontSize: `${component.props.fontSize}px`,
                color: component.props.color,
                fontWeight: component.props.fontWeight,
                textAlign: component.props.textAlign,
                margin: 0,
              }}
            >
              {component.props.text}
            </p>
          </div>
        );

      case 'button':
        return (
          <div key={component.id} style={baseStyle}>
            <button
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: component.props.backgroundColor || '#FF9500',
                color: component.props.textColor || '#FFFFFF',
                fontSize: `${component.props.fontSize || 16}px`,
                borderRadius: `${component.props.borderRadius || 8}px`,
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {component.props.text || 'Button'}
            </button>
          </div>
        );

      case 'input':
        return (
          <div key={component.id} style={baseStyle}>
            <input
              type="text"
              placeholder={component.props.placeholder}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: component.props.backgroundColor,
                color: component.props.textColor,
                border: `1px solid ${component.props.borderColor}`,
                borderRadius: `${component.props.borderRadius}px`,
                padding: '0 12px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        );

      case 'image':
        return (
          <div key={component.id} style={baseStyle}>
            <img
              src={component.props.source}
              alt="Component"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: `${component.props.borderRadius}px`,
              }}
            />
          </div>
        );

      case 'container':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              backgroundColor: component.props.backgroundColor,
              borderRadius: `${component.props.borderRadius}px`,
              border: `${component.props.borderWidth}px solid ${component.props.borderColor}`,
              padding: `${component.props.padding}px`,
            }}
          />
        );

      case 'list':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: 'column',
              gap: `${component.props.spacing}px`,
              overflow: 'auto',
            }}
          >
            {Array.from({ length: component.props.itemCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: `${component.props.itemHeight}px`,
                  backgroundColor: component.props.itemBackgroundColor,
                  borderRadius: `${component.props.itemBorderRadius}px`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                }}
              >
                <span style={{ fontSize: '14px', color: '#FFFFFF' }}>
                  List Item {i + 1}
                </span>
              </div>
            ))}
          </div>
        );

      case 'card':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              backgroundColor: component.props.backgroundColor,
              borderRadius: `${component.props.borderRadius}px`,
              padding: `${component.props.padding}px`,
            }}
          >
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>
              {component.props.title}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#FFFFFF99' }}>
              {component.props.subtitle}
            </p>
          </div>
        );

      case 'header':
        return (
          <div
            key={component.id}
            style={{
              ...baseStyle,
              backgroundColor: component.props.backgroundColor,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
            }}
          >
            {component.props.showBackButton && (
              <button style={{ marginRight: '12px', background: 'none', border: 'none', color: '#FF9500', fontSize: '20px', cursor: 'pointer' }}>
                ←
              </button>
            )}
            <h3
              style={{
                margin: 0,
                fontSize: `${component.props.fontSize}px`,
                fontWeight: component.props.fontWeight,
                color: component.props.textColor,
              }}
            >
              {component.props.title}
            </h3>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={!canGoBack}
              className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium">
              {currentScreen?.name || 'Preview'}
              {screens.length > 1 && ` (${currentIndex + 1}/${screens.length})`}
            </span>
            <button
              onClick={goToNext}
              disabled={!canGoForward}
              className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button onClick={onClose} className="glass-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="relative border-4 border-gray-800 rounded-[40px] shadow-2xl mx-auto"
          style={{
            width: '375px',
            height: '667px',
            backgroundColor: currentScreen?.background_color || '#000000',
            overflow: 'hidden',
          }}
        >
          <div className="w-full h-full relative">
            {screenComponents
              .sort((a, b) => a.layer_order - b.layer_order)
              .map(renderComponent)}
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/60 text-sm">
            Use arrow keys to navigate • Press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}
