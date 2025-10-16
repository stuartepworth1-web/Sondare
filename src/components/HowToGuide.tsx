import { X, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';

interface HowToGuideProps {
  onClose: () => void;
}

export function HowToGuide({ onClose }: HowToGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 glass-card p-4 flex items-center justify-between border-b border-white/10 z-10">
          <h2 className="text-xl font-bold">How to Use Sondare</h2>
          <button onClick={onClose} className="glass-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Smartphone className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold">Mobile Features (70%)</h3>
            </div>
            <div className="space-y-3 pl-14">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Chat with AI Builder</p>
                  <p className="text-white/60 text-sm">
                    Describe your app idea in natural language
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Preview Generated Apps</p>
                  <p className="text-white/60 text-sm">
                    See screens and browse your app structure
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Manage Projects</p>
                  <p className="text-white/60 text-sm">
                    View, organize, and export your apps
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Browse Design Library</p>
                  <p className="text-white/60 text-sm">
                    Explore templates and components
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Laptop className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">Laptop Features (30%)</h3>
            </div>
            <div className="space-y-3 pl-14">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Advanced Code Editing</p>
                  <p className="text-white/60 text-sm">
                    Full-featured editor with syntax highlighting
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Complex Debugging</p>
                  <p className="text-white/60 text-sm">
                    Developer tools and error analysis
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Deployment Management</p>
                  <p className="text-white/60 text-sm">
                    Configure hosting and publish your app
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Multi-file Operations</p>
                  <p className="text-white/60 text-sm">
                    Work with larger codebases efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="glass-card p-4 bg-orange-500/5 border-orange-500/20 space-y-2">
            <h4 className="font-semibold text-orange-500">Best Workflow</h4>
            <ul className="space-y-1 text-sm text-white/80">
              <li>1. Capture ideas on mobile anytime, anywhere</li>
              <li>2. Let AI generate your app structure</li>
              <li>3. Review and iterate on mobile</li>
              <li>4. Fine-tune code on laptop when needed</li>
              <li>5. Deploy from laptop or export code</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 glass-card p-4 border-t border-white/10">
          <button onClick={onClose} className="w-full accent-button py-3">
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
