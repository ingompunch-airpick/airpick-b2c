import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

type ReportKind = 'crash' | 'error';

const context = { companyId: '', screen: '' };
const sentThisSession = new Set<string>();
const SESSION_LIMIT = 20;

/** 브라우저 확장, 화면 크기 경고처럼 우리 코드와 무관한 오류 */
const IGNORED = [
  /ResizeObserver loop/i,
  /chrome-extension:\/\//i,
  /safari-extension:\/\//i,
  /^Script error\.?$/i,
];

export function setErrorReportContext(next: { companyId?: string; screen?: string }): void {
  if (next.companyId !== undefined) context.companyId = next.companyId;
  if (next.screen !== undefined) context.screen = next.screen;
}

function send(kind: ReportKind, payload: { message: string; stack?: string }): Promise<void> {
  const call = httpsCallable(getFunctions(getApp(), 'us-central1'), 'reportClientError');
  return call({
    app: 'b2c',
    kind,
    ...payload,
    screen: context.screen,
    companyId: context.companyId,
    appBuild: String(import.meta.env.VITE_APP_BUILD || ''),
    platform: 'web',
  }).then(() => undefined);
}

/** 오류를 서버에 남긴다. 실패해도 화면 동작에는 영향을 주지 않는다. */
export function reportError(kind: ReportKind, error: unknown, where = ''): void {
  const err = error instanceof Error ? error : new Error(String(error ?? 'unknown'));
  const message = [where, err.message].filter(Boolean).join(': ').slice(0, 300);
  const stack = String(err.stack || '');
  if (!message || IGNORED.some((re) => re.test(message) || re.test(stack))) return;
  if (import.meta.env.DEV) return;

  const key = `${kind}|${message}|${context.screen}`;
  if (sentThisSession.has(key) || sentThisSession.size >= SESSION_LIMIT) return;
  sentThisSession.add(key);
  void send(kind, { message, stack }).catch(() => undefined);
}

let installed = false;

export function installGlobalErrorReporting(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (event) => {
    reportError('error', event.error ?? event.message, 'window');
  });
  window.addEventListener('unhandledrejection', (event) => {
    reportError('error', event.reason, 'promise');
  });
}
