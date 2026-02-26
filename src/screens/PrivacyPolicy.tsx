import { ChevronLeft } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6 pb-24">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy for Sondare</h1>
        <p className="text-sm text-slate-600 mb-8">Last Updated: October 16, 2025</p>

        <section className="space-y-6 text-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Introduction</h2>
            <p>Sondare ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Information We Collect</h2>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Email Address:</strong> Used for account creation and authentication</li>
              <li><strong>User Profile:</strong> Basic profile information including username and account settings</li>
              <li><strong>Project Data:</strong> App designs, prompts, and generated content you create</li>
            </ul>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Usage Data:</strong> Information about how you interact with the app</li>
              <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers</li>
              <li><strong>Log Data:</strong> Error reports and performance data</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain our service</li>
              <li>Create and manage your account</li>
              <li>Generate AI-powered app designs based on your prompts</li>
              <li>Track your credit usage for app generation</li>
              <li>Improve and optimize our application</li>
              <li>Communicate with you about updates and support</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Data Storage and Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your data is stored securely using Supabase, a secure cloud database provider</li>
              <li>We use industry-standard encryption for data transmission</li>
              <li>Authentication is handled securely through Supabase Auth</li>
              <li>We implement appropriate security measures to protect against unauthorized access</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <div className="mb-3">
              <h3 className="text-lg font-medium text-slate-800 mb-1">Supabase</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Purpose:</strong> Database, authentication, and backend services</li>
                <li><strong>Data Shared:</strong> Email, user profile, project data</li>
                <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" className="text-orange-600 hover:underline">https://supabase.com/privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-1">AI Service Provider</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Purpose:</strong> Generate app designs from your prompts</li>
                <li><strong>Data Shared:</strong> Your text prompts only</li>
                <li><strong>Note:</strong> Prompts are processed to generate designs and not stored permanently by the AI service</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Your Data Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your project data</li>
              <li>Opt-out of communications</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at support@sondare.com</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Active account data is retained while your account is active</li>
              <li>If you delete your account, your data will be permanently deleted within 30 days</li>
              <li>Backup copies may be retained for up to 90 days for disaster recovery purposes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Children's Privacy</h2>
            <p>Sondare is not intended for users under 13 years of age. We do not knowingly collect information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Changes to This Privacy Policy</h2>
            <p className="mb-2">We may update this Privacy Policy from time to time. We will notify you of any changes by:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Posting the new Privacy Policy in the app</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending you an email notification for material changes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">California Privacy Rights</h2>
            <p className="mb-2">If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (Note: We do not sell your personal information)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact Us</h2>
            <p className="mb-2">If you have questions about this Privacy Policy, please contact us at:</p>
            <p><strong>Email:</strong> support@sondare.com</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Consent</h2>
            <p>By using Sondare, you consent to this Privacy Policy and agree to its terms.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
