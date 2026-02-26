import { useState, useEffect } from 'react';
import { Search, X, Zap, Crown, Eye, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TemplatePreviewModal } from '../components/TemplatePreviewModal';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  template_data: any;
  is_featured: boolean;
  is_premium?: boolean;
  tier_required?: string;
  thumbnail_url?: string;
}

interface DesignNewProps {
  onSelectTemplate: (template: Template) => void;
  onCreateBlank: () => void;
  onShowUpgrade?: () => void;
}

export function DesignNew({ onSelectTemplate, onCreateBlank, onShowUpgrade }: DesignNewProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const { profile } = useAuth();

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'social', name: 'Social' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'finance', name: 'Finance' },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('app_templates')
        .select('*')
        .order('is_featured', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      social: 'bg-blue-500/20 text-blue-500',
      ecommerce: 'bg-green-500/20 text-green-500',
      productivity: 'bg-purple-500/20 text-purple-500',
      fitness: 'bg-orange-500/20 text-orange-500',
      finance: 'bg-teal-500/20 text-teal-500',
      education: 'bg-pink-500/20 text-pink-500',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-500';
  };

  const canAccessTemplate = (template: Template) => {
    if (!template.is_premium) return true;
    if (!profile) return false;

    const tier = profile.subscription_tier || 'free';
    if (tier === 'entrepreneur') return true;
    if (tier === 'pro' && template.tier_required !== 'entrepreneur') return true;

    return false;
  };

  const handleTemplateClick = (template: Template) => {
    if (!canAccessTemplate(template)) {
      onShowUpgrade?.();
      return;
    }
    onSelectTemplate(template);
  };

  const handlePreview = (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    console.log('Preview template:', template);
    console.log('Template data:', template.template_data);
    console.log('Screens:', template.template_data?.screens);
    setPreviewTemplate(template);
  };

  return (
    <div className="min-h-screen pb-48 sm:pb-64 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Choose a Template</h1>
          <p className="text-white/60 text-xs sm:text-sm">
            Start with a pre-built template or create from scratch
          </p>
        </div>
        {onShowUpgrade && (
          <button
            onClick={onShowUpgrade}
            className="glass-button p-2 shrink-0"
          >
            <Zap className="w-5 h-5 text-orange-500" />
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'glass-button'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <button
        onClick={onCreateBlank}
        className="w-full glass-card p-6 hover:bg-white/10 transition-colors active:scale-[0.98] border-2 border-dashed border-white/20"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl text-orange-500">+</span>
          </div>
          <h3 className="font-semibold">Start from Blank</h3>
          <p className="text-white/60 text-sm">
            Create your app from scratch with full customization
          </p>
        </div>
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold">
            {selectedCategory === 'all' ? 'All Templates' : categories.find(c => c.id === selectedCategory)?.name}
            <span className="text-white/40 text-sm ml-2">({filteredTemplates.length})</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {filteredTemplates.map((template) => {
              const hasAccess = canAccessTemplate(template);
              return (
                <div
                  key={template.id}
                  className="glass-card overflow-hidden relative"
                >
                  {template.thumbnail_url && (
                    <div className="w-full h-48 overflow-hidden relative group">
                      {!imageLoaded[template.id] && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-blue-500/20 animate-pulse">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className={`w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300 ${
                          imageLoaded[template.id] ? 'opacity-70' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(prev => ({ ...prev, [template.id]: true }))}
                      />
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-base sm:text-lg">{template.name}</h4>
                          {template.is_featured && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500">
                              Featured
                            </span>
                          )}
                          {template.is_premium && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-xs sm:text-sm line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>

                    {template.template_data?.screens && (
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{template.template_data.screens.length} screens</span>
                        <span>•</span>
                        <span>Ready to customize</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handlePreview(e, template)}
                        className="flex-1 glass-button py-2.5 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Preview</span>
                      </button>
                      <button
                        onClick={() => handleTemplateClick(template)}
                        className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-all ${
                          hasAccess
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'glass-button opacity-60'
                        }`}
                      >
                        {hasAccess ? (
                          <>Use Template</>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Upgrade to Use
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/40">No templates found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {previewTemplate && (
        <TemplatePreviewModal
          screens={previewTemplate.template_data?.screens || []}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}
