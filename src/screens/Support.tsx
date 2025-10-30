export function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6 pb-24">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Sondare Support</h1>

        <section className="space-y-6 text-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact Information</h2>
            <p className="mb-2">For support, questions, or feedback, please reach out to us:</p>
            <p><strong>Email:</strong> support@sondare.com</p>
            <p className="text-sm text-slate-600"><strong>Response Time:</strong> We aim to respond within 24-48 hours</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Before Contacting Support</h2>
            <p className="mb-2">Please check the following resources:</p>
            <h3 className="text-lg font-medium text-slate-800 mb-2 mt-4">In-App Help</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Review the onboarding tutorial</li>
              <li>Check the How-To guide in the app</li>
              <li>Try the interactive tutorial on the Design tab</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Common Issues</h2>

            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-2">Cannot Log In</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verify your email address is correct</li>
                <li>Check your internet connection</li>
                <li>Try resetting your password</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-2">Out of Credits</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Credits are used for AI app generation</li>
                <li>Check your remaining credits in the Home tab</li>
                <li>New users receive free credits</li>
                <li>Additional credits will be available through subscription (coming soon)</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-2">App Generation Failed</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ensure you have sufficient credits</li>
                <li>Check your internet connection</li>
                <li>Try simplifying your prompt</li>
                <li>Make sure the prompt describes an app concept</li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-2">Cannot See My Projects</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ensure you're logged in with the correct account</li>
                <li>Check the Projects tab</li>
                <li>Try refreshing by pulling down on the screen</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Feature Requests</h2>
            <p className="mb-2">We love hearing your ideas! Email us at:</p>
            <p><strong>Email:</strong> feedback@sondare.com</p>
            <p className="mt-3 mb-2">Please include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>A clear description of the feature</li>
              <li>Why it would be valuable</li>
              <li>Any examples or mockups (optional)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Bug Reports</h2>
            <p className="mb-2">Found a bug? Help us fix it by providing:</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Description of what happened</li>
              <li>What you expected to happen</li>
              <li>Steps to reproduce the issue</li>
              <li>Device and OS version</li>
              <li>Screenshots (if applicable)</li>
            </ul>
            <p>Email bug reports to: <strong>support@sondare.com</strong></p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Privacy & Legal</h2>
            <ul className="space-y-2">
              <li>
                <a href="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-orange-600 hover:underline">Terms of Service</a>
              </li>
            </ul>
            <p className="mt-4">For privacy-related questions: <strong>privacy@sondare.com</strong></p>
            <p>For legal inquiries: <strong>legal@sondare.com</strong></p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Business Inquiries</h2>
            <p>For partnerships, press, or business inquiries:</p>
            <p><strong>Email:</strong> business@sondare.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
