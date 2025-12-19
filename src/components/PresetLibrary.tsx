import { useState, useEffect } from 'react';
import { Lock, Sparkles, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_image: string;
  required_tier: 'free' | 'starter' | 'pro' | 'entrepreneur';
  is_featured: boolean;
  preset_data: {
    components: Array<{
      type: string;
      props: Record<string, any>;
      position_x: number;
      position_y: number;
      width: number;
      height: number;
    }>;
  };
}

interface PresetLibraryProps {
  onApplyPreset: (preset: Preset) => void;
  onClose: () => void;
  onShowUpgrade: () => void;
}

const TIER_ORDER = ['free', 'starter', 'pro', 'entrepreneur'];

export function PresetLibrary({ onApplyPreset, onClose, onShowUpgrade }: PresetLibraryProps) {
  const { profile } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Presets' },
    { id: 'screen', name: 'Screens' },
    { id: 'component', name: 'Components' },
    { id: 'layout', name: 'Layouts' },
  ];

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('app_presets')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccessPreset = (presetTier: string) => {
    const userTier = profile?.subscription_tier || 'free';
    const userTierIndex = TIER_ORDER.indexOf(userTier);
    const presetTierIndex = TIER_ORDER.indexOf(presetTier);
    return userTierIndex >= presetTierIndex;
  };

  const filteredPresets = presets.filter((preset) => {
    if (selectedCategory === 'all') return true;
    return preset.category === selectedCategory;
  });

  const handlePresetClick = (preset: Preset) => {
    if (!canAccessPreset(preset.required_tier)) {
      onShowUpgrade();
      return;
    }
    onApplyPreset(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              Preset Library
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Choose a preset to quickly build your app
            </p>
          </div>
          <button onClick={onClose} className="glass-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'glass-button'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60">Loading presets...</div>
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-white/60">No presets found in this category</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset) => {
                const isLocked = !canAccessPreset(preset.required_tier);
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={`glass-card p-4 text-left space-y-3 transition-all ${
                      isLocked
                        ? 'opacity-60 hover:opacity-80'
                        : 'hover:border-orange-500'
                    }`}
                  >
                    <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {preset.preview_image ? (
                        <img
                          src={preset.preview_image}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles className="w-8 h-8 text-white/20" />
                      )}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-orange-500" />
                        </div>
                      )}
                      {preset.is_featured && !isLocked && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 rounded text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold flex items-center justify-between">
                        {preset.name}
                        {isLocked && (
                          <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-500 rounded capitalize">
                            {preset.required_tier}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 capitalize">
                        {preset.category}
                      </span>
                      <span className="text-orange-500">
                        {isLocked ? 'Upgrade to use' : 'Click to apply'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
