import { X, Smartphone, Code, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProjectPreviewProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

interface Generation {
  generated_code: Record<string, string>;
  generated_schema: {
    screens: string[];
    components: string[];
    features: string[];
  };
}

interface AppScreen {
  id: string;
  name: string;
  screen_type: string;
  background_color: string;
  order_index: number;
}

interface AppComponent {
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

export function ProjectPreview({ projectId, projectName, onClose }: ProjectPreviewProps) {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [appScreens, setAppScreens] = useState<AppScreen[]>([]);
  const [appComponents, setAppComponents] = useState<AppComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'screens' | 'components' | 'code'>('visual');
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [generationData, screensData, componentsData] = await Promise.all([
          supabase
            .from('generations')
            .select('generated_code, generated_schema')
            .eq('project_id', projectId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('app_screens')
            .select('id, name, screen_type, background_color, order_index')
            .eq('project_id', projectId)
            .order('order_index'),
          supabase
            .from('app_components')
            .select('*')
            .eq('project_id', projectId)
            .order('layer_order')
        ]);

        if (generationData.data) setGeneration(generationData.data);
        if (screensData.data) setAppScreens(screensData.data);
        if (componentsData.data) setAppComponents(componentsData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading preview...</p>
        </div>
      </div>
    );
  }

  const hasData = generation || appScreens.length > 0;

  if (!hasData) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="glass-card p-6 max-w-md text-center space-y-4">
          <p className="text-white/60">No data found for this project yet.</p>
          <p className="text-sm text-white/40">Start building in the Visual Editor to see your app!</p>
          <button onClick={onClose} className="accent-button px-6 py-3">
            Close
          </button>
        </div>
      </div>
    );
  }

  const screensToShow = appScreens.length > 0 ? appScreens : generation?.generated_schema?.screens || [];
  const componentsToShow = generation?.generated_schema?.components || [];
  const featuresToShow = generation?.generated_schema?.features || [];

  const currentScreen = appScreens[currentScreenIndex];
  const currentScreenComponents = currentScreen
    ? appComponents.filter(c => c.screen_id === currentScreen.id)
    : [];

  const canGoBack = currentScreenIndex > 0;
  const canGoForward = currentScreenIndex < appScreens.length - 1;

  const goToPrevious = () => {
    if (canGoBack) setCurrentScreenIndex(currentScreenIndex - 1);
  };

  const goToNext = () => {
    if (canGoForward) setCurrentScreenIndex(currentScreenIndex + 1);
  };

  const renderComponent = (component: AppComponent) => {
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col">
      <div className="glass-card m-4 p-4 flex items-center justify-between border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold">{projectName}</h2>
          <p className="text-white/60 text-sm">Project Preview</p>
        </div>
        <button onClick={onClose} className="glass-button p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto">
        {appScreens.length > 0 && (
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'visual'
                ? 'bg-orange-500 text-white'
                : 'glass-button'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Visual Preview
          </button>
        )}
        <button
          onClick={() => setActiveTab('screens')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'screens'
              ? 'bg-orange-500 text-white'
              : 'glass-button'
          }`}
        >
          <Layers className="w-4 h-4" />
          Screens
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'components'
              ? 'bg-orange-500 text-white'
              : 'glass-button'
          }`}
        >
          <Layers className="w-4 h-4" />
          Components
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'code'
              ? 'bg-orange-500 text-white'
              : 'glass-button'
          }`}
        >
          <Code className="w-4 h-4" />
          Code
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {activeTab === 'visual' && appScreens.length > 0 && (
          <div className="space-y-4">
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
                  {currentScreen?.name || 'Screen'}
                  {appScreens.length > 1 && ` (${currentScreenIndex + 1}/${appScreens.length})`}
                </span>
                <button
                  onClick={goToNext}
                  disabled={!canGoForward}
                  className="glass-button p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className="relative border-4 border-gray-800 rounded-[40px] shadow-2xl"
                style={{
                  width: '375px',
                  height: '667px',
                  backgroundColor: currentScreen?.background_color || '#000000',
                  overflow: 'hidden',
                }}
              >
                <div className="w-full h-full relative">
                  {currentScreenComponents.length > 0 ? (
                    currentScreenComponents
                      .sort((a, b) => a.layer_order - b.layer_order)
                      .map(renderComponent)
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6">
                        <Smartphone className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40 text-sm">No components yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white/60 text-sm">
                Use the arrows to navigate between screens
              </p>
            </div>
          </div>
        )}

        {activeTab === 'screens' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">
              App Screens ({screensToShow.length})
            </h3>
            {screensToShow.map((screen, index) => {
              const screenName = typeof screen === 'string' ? screen : screen.name;
              const screenType = typeof screen === 'string' ? 'Main screen' : screen.screen_type;
              const bgColor = typeof screen === 'string' ? '#1C1C1E' : screen.background_color;

              return (
                <div key={index} className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Smartphone className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{screenName}</h4>
                      <p className="text-white/60 text-sm">{screenType}</p>
                    </div>
                    <div
                      className="w-8 h-8 rounded border border-white/20"
                      style={{ backgroundColor: bgColor }}
                      title="Background color"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-3">
            {componentsToShow.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-4">
                  UI Components ({componentsToShow.length})
                </h3>
                {componentsToShow.map((component, index) => (
                  <div key={index} className="glass-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{component}</h4>
                        <p className="text-white/60 text-sm">Reusable UI element</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-white/60">No components data available yet</p>
              </div>
            )}

            {featuresToShow.length > 0 && (
              <div className="glass-card p-4 bg-green-500/5 border-green-500/20 mt-6">
                <h4 className="font-semibold mb-2 text-green-500">Features Included</h4>
                <ul className="space-y-1 text-sm text-white/80">
                  {featuresToShow.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">Export Code</h3>
            {generation?.generated_code && Object.keys(generation.generated_code).length > 0 ? (
              Object.entries(generation.generated_code).map(([filename, code]) => (
                <div key={filename} className="glass-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-orange-500">{filename}</h4>
                    <Code className="w-4 h-4 text-white/40" />
                  </div>
                  <pre className="text-xs text-white/80 overflow-x-auto bg-black/30 p-3 rounded-lg">
                    <code>{code}</code>
                  </pre>
                </div>
              ))
            ) : (
              <div className="glass-card p-6 text-center space-y-3">
                <Code className="w-12 h-12 text-white/20 mx-auto" />
                <div>
                  <p className="text-white/60 mb-2">Ready to export your app?</p>
                  <p className="text-sm text-white/40">
                    Click the Export button on your project to download a complete React Native project with all your screens and components!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass-card m-4 p-4 border-t border-white/10">
        <button onClick={onClose} className="w-full accent-button py-3">
          Close Preview
        </button>
      </div>
    </div>
  );
}
