export {};
declare global {
  const __BERRIQ_DESIGN_PREVIEW__: boolean;

  interface Window {
    __MANUS_CONFIG__?: {
      projectId: string; oauthPortalUrl: string; apiUrl: string; apiBrowserKey: string;
    };
  }
}
