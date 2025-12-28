import { useState, useEffect } from 'react';
import { Search, X, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  template_data: any;
  is_featured: boolean;
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

  return (
    <div className="min-h-screen pb-24 p-4 sm:p-6 space-y-4 sm:space-y-6">
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
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="glass-card p-4 sm:p-5 hover:bg-white/10 transition-colors active:scale-[0.98] text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-base sm:text-lg">{template.name}</h4>
                        {template.is_featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500">
                            Featured
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
                </div>
              </button>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/40">No templates found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
