// Los destinos y condiciones reales deben aprobarse antes de conectar o publicar.
export const siteConfig = {
  loginUrl: null as string | null,
  trialUrl: null as string | null,
  contactUrl: null as string | null,
  privacyUrl: null as string | null,
  termsUrl: null as string | null,
  trialDurationDays: null as number | null,
  trialRequiresCard: null as boolean | null,
  analyticsEnabled: false,
} as const;

// Integración intencionalmente inactiva hasta configurar proveedor y consentimiento.
// El gestor de consentimiento real debe guardar 'granted' solo tras una elección afirmativa.
export function trackEvent(name: string, detail?: Record<string, string | number>) {
  if (!siteConfig.analyticsEnabled) return;
  try {
    if (window.localStorage.getItem('berriq-analytics-consent') !== 'granted') return;
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent('berriq:analytics', { detail: { name, ...detail } }));
}

// Solo conectar tras recibir una confirmación real del registro; no se invoca en la vista previa.
export function trackRegistrationCompleted() {
  trackEvent('registration_completed');
}
