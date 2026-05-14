/** Environment configuration — strongly-typed access to import.meta.env. */
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) ?? '/api/v1',
  clientId:   (import.meta.env.VITE_CLIENT_ID as string) ?? '',
  envLabel:   (import.meta.env.VITE_ENV_LABEL as string) ?? 'local',
  isProd:     import.meta.env.PROD,
  isDev:      import.meta.env.DEV,
} as const;
