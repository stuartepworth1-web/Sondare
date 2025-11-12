import { useState, useEffect } from 'react';
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
import { Design } from './screens/Design';
import { Projects } from './screens/Projects';
import { Settings } from './screens/Settings';
import { PrivacyPolicy } from './screens/PrivacyPolicy';
import { TermsOfService } from './screens/TermsOfService';
import { Support } from './screens/Support';

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'builder' | 'design' | 'projects' | 'settings'>('home');
  const [showHowTo, setShowHowTo] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [editingProjectId, setEditingProjectId] = useState<string | undefined>(undefined);

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

  if (!user) {
    return <Auth />;
  }

  if (!hasSeenTutorial) {
    return <InteractiveTutorial onComplete={handleTutorialComplete} />;
  }

  const handleContinueEditing = (projectId: string) => {
    setEditingProjectId(projectId);
    setActiveTab('builder');
  };

  const handleTabChange = (tab: 'home' | 'builder' | 'design' | 'projects' | 'settings') => {
    if (tab !== 'builder') {
      setEditingProjectId(undefined);
    }
    setActiveTab(tab);
  };

  return (
    <div className="relative">
      {activeTab === 'home' && <Home onShowHowTo={() => setShowHowTo(true)} onNavigate={setActiveTab} onShowUpgrade={() => setShowUpgrade(true)} />}
      {activeTab === 'builder' && <Builder onShowUpgrade={() => setShowUpgrade(true)} initialProjectId={editingProjectId} />}
      {activeTab === 'design' && <Design />}
      {activeTab === 'projects' && <Projects onContinueEditing={handleContinueEditing} />}
      {activeTab === 'settings' && <Settings onShowUpgrade={() => setShowUpgrade(true)} />}

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
