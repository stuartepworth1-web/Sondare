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

export function ProjectPreview({ projectId, projectName, onClose }: ProjectPreviewProps) {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'screens' | 'components' | 'code'>('screens');

  useEffect(() => {
    const fetchGeneration = async () => {
      try {
        const { data, error } = await supabase
          .from('generations')
          .select('generated_code, generated_schema')
          .eq('project_id', projectId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) setGeneration(data);
      } catch (error) {
        console.error('Error fetching generation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneration();
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

  if (!generation) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="glass-card p-6 max-w-md text-center space-y-4">
          <p className="text-white/60">No generation data found for this project.</p>
          <button onClick={onClose} className="accent-button px-6 py-3">
            Close
          </button>
        </div>
      </div>
    );
  }

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
              App Screens ({generation.generated_schema.screens.length})
            </h3>
            {generation.generated_schema.screens.map((screen, index) => (
              <div key={index} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-lg">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{screen}</h4>
                    <p className="text-white/60 text-sm">Main app screen</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">
              UI Components ({generation.generated_schema.components.length})
            </h3>
            {generation.generated_schema.components.map((component, index) => (
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

            <div className="glass-card p-4 bg-green-500/5 border-green-500/20 mt-6">
              <h4 className="font-semibold mb-2 text-green-500">Features Included</h4>
              <ul className="space-y-1 text-sm text-white/80">
                {generation.generated_schema.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">Generated Code</h3>
            {Object.entries(generation.generated_code).map(([filename, code]) => (
              <div key={filename} className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-orange-500">{filename}</h4>
                  <Code className="w-4 h-4 text-white/40" />
                </div>
                <pre className="text-xs text-white/80 overflow-x-auto bg-black/30 p-3 rounded-lg">
                  <code>{code}</code>
                </pre>
              </div>
            ))}
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
