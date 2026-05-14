import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

/** Shared TanStack Query client.
 *  - 30s stale time keeps the dashboard from re-fetching on every focus
 *  - Retries only network/5xx errors (not 4xx, which are usually deterministic) */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          const status = error.response?.status ?? 0;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
