import { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingBag, Heart, TrendingUp, Utensils, Plane, GraduationCap, Home, Building, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  screens: Array<{
    name: string;
    type: string;
    components: any[];
    backgroundColor: string;
  }>;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, any> = {
    'e-commerce': ShoppingBag,
    'ecommerce': ShoppingBag,
    'social': Heart,
    'fitness': TrendingUp,
    'finance': TrendingUp,
    'food': Utensils,
    'travel': Plane,
    'education': GraduationCap,
    'realestate': Building,
    'real estate': Building,
    'custom': Sparkles,
    'entertainment': Sparkles,
    'default': Home
  };

  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
  return iconMap[normalizedCategory] || iconMap['default'];
};

interface ScreenTemplatesProps {
  onApplyTemplate: (components: any[]) => void;
  onClose: () => void;
}

export function ScreenTemplatesNew({ onApplyTemplate, onClose }: ScreenTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('app_templates')
        .select('id, name, description, category, template_data')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const formattedTemplates: Template[] = data.map((template: any) => ({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          icon: getCategoryIcon(template.category),
          screens: template.template_data?.screens || []
        }));
        setTemplates(formattedTemplates);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-white/80">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={onClose} className="glass-button px-6 py-2">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-white/80 mb-4">No templates available yet.</p>
          <button onClick={onClose} className="glass-button px-6 py-2">
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
          <h2 className="text-xl font-bold">Screen Templates</h2>
          <p className="text-white/60 text-sm">{templates.length} professional templates</p>
        </div>
        <button onClick={onClose} className="glass-button p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-orange-500 text-white'
                : 'glass-button'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 scrollbar-hide">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          const totalComponents = template.screens.reduce((sum, screen) => sum + (screen.components?.length || 0), 0);

          return (
            <button
              key={template.id}
              onClick={() => {
                if (template.screens.length > 0 && template.screens[0].components) {
                  onApplyTemplate(template.screens[0].components);
                  onClose();
                }
              }}
              className="glass-card p-4 text-left hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="bg-orange-500/20 p-3 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                  <Icon className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-white/60 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded capitalize">
                      {template.category}
                    </span>
                    <span className="text-xs text-white/40">
                      {template.screens.length} screen{template.screens.length !== 1 ? 's' : ''} • {totalComponents} components
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
