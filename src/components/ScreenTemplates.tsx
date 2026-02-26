import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  components: any[];
}

const TEMPLATES: Template[] = [
  {
    id: 'login',
    name: 'Login Screen',
    description: 'Email and password login',
    category: 'Auth',
    components: [
      {
        type: 'header',
        props: {
          title: 'Welcome Back',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          fontSize: 24,
          fontWeight: 'bold',
          showBackButton: false,
        },
        position_x: 0,
        position_y: 0,
        width: 375,
        height: 60,
      },
      {
        type: 'text',
        props: {
          text: 'Sign in to continue',
          fontSize: 16,
          color: '#FFFFFF99',
          fontWeight: 'normal',
          textAlign: 'center',
        },
        position_x: 87,
        position_y: 80,
        width: 200,
        height: 24,
      },
      {
        type: 'input',
        props: {
          placeholder: 'Email',
          backgroundColor: '#1C1C1E',
          textColor: '#FFFFFF',
          borderColor: '#3A3A3C',
          borderRadius: 12,
        },
        position_x: 37,
        position_y: 140,
        width: 300,
        height: 50,
      },
      {
        type: 'input',
        props: {
          placeholder: 'Password',
          backgroundColor: '#1C1C1E',
          textColor: '#FFFFFF',
          borderColor: '#3A3A3C',
          borderRadius: 12,
        },
        position_x: 37,
        position_y: 210,
        width: 300,
        height: 50,
      },
      {
        type: 'button',
        props: {
          text: 'Sign In',
          backgroundColor: '#FF9500',
          textColor: '#FFFFFF',
          fontSize: 16,
          borderRadius: 12,
        },
        position_x: 37,
        position_y: 290,
        width: 300,
        height: 50,
      },
    ],
  },
  {
    id: 'profile',
    name: 'Profile Screen',
    description: 'User profile with avatar',
    category: 'Social',
    components: [
      {
        type: 'header',
        props: {
          title: 'Profile',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          fontSize: 20,
          fontWeight: 'bold',
          showBackButton: true,
        },
        position_x: 0,
        position_y: 0,
        width: 375,
        height: 60,
      },
      {
        type: 'image',
        props: {
          source: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
          borderRadius: 60,
          aspectRatio: '1:1',
        },
        position_x: 137,
        position_y: 90,
        width: 100,
        height: 100,
      },
      {
        type: 'text',
        props: {
          text: 'John Doe',
          fontSize: 24,
          color: '#FFFFFF',
          fontWeight: 'bold',
          textAlign: 'center',
        },
        position_x: 87,
        position_y: 210,
        width: 200,
        height: 32,
      },
      {
        type: 'text',
        props: {
          text: 'john.doe@example.com',
          fontSize: 14,
          color: '#FFFFFF99',
          fontWeight: 'normal',
          textAlign: 'center',
        },
        position_x: 87,
        position_y: 250,
        width: 200,
        height: 20,
      },
      {
        type: 'button',
        props: {
          text: 'Edit Profile',
          backgroundColor: '#FF9500',
          textColor: '#FFFFFF',
          fontSize: 16,
          borderRadius: 12,
        },
        position_x: 87,
        position_y: 300,
        width: 200,
        height: 44,
      },
    ],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Overview with stats cards',
    category: 'Business',
    components: [
      {
        type: 'header',
        props: {
          title: 'Dashboard',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          fontSize: 20,
          fontWeight: 'bold',
          showBackButton: false,
        },
        position_x: 0,
        position_y: 0,
        width: 375,
        height: 60,
      },
      {
        type: 'card',
        props: {
          title: 'Total Revenue',
          subtitle: '$12,543',
          backgroundColor: '#1C1C1E',
          borderRadius: 12,
          padding: 16,
        },
        position_x: 20,
        position_y: 90,
        width: 160,
        height: 100,
      },
      {
        type: 'card',
        props: {
          title: 'Total Users',
          subtitle: '1,234',
          backgroundColor: '#1C1C1E',
          borderRadius: 12,
          padding: 16,
        },
        position_x: 195,
        position_y: 90,
        width: 160,
        height: 100,
      },
      {
        type: 'card',
        props: {
          title: 'Active Now',
          subtitle: '87 users',
          backgroundColor: '#1C1C1E',
          borderRadius: 12,
          padding: 16,
        },
        position_x: 20,
        position_y: 210,
        width: 160,
        height: 100,
      },
      {
        type: 'card',
        props: {
          title: 'Growth',
          subtitle: '+23.5%',
          backgroundColor: '#1C1C1E',
          borderRadius: 12,
          padding: 16,
        },
        position_x: 195,
        position_y: 210,
        width: 160,
        height: 100,
      },
    ],
  },
  {
    id: 'feed',
    name: 'Social Feed',
    description: 'List of posts',
    category: 'Social',
    components: [
      {
        type: 'header',
        props: {
          title: 'Feed',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          fontSize: 20,
          fontWeight: 'bold',
          showBackButton: false,
        },
        position_x: 0,
        position_y: 0,
        width: 375,
        height: 60,
      },
      {
        type: 'list',
        props: {
          itemCount: 5,
          itemHeight: 80,
          itemBackgroundColor: '#1C1C1E',
          itemBorderRadius: 12,
          spacing: 12,
        },
        position_x: 20,
        position_y: 80,
        width: 335,
        height: 500,
      },
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Settings menu list',
    category: 'Utility',
    components: [
      {
        type: 'header',
        props: {
          title: 'Settings',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          fontSize: 20,
          fontWeight: 'bold',
          showBackButton: true,
        },
        position_x: 0,
        position_y: 0,
        width: 375,
        height: 60,
      },
      {
        type: 'list',
        props: {
          itemCount: 7,
          itemHeight: 60,
          itemBackgroundColor: '#1C1C1E',
          itemBorderRadius: 8,
          spacing: 8,
        },
        position_x: 20,
        position_y: 80,
        width: 335,
        height: 500,
      },
    ],
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Welcome screen',
    category: 'Auth',
    components: [
      {
        type: 'image',
        props: {
          source: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400',
          borderRadius: 0,
          aspectRatio: '16:9',
        },
        position_x: 0,
        position_y: 0,
        width: 375,
        height: 250,
      },
      {
        type: 'text',
        props: {
          text: 'Welcome to Our App',
          fontSize: 28,
          color: '#FFFFFF',
          fontWeight: 'bold',
          textAlign: 'center',
        },
        position_x: 37,
        position_y: 280,
        width: 300,
        height: 40,
      },
      {
        type: 'text',
        props: {
          text: 'Get started by creating your account and exploring amazing features',
          fontSize: 16,
          color: '#FFFFFF99',
          fontWeight: 'normal',
          textAlign: 'center',
        },
        position_x: 37,
        position_y: 340,
        width: 300,
        height: 60,
      },
      {
        type: 'button',
        props: {
          text: 'Get Started',
          backgroundColor: '#FF9500',
          textColor: '#FFFFFF',
          fontSize: 18,
          borderRadius: 12,
        },
        position_x: 37,
        position_y: 440,
        width: 300,
        height: 54,
      },
      {
        type: 'button',
        props: {
          text: 'I already have an account',
          backgroundColor: 'transparent',
          textColor: '#FF9500',
          fontSize: 16,
          borderRadius: 12,
        },
        position_x: 87,
        position_y: 510,
        width: 200,
        height: 44,
      },
    ],
  },
];

interface ScreenTemplatesProps {
  onApplyTemplate: (template: Template) => void;
  onClose: () => void;
}

export function ScreenTemplates({ onApplyTemplate, onClose }: ScreenTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Screen Templates</h2>
          </div>
          <button onClick={onClose} className="glass-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-white/10">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'glass-button text-white/60 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onApplyTemplate(template);
                  onClose();
                }}
                className="glass-card p-4 text-left hover:bg-white/10 transition-all active:scale-95"
              >
                <div className="aspect-[9/16] bg-[#000000] rounded-lg mb-3 overflow-hidden relative border border-white/10">
                  <div className="w-full h-full scale-[0.15] origin-top-left" style={{ width: '375px', height: '667px' }}>
                    {template.components.map((comp, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'absolute',
                          left: comp.position_x,
                          top: comp.position_y,
                          width: comp.width,
                          height: comp.height,
                          backgroundColor: comp.type === 'button' ? comp.props.backgroundColor :
                                         comp.type === 'card' || comp.type === 'container' || comp.type === 'header' ? comp.props.backgroundColor :
                                         comp.type === 'input' ? comp.props.backgroundColor :
                                         comp.type === 'list' ? 'transparent' : 'transparent',
                          borderRadius: comp.type === 'button' ? `${comp.props.borderRadius}px` :
                                       comp.type === 'card' || comp.type === 'container' ? `${comp.props.borderRadius}px` :
                                       comp.type === 'input' ? `${comp.props.borderRadius}px` : '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        {comp.type === 'text' && <span style={{ fontSize: `${comp.props.fontSize * 0.8}px`, color: comp.props.color }}>{comp.props.text}</span>}
                        {comp.type === 'button' && <span style={{ fontSize: `${(comp.props.fontSize || 16) * 0.8}px`, color: comp.props.textColor }}>{comp.props.text}</span>}
                        {comp.type === 'header' && <span style={{ fontSize: `${comp.props.fontSize * 0.8}px`, color: comp.props.textColor }}>{comp.props.title}</span>}
                        {comp.type === 'image' && <div style={{ width: '100%', height: '100%', backgroundColor: '#3A3A3C' }} />}
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-xs text-white/60">{template.description}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-orange-500/20 text-orange-500 text-xs rounded">
                  {template.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
