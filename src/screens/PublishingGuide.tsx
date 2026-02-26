import { Smartphone, Download, Rocket, CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function PublishingGuide() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const commands = {
    install: 'npm install',
    start: 'npm start',
    easInstall: 'npm install -g eas-cli',
    easLogin: 'eas login',
    easBuildIOS: 'eas build --platform ios',
    easBuildAndroid: 'eas build --platform android',
    easSubmitIOS: 'eas submit --platform ios',
    easSubmitAndroid: 'eas submit --platform android',
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-3 rounded-xl">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Publishing Your App</h1>
              <p className="text-white/60">Complete guide to get your app live</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Download className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold">Step 1: Export Your Project</h2>
            </div>
            <div className="space-y-3 text-white/80">
              <p>1. Go to the Projects tab</p>
              <p>2. Click the Export button on your project</p>
              <p>3. Extract the downloaded ZIP file to a folder</p>
              <p>4. Open Terminal/Command Prompt in that folder</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold">Step 2: Install Dependencies</h2>
            </div>
            <div className="space-y-3">
              <p className="text-white/80">Run this command to install all required packages:</p>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                <code className="text-orange-400">{commands.install}</code>
                <button
                  onClick={() => copyToClipboard(commands.install, 'install')}
                  className="glass-button p-2"
                  title="Copy command"
                >
                  {copiedCommand === 'install' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold">Step 3: Test on Your Phone</h2>
            </div>
            <div className="space-y-4">
              <p className="text-white/80">Start the development server:</p>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                <code className="text-orange-400">{commands.start}</code>
                <button
                  onClick={() => copyToClipboard(commands.start, 'start')}
                  className="glass-button p-2"
                  title="Copy command"
                >
                  {copiedCommand === 'start' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                <p className="text-sm text-blue-400 font-medium mb-2">Download Expo Go App:</p>
                <div className="flex gap-4">
                  <a
                    href="https://apps.apple.com/app/expo-go/id982107779"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button px-4 py-2 flex items-center gap-2 text-sm"
                  >
                    iOS App Store
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=host.exp.exponent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button px-4 py-2 flex items-center gap-2 text-sm"
                  >
                    Google Play
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <p className="text-white/80 text-sm">Scan the QR code with your phone camera to test your app!</p>
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-2 rounded-lg">
                <Rocket className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Step 4: Build for App Stores</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white/80 mb-3">First, install EAS CLI (Expo Application Services):</p>
                <div className="bg-black/40 p-4 rounded-lg font-mono text-sm flex items-center justify-between mb-4">
                  <code className="text-orange-400">{commands.easInstall}</code>
                  <button
                    onClick={() => copyToClipboard(commands.easInstall, 'easInstall')}
                    className="glass-button p-2"
                    title="Copy command"
                  >
                    {copiedCommand === 'easInstall' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-white/80 mb-3">Log in to your Expo account (create one at expo.dev if needed):</p>
                <div className="bg-black/40 p-4 rounded-lg font-mono text-sm flex items-center justify-between mb-4">
                  <code className="text-orange-400">{commands.easLogin}</code>
                  <button
                    onClick={() => copyToClipboard(commands.easLogin, 'easLogin')}
                    className="glass-button p-2"
                    title="Copy command"
                  >
                    {copiedCommand === 'easLogin' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <p className="font-medium mb-2 text-orange-400">Build for iOS:</p>
                    <div className="bg-black/40 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                      <code className="text-white/80">{commands.easBuildIOS}</code>
                      <button
                        onClick={() => copyToClipboard(commands.easBuildIOS, 'easBuildIOS')}
                        className="glass-button p-1.5"
                        title="Copy command"
                      >
                        {copiedCommand === 'easBuildIOS' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <p className="font-medium mb-2 text-orange-400">Build for Android:</p>
                    <div className="bg-black/40 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                      <code className="text-white/80">{commands.easBuildAndroid}</code>
                      <button
                        onClick={() => copyToClipboard(commands.easBuildAndroid, 'easBuildAndroid')}
                        className="glass-button p-1.5"
                        title="Copy command"
                      >
                        {copiedCommand === 'easBuildAndroid' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-sm text-yellow-400 font-medium mb-2">Requirements:</p>
                <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                  <li>iOS: Apple Developer Account ($99/year)</li>
                  <li>Android: Google Play Developer Account ($25 one-time)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-xl font-bold">Step 5: Submit to Stores</h2>
            </div>
            <div className="space-y-4">
              <p className="text-white/80">Once your build is complete, submit it to the stores:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <p className="font-medium mb-2 text-orange-400">Submit to App Store:</p>
                  <div className="bg-black/40 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                    <code className="text-white/80">{commands.easSubmitIOS}</code>
                    <button
                      onClick={() => copyToClipboard(commands.easSubmitIOS, 'easSubmitIOS')}
                      className="glass-button p-1.5"
                      title="Copy command"
                    >
                      {copiedCommand === 'easSubmitIOS' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <p className="font-medium mb-2 text-orange-400">Submit to Google Play:</p>
                  <div className="bg-black/40 p-3 rounded-lg font-mono text-xs flex items-center justify-between">
                    <code className="text-white/80">{commands.easSubmitAndroid}</code>
                    <button
                      onClick={() => copyToClipboard(commands.easSubmitAndroid, 'easSubmitAndroid')}
                      className="glass-button p-1.5"
                      title="Copy command"
                    >
                      {copiedCommand === 'easSubmitAndroid' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-6 bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30">
            <h3 className="text-lg font-bold mb-3">Need Help?</h3>
            <div className="space-y-3 text-sm text-white/80">
              <p>Check out these resources:</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://docs.expo.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button px-4 py-2 flex items-center gap-2"
                >
                  Expo Documentation
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://docs.expo.dev/build/introduction/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button px-4 py-2 flex items-center gap-2"
                >
                  EAS Build Guide
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://docs.expo.dev/submit/introduction/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button px-4 py-2 flex items-center gap-2"
                >
                  EAS Submit Guide
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
