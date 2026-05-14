import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface State {
  error: Error | null;
}

/** App-level safety net.
 *  Catches synchronous render errors and presents a recoverable shell instead
 *  of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Hook this up to your error-reporting service (Sentry, Datadog, etc.)
     
    console.error('[SwiftPay] Unhandled render error', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-8">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow)]">
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-danger-2 text-danger">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold tracking-tight">
                Something went wrong
              </h1>
              <p className="mt-1 text-sm text-text-2">
                The page hit an unexpected error. You can reload, or head back
                to the dashboard.
              </p>
              <pre className="mt-3 max-h-32 overflow-auto rounded-md bg-surface-2 p-3 font-mono text-[11px] text-text-3">
                {this.state.error.message}
              </pre>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={this.reset}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium hover:bg-surface-3"
                >
                  Try again
                </button>
                <a
                  href="/"
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg hover:opacity-90"
                >
                  Go home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
