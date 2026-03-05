import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md text-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-white/60">
              The app encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-black/50 p-4 rounded-lg text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="accent-button w-full py-3 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
