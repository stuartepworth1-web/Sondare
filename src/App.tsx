import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Onboarding } from './components/Onboarding';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { Auth } from './components/Auth';
import { TabNavigation } from './components/TabNavigation';
import { HowToGuide } from './components/HowToGuide';
import { Home } from './screens/Home';
import { Builder } from './screens/Builder';
import { Design } from './screens/Design';
import { Projects } from './screens/Projects';

function AppContent() {
  const { user, loading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'builder' | 'design' | 'projects'>('home');
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('hasSeenOnboarding');
    const tutorialed = localStorage.getItem('hasSeenTutorial');

    if (onboarded) setHasSeenOnboarding(true);
    if (tutorialed) setHasSeenTutorial(true);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const handleTutorialComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
  };

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

  return (
    <div className="relative">
      {activeTab === 'home' && <Home onShowHowTo={() => setShowHowTo(true)} onNavigate={setActiveTab} />}
      {activeTab === 'builder' && <Builder />}
      {activeTab === 'design' && <Design />}
      {activeTab === 'projects' && <Projects />}

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {showHowTo && <HowToGuide onClose={() => setShowHowTo(false)} />}
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
