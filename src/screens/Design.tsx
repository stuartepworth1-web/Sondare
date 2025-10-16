import { Palette, LayoutGrid, Layers, Smartphone } from 'lucide-react';

const categories = [
  {
    id: 'templates',
    icon: LayoutGrid,
    title: 'App Templates',
    description: 'Pre-built app structures',
    count: 5,
    items: ['Social', 'E-commerce', 'Productivity', 'Fitness', 'Finance'],
  },
  {
    id: 'components',
    icon: Layers,
    title: 'Components',
    description: 'Reusable UI elements',
    count: 12,
    items: ['Buttons', 'Cards', 'Forms', 'Navigation', 'Lists'],
  },
  {
    id: 'themes',
    icon: Palette,
    title: 'Color Themes',
    description: 'Beautiful color palettes',
    count: 8,
    items: ['Dark Mode', 'Light Mode', 'Vibrant', 'Minimal', 'Corporate'],
  },
  {
    id: 'screens',
    icon: Smartphone,
    title: 'Screen Layouts',
    description: 'Ready-to-use screens',
    count: 15,
    items: ['Login', 'Dashboard', 'Profile', 'Settings', 'Feed'],
  },
];

export function Design() {
  return (
    <div className="min-h-screen pb-24 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Design Library</h1>
        <p className="text-white/60 text-xs sm:text-sm">
          Browse templates and components for your app
        </p>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <div key={category.id} className="glass-card p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="bg-orange-500/20 p-2 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">{category.title}</h3>
                    <p className="text-white/60 text-xs sm:text-sm">{category.description}</p>
                  </div>
                </div>
                <span className="text-white/40 text-xs sm:text-sm flex-shrink-0 ml-2">{category.count}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {category.items.map((item) => (
                  <button
                    key={item}
                    className="glass-button px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm active:scale-95"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4 sm:p-6 space-y-2 sm:space-y-3 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
        <h3 className="font-semibold text-sm sm:text-base text-orange-500">Coming Soon</h3>
        <p className="text-white/60 text-xs sm:text-sm">
          Visual drag-and-drop editor, custom component creator, and advanced theming options are on the way!
        </p>
      </div>
    </div>
  );
}
