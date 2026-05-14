/** API types — kept in sync with com.mofassa.swiftpay.payment.api.dto.* */

/* ============ Enums ============ */
export type AliasType   = 'MOBILE' | 'IBAN';
export type PartyType   = 'MERCHANT' | 'AGGREGATOR';
export type RtpType     = 'NOW' | 'LATER';
export type RtpStatus   = 'INITIATED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type LookupStatus= 'RESOLVED' | 'UNRESOLVED' | 'EXPIRED';

/* ============ Auth ============ */
export interface TokenRequest {
  clientId: string;
  clientSecret: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
}

/* ============ Alias lookup ============ */
export interface AliasLookupRequest {
  aliasType: AliasType;
  aliasValue: string;
  channel: string;
}

export interface AliasLookupResponse {
  lookupId: string;
  resolved: boolean;
  accountTitle: string | null;
  maskedAccount: string | null;
  raastId: string | null;
  source: string;
  correlationId: string;
}

/* ============ RTP ============ */
export interface CreateRtpRequest {
  lookupId: string;
  partyType: PartyType;
  rtpType: RtpType;
  merchantId: string;
  instructedAmount: string;
  expiryDateTime: string;
  transactionType?: string;
  billNo?: string;
  channel: string;
}

export interface CreateRtpResponse {
  paymentRequestId: string;
  rtpId: string;
  status: RtpStatus;
  responseCode: string;
  responseDescription: string;
  correlationId: string;
}

export interface StatusInquiryResponse {
  rtpId: string;
  status: RtpStatus;
  responseCode: string;
  responseDescription: string;
}

export interface CancelRtpResponse {
  rtpId: string;
  status: RtpStatus;
  responseCode: string;
  responseDescription: string;
}

/* ============ Generic ============ */
export interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  correlationId?: string;
  fieldErrors?: Record<string, string>;
}

/* ============ UI-only domain types ============ */
/** A request-to-pay flattened for the UI's lists/detail screens. */
export interface RtpRow {
  id: string;             // RTP-id
  paymentRequestId?: string;
  counterpartyName: string;
  alias: string;
  aliasType: AliasType;
  amount: number;
  currency: 'PKR';
  status: RtpStatus;
  rtpType: RtpType;
  direction: 'IN' | 'OUT';
  note?: string;
  createdAt: string;
  expiresAt?: string;
  idempotencyKey?: string;
  correlationId?: string;
}
