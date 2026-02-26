import { X, Smartphone, Code, Layers } from 'lucide-react';
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
}

export function ProjectPreview({ projectId, projectName, onClose }: ProjectPreviewProps) {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [appScreens, setAppScreens] = useState<AppScreen[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'screens' | 'components' | 'code'>('screens');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [generationData, screensData] = await Promise.all([
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
            .select('id, name, screen_type, background_color')
            .eq('project_id', projectId)
            .order('order_index')
        ]);

        if (generationData.data) setGeneration(generationData.data);
        if (screensData.data) setAppScreens(screensData.data);
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

      <div className="flex gap-2 px-4">
        <button
          onClick={() => setActiveTab('screens')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'screens'
              ? 'bg-orange-500 text-white'
              : 'glass-button'
          }`}
        >
          <Smartphone className="w-4 h-4" />
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
