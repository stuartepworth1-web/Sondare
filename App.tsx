import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Onboarding } from './components/Onboarding';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { Auth } from './components/Auth';
import { TabNavigation } from './components/TabNavigation';
import { HowToGuide } from './components/HowToGuide';
import { UpgradeModalIAP } from './components/UpgradeModalIAP';
import { Home } from './screens/Home';
import { Builder } from './screens/Builder';
import { DesignNew } from './screens/DesignNew';
import { Projects } from './screens/Projects';
import { Settings } from './screens/Settings';
import { VisualEditor } from './screens/VisualEditor';
import { PrivacyPolicy } from './screens/PrivacyPolicy';
import { TermsOfService } from './screens/TermsOfService';
import { Support } from './screens/Support';
import { PublishingGuide } from './screens/PublishingGuide';
import { supabase, isMissingEnvVars } from './lib/supabase';
import { downloadProjectFiles } from './lib/exportApp';
import { AlertTriangle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  template_data: any;
}

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'builder' | 'design' | 'projects' | 'settings'>('home');
  const [showHowTo, setShowHowTo] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [editingProjectId, setEditingProjectId] = useState<string | undefined>(undefined);
  const [visualEditorProject, setVisualEditorProject] = useState<string | null>(null);

  useEffect(() => {
    const onboarded = localStorage.getItem('hasSeenOnboarding');
    const tutorialed = localStorage.getItem('hasSeenTutorial');

    if (onboarded) setHasSeenOnboarding(true);
    if (tutorialed) setHasSeenTutorial(true);

    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isMissingEnvVars) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 rounded-lg p-8 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Configuration Required</h1>
          <p className="text-zinc-400">
            This app requires environment variables to be configured. Please add the following
            to your Netlify environment settings:
          </p>
          <div className="bg-black rounded p-4 text-left font-mono text-sm text-zinc-300 space-y-2">
            <div>VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_ANON_KEY</div>
            <div>VITE_REVENUECAT_IOS_KEY</div>
          </div>
          <p className="text-zinc-500 text-sm">
            After adding these variables, redeploy your site for the changes to take effect.
          </p>
        </div>
      </div>
    );
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
  };

  if (currentRoute === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  if (currentRoute === '/terms-of-service') {
    return <TermsOfService />;
  }

  if (currentRoute === '/support') {
    return <Support />;
  }

  if (currentRoute === '/publishing-guide') {
    return <PublishingGuide />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="text-4xl font-bold gradient-text">Sondare</div>
          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!hasSeenTutorial && user) {
    return <InteractiveTutorial onComplete={handleTutorialComplete} />;
  }

  const handleSelectTemplate = async (template: Template) => {
    if (!user) return;

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          app_type: template.category,
          status: 'draft',
          editing_mode: 'visual',
        })
        .select()
        .single();

      if (error) throw error;
      if (project) {
        await applyTemplate(project.id, template);
        setVisualEditorProject(project.id);
      }
    } catch (error) {
      console.error('Error creating project from template:', error);
    }
  };

  const applyTemplate = async (projectId: string, template: Template) => {
    const templateData = template.template_data;

    if (templateData.screens) {
      for (let i = 0; i < templateData.screens.length; i++) {
        const screenData = templateData.screens[i];
        const { data: screen } = await supabase
          .from('app_screens')
          .insert({
            project_id: projectId,
            name: screenData.name,
            screen_type: screenData.type || 'custom',
            background_color: templateData.backgroundColor || '#000000',
            order_index: i,
            is_home_screen: i === 0,
          })
          .select()
          .single();

        if (screen && screenData.components) {
          for (let j = 0; j < screenData.components.length; j++) {
            const comp = screenData.components[j];
            await supabase.from('app_components').insert({
              screen_id: screen.id,
              component_type: comp.type,
              props: comp.props || {},
              styles: {},
              position_x: 20,
              position_y: 80 + j * 100,
              width: 335,
              height: 60,
              layer_order: j,
            });
          }
        }
      }
    }
  };

  const handleCreateBlank = async () => {
    if (!user) return;

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: 'New App',
          description: 'A new app created from scratch',
          app_type: 'custom',
          status: 'draft',
          editing_mode: 'visual',
        })
        .select()
        .single();

      if (error) throw error;
      if (project) {
        setVisualEditorProject(project.id);
      }
    } catch (error) {
      console.error('Error creating blank project:', error);
    }
  };

  const handleOpenVisualEditor = (projectId: string) => {
    setVisualEditorProject(projectId);
  };

  const handleExportProject = async (projectId: string, projectName: string) => {
    try {
      await downloadProjectFiles(projectId, projectName);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Failed to export project. Please try again.');
    }
  };

  const handleTabChange = (tab: 'home' | 'builder' | 'design' | 'projects' | 'settings') => {
    if (tab !== 'builder') {
      setEditingProjectId(undefined);
    }
    if (tab !== 'design') {
      setVisualEditorProject(null);
    }
    setActiveTab(tab);
  };

  if (visualEditorProject) {
    return (
      <VisualEditor
        projectId={visualEditorProject}
        onBack={() => {
          setVisualEditorProject(null);
          setActiveTab('projects');
        }}
        onPreview={() => {
          alert('Preview functionality coming soon!');
        }}
        onExport={async () => {
          const { data: project } = await supabase
            .from('projects')
            .select('name')
            .eq('id', visualEditorProject)
            .single();
          if (project) {
            await handleExportProject(visualEditorProject, project.name);
          }
        }}
        onShowUpgrade={() => setShowUpgrade(true)}
      />
    );
  }

  return (
    <div className="relative">
      {activeTab === 'home' && <Home onShowHowTo={() => setShowHowTo(true)} onNavigate={setActiveTab} onShowUpgrade={() => setShowUpgrade(true)} />}
      {activeTab === 'builder' && <Builder onShowUpgrade={() => setShowUpgrade(true)} initialProjectId={editingProjectId} />}
      {activeTab === 'design' && (
        <DesignNew
          onSelectTemplate={handleSelectTemplate}
          onCreateBlank={handleCreateBlank}
          onShowUpgrade={() => setShowUpgrade(true)}
        />
      )}
      {activeTab === 'projects' && (
        <Projects
          onContinueEditing={handleOpenVisualEditor}
          onExport={handleExportProject}
          onShowUpgrade={() => setShowUpgrade(true)}
        />
      )}
      {activeTab === 'settings' && (
        <Settings onShowUpgrade={() => setShowUpgrade(true)} />
      )}

      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {showHowTo && <HowToGuide onClose={() => setShowHowTo(false)} />}
      {showUpgrade && <UpgradeModalIAP onClose={() => setShowUpgrade(false)} currentTier={profile?.subscription_tier || 'free'} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
