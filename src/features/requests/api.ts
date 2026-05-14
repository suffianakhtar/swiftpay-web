import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { uuid } from '@/lib/utils';
import type {
  AliasLookupRequest, AliasLookupResponse,
  CancelRtpResponse, CreateRtpRequest, CreateRtpResponse,
  RtpRow, StatusInquiryResponse,
} from '@/types/api';
import { MOCK_RTPS, makeFakeRtps, sleep } from '@/mock/data';
import { env } from '@/lib/env';

/** Toggle to point the hooks at the real backend.
 *  Default: false — uses MOCK data so the scaffold is usable without a running
 *  Spring Boot instance. Flip to true once your /api/v1 is reachable. */
const USE_REAL_API = env.isProd; // dev = mock, prod = real

/* ============ Queries ============ */

export function useRequests() {
  return useQuery<RtpRow[]>({
    queryKey: ['rtps'],
    queryFn: async () => {
      if (!USE_REAL_API) {
        await sleep(200);
        return [...MOCK_RTPS, ...makeFakeRtps(18)];
      }
      // Real backend doesn't have a list endpoint yet — wire it up here.
      // const { data } = await api.get<RtpRow[]>('/rtp');
      // return data;
      return [];
    },
  });
}

/* ============ Mutations ============ */

interface ResolveAliasInput { aliasType: 'MOBILE' | 'IBAN'; aliasValue: string; }

export function useResolveAlias() {
  return useMutation<AliasLookupResponse, Error, ResolveAliasInput>({
    mutationFn: async (input) => {
      if (!USE_REAL_API) {
        await sleep(850);
        return {
          lookupId: uuid(),
          resolved: true,
          accountTitle: 'Hassan Ali',
          maskedAccount: input.aliasType === 'MOBILE' ? 'XXXX-XXX-4513' : 'PK36HABB••••4513',
          raastId: 'RST-PK-2294-' + Math.floor(Math.random() * 9000 + 1000),
          source: 'mock',
          correlationId: uuid(),
        };
      }
      const body: AliasLookupRequest = { ...input, channel: 'WEB' };
      const { data } = await api.post<AliasLookupResponse>('/aliases/resolve', body);
      return data;
    },
  });
}

interface CreateRtpInput extends Omit<CreateRtpRequest, 'channel'> {
  idempotencyKey?: string;
}

export function useCreateRtp() {
  const qc = useQueryClient();
  return useMutation<CreateRtpResponse, Error, CreateRtpInput>({
    mutationFn: async ({ idempotencyKey, ...body }) => {
      const key = idempotencyKey ?? uuid();
      if (!USE_REAL_API) {
        await sleep(1000);
        return {
          paymentRequestId: uuid(),
          rtpId: 'RTP-' + Math.floor(Math.random() * 9_000_000 + 2_410_000),
          status: 'PENDING',
          responseCode: '00',
          responseDescription: 'Accepted',
          correlationId: uuid(),
        };
      }
      const { data } = await api.post<CreateRtpResponse>('/rtp', { ...body, channel: 'WEB' }, {
        headers: { 'Idempotency-Key': key },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtps'] }),
  });
}

export function useStatusInquiry() {
  return useMutation<StatusInquiryResponse, Error, string>({
    mutationFn: async (rtpId) => {
      if (!USE_REAL_API) {
        await sleep(1100);
        return { rtpId, status: 'PENDING', responseCode: '00', responseDescription: 'Awaiting recipient' };
      }
      const { data } = await api.post<StatusInquiryResponse>(`/rtp/${rtpId}/status`);
      return data;
    },
  });
}

export function useCancelRtp() {
  const qc = useQueryClient();
  return useMutation<CancelRtpResponse, Error, string>({
    mutationFn: async (rtpId) => {
      if (!USE_REAL_API) {
        await sleep(1100);
        return { rtpId, status: 'CANCELLED', responseCode: '00', responseDescription: 'Cancelled' };
      }
      const { data } = await api.post<CancelRtpResponse>(`/rtp/${rtpId}/cancel`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rtps'] }),
  });
}
