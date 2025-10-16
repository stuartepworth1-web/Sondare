import { useState } from 'react';
import { Sparkles, Smartphone, Laptop } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: 'Turn Ideas Into Apps',
    description: 'Describe your app idea and watch AI bring it to life in minutes',
  },
  {
    icon: Smartphone,
    title: 'AI Builds, You Direct',
    description: 'No coding skills needed. Just chat with AI to create your perfect app',
  },
  {
    icon: Laptop,
    title: 'Works on Mobile & Laptop',
    description: 'Start on your phone, continue on your computer. Seamless everywhere',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 pb-12">
      <button
        onClick={handleSkip}
        className="self-end text-white/60 hover:text-white transition-colors text-sm font-medium"
      >
        Skip
      </button>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
          <div className="relative glass-card p-8">
            <Icon className="w-24 h-24 text-orange-500" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{slide.title}</h1>
          <p className="text-white/60 text-lg leading-relaxed">{slide.description}</p>
        </div>
      </div>

      <div className="w-full space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 bg-orange-500'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full accent-button py-4 text-lg"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
