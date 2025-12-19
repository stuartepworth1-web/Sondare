import { useState } from 'react';
import { MessageSquare, FolderOpen, Palette, ChevronRight, X } from 'lucide-react';

interface InteractiveTutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: MessageSquare,
    title: 'Builder Tab',
    description: 'Chat with AI to create your app',
    highlight: 'This is where the magic happens! Describe your app idea and watch AI build it.',
  },
  {
    icon: Palette,
    title: 'Design Tab',
    description: 'Browse templates and components',
    highlight: 'Explore pre-built designs and UI elements to enhance your app.',
  },
  {
    icon: FolderOpen,
    title: 'Projects Tab',
    description: 'Manage and export your apps',
    highlight: 'View all your projects, download code, and track progress.',
  },
];

export function InteractiveTutorial({ onComplete }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button onClick={handleSkip} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-orange-500/20 p-6 rounded-2xl">
              <Icon className="w-16 h-16 text-orange-500" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <p className="text-white/60">{step.description}</p>
          </div>

          <div className="glass-card p-4 bg-orange-500/5 border-orange-500/20">
            <p className="text-sm text-white/80">{step.highlight}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-orange-500'
                    : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full accent-button py-4 flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              'Start Building'
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-white/60 hover:text-white text-sm py-2"
            >
              Skip Tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
