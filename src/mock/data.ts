/** Mock data used by the scaffolded UI.
 *  Replace per-feature when the real API hooks land. Keeps the prototype
 *  flowing without needing a live backend. */

import type { RtpRow, RtpStatus } from '@/types/api';

export const MOCK_USER = {
  name: 'Ayesha Khan',
  email: 'ayesha.khan@nessovo.com',
  mobile: '0301-XXX-4521',
  iban: 'PK36HABB••••4912',
  bank: 'Habib Bank Ltd.',
  balance: 248_540,
  raastId: 'RST-PK-9821-4451',
};

export const MOCK_CONTACTS = [
  { name: 'Hassan Ali',     handle: '0300-XXX-4513', tone: '#0ea5e9' },
  { name: 'Sara Mahmood',   handle: '0345-XXX-8821', tone: '#a855f7' },
  { name: 'Mohammad Tariq', handle: '0333-XXX-2298', tone: '#22c55e' },
  { name: 'Bilal Ahmed',    handle: '0322-XXX-3340', tone: '#f59e0b' },
  { name: 'Saira Hussain',  handle: '0345-XXX-5512', tone: '#ef4444' },
];

export const MOCK_TREND_14D = [42, 38, 51, 47, 62, 58, 71, 69, 55, 78, 82, 74, 91, 86];

const baseRows: Array<Omit<RtpRow, 'aliasType' | 'currency' | 'rtpType'>> = [
  { id:'RTP-2410588', counterpartyName:'Hassan Ali',     alias:'0300-XXX-4513', amount: 18500, status:'PENDING',   direction:'OUT', note:'Office rent — May',  createdAt:'2026-05-14T09:32:11Z' },
  { id:'RTP-2410587', counterpartyName:'K-Electric',     alias:'PK36••••4912',  amount:  8240, status:'ACCEPTED',  direction:'OUT', note:'KE-Bill-09 May',     createdAt:'2026-05-14T08:11:00Z' },
  { id:'RTP-2410585', counterpartyName:'Sara Mahmood',   alias:'0345-XXX-8821', amount:  4200, status:'ACCEPTED',  direction:'IN',  note:'Dinner split',       createdAt:'2026-05-13T22:04:30Z' },
  { id:'RTP-2410583', counterpartyName:'FoodPanda',      alias:'0310-XXX-1011', amount:  1850, status:'ACCEPTED',  direction:'OUT', note:'Order #88241',       createdAt:'2026-05-13T18:50:00Z' },
  { id:'RTP-2410581', counterpartyName:'Mohammad Tariq', alias:'0333-XXX-2298', amount: 32000, status:'PENDING',   direction:'IN',  note:'Invoice 0421',       createdAt:'2026-05-13T14:20:00Z' },
  { id:'RTP-2410579', counterpartyName:'Daraz.pk',       alias:'PK22••••7741',  amount:  7299, status:'ACCEPTED',  direction:'OUT', note:'Order DZ-77441',     createdAt:'2026-05-13T11:02:00Z' },
  { id:'RTP-2410577', counterpartyName:'Bilal Ahmed',    alias:'0322-XXX-3340', amount:  1500, status:'REJECTED',  direction:'OUT', note:'Lunch',              createdAt:'2026-05-12T19:44:00Z' },
  { id:'RTP-2410573', counterpartyName:'Saira Hussain',  alias:'0345-XXX-5512', amount: 25000, status:'ACCEPTED',  direction:'IN',  note:'Freelance — March', createdAt:'2026-05-12T10:01:00Z' },
  { id:'RTP-2410570', counterpartyName:'PTCL',           alias:'PK10••••9921',  amount:  3850, status:'EXPIRED',   direction:'OUT', note:'Broadband',          createdAt:'2026-05-11T16:30:00Z' },
  { id:'RTP-2410566', counterpartyName:'Umar Sheikh',    alias:'0312-XXX-7782', amount:  6500, status:'CANCELLED', direction:'OUT', note:'—',                  createdAt:'2026-05-11T09:15:00Z' },
];

export const MOCK_RTPS: RtpRow[] = baseRows.map((r) => ({
  ...r,
  currency: 'PKR',
  aliasType: r.alias.startsWith('PK') ? 'IBAN' : 'MOBILE',
  rtpType: r.status === 'PENDING' ? 'LATER' : 'NOW',
  idempotencyKey: `idem_${r.id.slice(-7)}`,
  correlationId: `cor_${r.id.slice(-7)}`,
}));

export function makeFakeRtps(extra = 16): RtpRow[] {
  const names = ['Imran Sheikh','Faisal Mahmood','HBL Personal','UFone Bill','Adeel Raza','Zara Tariq','Telenor Bank','Easypaisa Inc.'];
  const statuses: RtpStatus[] = ['ACCEPTED','PENDING','REJECTED','EXPIRED','CANCELLED'];
  const out: RtpRow[] = [];
  for (let i = 0; i < extra; i++) {
    const name = names[i % names.length];
    const direction: 'IN' | 'OUT' = i % 3 === 0 ? 'IN' : 'OUT';
    const status   = statuses[i % statuses.length];
    const isIban   = i % 4 === 0;
    out.push({
      id: `RTP-2414${(i * 7).toString().padStart(3, '0')}`,
      counterpartyName: name,
      alias: isIban ? `PK22••••${1000 + i}` : `03${10 + (i % 80)}-XXX-${(1000 + i).toString().slice(-4)}`,
      aliasType: isIban ? 'IBAN' : 'MOBILE',
      amount: Math.floor(Math.random() * 60_000 + 800),
      currency: 'PKR',
      status,
      direction,
      rtpType: 'NOW',
      createdAt: new Date(Date.now() - i * 60_000 * 47).toISOString(),
      idempotencyKey: `idem_2414${(i * 7).toString().padStart(3, '0')}`,
      correlationId:  `cor_2414${(i * 7).toString().padStart(3, '0')}`,
    });
  }
  return out;
}

/** Sleep helper for the mock-API delay simulation. */
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
