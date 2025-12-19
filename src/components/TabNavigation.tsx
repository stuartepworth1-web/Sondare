import { Home, MessageSquare, Palette, FolderOpen, Settings } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'home' | 'builder' | 'design' | 'projects' | 'settings';
  onTabChange: (tab: 'home' | 'builder' | 'design' | 'projects' | 'settings') => void;
}

const tabs = [
  { id: 'home' as const, icon: Home, label: 'Home' },
  { id: 'builder' as const, icon: MessageSquare, label: 'Builder' },
  { id: 'design' as const, icon: Palette, label: 'Design' },
  { id: 'projects' as const, icon: FolderOpen, label: 'Projects' },
  { id: 'settings' as const, icon: Settings, label: 'Settings' },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl border-t border-white/10 px-4 py-3 z-50">
      <div className="flex items-center justify-around max-w-xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-orange-500'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
