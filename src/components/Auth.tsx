import { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const { signUp, signIn, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage('Password reset link sent to your email!');
          setTimeout(() => {
            setIsForgotPassword(false);
            setSuccessMessage('');
          }, 3000);
        }
      } else {
        const { error } = isSignUp
          ? await signUp(email, password)
          : await signIn(email, password);

        if (error) {
          setError(error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Sondare</h1>
          <p className="text-white/60">
            {isForgotPassword ? 'Reset your password' : 'Ideas to apps in minutes'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white/80">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pl-11"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full accent-button py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isForgotPassword ? 'Sending...' : isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              <>{isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}</>
            )}
          </button>

          <div className="text-center space-y-2">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-white/60 hover:text-white transition-colors text-sm block w-full"
              >
                Forgot password?
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                } else {
                  setIsSignUp(!isSignUp);
                }
                setError('');
                setSuccessMessage('');
              }}
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              {isForgotPassword
                ? 'Back to sign in'
                : isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        {isSignUp && (
          <div className="glass-card p-4 text-center text-sm text-white/60">
            Get started with <span className="text-orange-500 font-semibold">3 free credits</span> to
            generate your first apps
          </div>
        )}
      </div>
    </div>
  );
}
