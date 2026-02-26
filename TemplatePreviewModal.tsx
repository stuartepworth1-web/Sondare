import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TemplateScreen {
  name: string;
  type: string;
  backgroundColor: string;
  components: TemplateComponent[];
}

interface TemplateComponent {
  type: string;
  props: Record<string, any>;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}

interface TemplatePreviewModalProps {
  screens: TemplateScreen[];
  onClose: () => void;
}

export function TemplatePreviewModal({ screens, onClose }: TemplatePreviewModalProps) {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  useEffect(() => {
    console.log('TemplatePreviewModal - Screens:', screens);
    console.log('TemplatePreviewModal - Screens length:', screens?.length);
    console.log('TemplatePreviewModal - First screen:', screens?.[0]);
  }, [screens]);

  const currentScreen = screens?.[activeScreenIndex];
  const canGoBack = activeScreenIndex > 0;
  const canGoForward = activeScreenIndex < (screens?.length || 0) - 1;

  const goToPrevious = () => {
    if (canGoBack) {
      setActiveScreenIndex(activeScreenIndex - 1);
    }
  };

  const goToNext = () => {
    if (canGoForward) {
      setActiveScreenIndex(activeScreenIndex + 1);
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
  }, [activeScreenIndex]);

  const getBackgroundStyle = (props: any) => {
    const style: any = {};
    if (props.backgroundImage) {
      style.backgroundImage = `url(${props.backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundRepeat = 'no-repeat';
    } else if (props.backgroundColor) {
      style.backgroundColor = props.backgroundColor;
    }
    return style;
  };

  const renderComponent = (component: TemplateComponent, index: number) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${component.position_x}px`,
      top: `${component.position_y}px`,
      width: `${component.width}px`,
      height: `${component.height}px`,
      pointerEvents: 'none' as const,
    };

    switch (component.type) {
      case 'text':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              ...getBackgroundStyle(component.props),
              padding: `${component.props.paddingVertical || 0}px ${component.props.paddingHorizontal || 0}px`,
              borderRadius: component.props.borderRadius ? `${component.props.borderRadius}px` : undefined,
            }}
          >
            <p
              style={{
                fontSize: `${component.props.fontSize || 16}px`,
                color: component.props.color || '#FFFFFF',
                fontWeight: component.props.fontWeight || 'normal',
                textAlign: component.props.textAlign || 'left',
                margin: 0,
              }}
            >
              {component.props.text || 'Text'}
            </p>
          </div>
        );

      case 'button':
        return (
          <div key={index} style={baseStyle}>
            <button
              style={{
                width: '100%',
                height: '100%',
                ...getBackgroundStyle(component.props),
                color: component.props.textColor || '#FFFFFF',
                fontSize: `${component.props.fontSize || 16}px`,
                borderRadius: `${component.props.borderRadius || 8}px`,
                border: 'none',
                cursor: 'default',
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
          <div key={index} style={baseStyle}>
            <input
              type="text"
              placeholder={component.props.placeholder || 'Input'}
              readOnly
              style={{
                width: '100%',
                height: '100%',
                ...getBackgroundStyle(component.props),
                color: component.props.textColor || '#FFFFFF',
                border: `${component.props.borderWidth || 1}px solid ${component.props.borderColor || '#3A3A3C'}`,
                borderRadius: `${component.props.borderRadius || 8}px`,
                padding: '0 12px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        );

      case 'image':
        return (
          <div key={index} style={baseStyle}>
            {component.props.source ? (
              <img
                src={component.props.source}
                alt="Component"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: `${component.props.borderRadius || 0}px`,
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#1C1C1E',
                  borderRadius: `${component.props.borderRadius || 0}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '12px',
                }}
              >
                No image
              </div>
            )}
          </div>
        );

      case 'container':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              ...getBackgroundStyle(component.props),
              borderRadius: `${component.props.borderRadius || 12}px`,
              border: `${component.props.borderWidth || 1}px solid ${component.props.borderColor || '#3A3A3C'}`,
              padding: `${component.props.padding || 16}px`,
            }}
          />
        );

      case 'list':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: 'column',
              gap: `${component.props.spacing || 8}px`,
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: component.props.itemCount || 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: `${component.props.itemHeight || 60}px`,
                  backgroundColor: component.props.itemBackgroundColor || '#1C1C1E',
                  borderRadius: `${component.props.itemBorderRadius || 8}px`,
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
            key={index}
            style={{
              ...baseStyle,
              ...getBackgroundStyle(component.props),
              borderRadius: `${component.props.borderRadius || 12}px`,
              padding: `${component.props.padding || 16}px`,
            }}
          >
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>
              {component.props.title || 'Card Title'}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#FFFFFF99' }}>
              {component.props.subtitle || 'Card subtitle'}
            </p>
          </div>
        );

      case 'header':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              ...getBackgroundStyle(component.props),
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
            }}
          >
            {component.props.showBackButton && (
              <button
                style={{
                  marginRight: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#FF9500',
                  fontSize: '20px',
                  cursor: 'default',
                }}
              >
                ←
              </button>
            )}
            <h3
              style={{
                margin: 0,
                fontSize: `${component.props.fontSize || 20}px`,
                fontWeight: component.props.fontWeight || 'bold',
                color: component.props.textColor || '#FFFFFF',
              }}
            >
              {component.props.title || 'Header'}
            </h3>
          </div>
        );

      default:
        return null;
    }
  };

  if (!screens || screens.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-card p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto" />
          <h3 className="text-lg font-semibold">No Preview Available</h3>
          <p className="text-white/60 text-sm">
            This template doesn't have any screens to preview.
          </p>
          <button onClick={onClose} className="accent-button w-full py-2.5">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!currentScreen) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-card p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold">Error Loading Preview</h3>
          <p className="text-white/60 text-sm">
            Unable to load the template preview.
          </p>
          <button onClick={onClose} className="accent-button w-full py-2.5">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={!canGoBack}
              className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous screen"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white text-sm font-medium">
              {currentScreen.name}
              {screens.length > 1 && ` (${activeScreenIndex + 1}/${screens.length})`}
            </span>
            <button
              onClick={goToNext}
              disabled={!canGoForward}
              className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next screen"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button onClick={onClose} className="glass-button p-2" title="Close preview">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="relative border-4 border-gray-800 rounded-[40px] shadow-2xl mx-auto"
          style={{
            width: '375px',
            height: '667px',
            backgroundColor: currentScreen.backgroundColor || '#000000',
            overflow: 'hidden',
          }}
        >
          <div className="w-full h-full relative">
            {currentScreen.components && currentScreen.components.length > 0 ? (
              currentScreen.components.map((comp, idx) => renderComponent(comp, idx))
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-white/20 mx-auto" />
                  <p className="text-white/40 text-sm">No components in this screen</p>
                </div>
              </div>
            )}
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
