export function usePanelSession() {
  return useState<{ csrf: string; expiresAt: string } | null>('panel-session', () => null)
}
