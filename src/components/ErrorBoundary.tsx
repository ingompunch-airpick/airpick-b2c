import React, { type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../lib/errorReport';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentStack = String(errorInfo.componentStack || '').trim().split('\n').slice(0, 6).join('\n');
    const withComponents = new Error(error.message);
    withComponents.stack = `${error.stack || ''}\n--- components ---\n${componentStack}`;
    reportError('crash', withComponents);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 text-neutral-900">
          <div className="max-w-sm text-center">
            <h1 className="text-lg font-bold">화면을 불러오지 못했습니다</h1>
            <p className="mt-2 text-sm text-neutral-600">잠시 후 다시 시도해 주세요.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
