// The only place errors and events are reported. No vendor today: logs in development,
// does nothing in production. Adding a vendor requires updating the privacy policy.

type EventProps = Record<string, string | number | boolean>;

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export function reportError(error: unknown): void {
  if (isDev) console.warn('[telemetry] error', error);
}

export function trackEvent(name: string, props?: EventProps): void {
  if (isDev) console.log('[telemetry] event', name, props ?? {});
}
