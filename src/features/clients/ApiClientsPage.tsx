import { MoreHorizontal, Plus } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { relTime } from '@/lib/utils';

const CLIENTS = [
  { id:'cli_01', name:'merchant-portal-prod', tier:'PRODUCTION' as const, tps:42,  status:'ACTIVE' as const,  lastSeen:'2026-05-14T09:42:00' },
  { id:'cli_02', name:'mobile-app-prod',      tier:'PRODUCTION' as const, tps:118, status:'ACTIVE' as const,  lastSeen:'2026-05-14T09:42:00' },
  { id:'cli_03', name:'bookkeeping-readonly', tier:'READONLY'   as const, tps:2,   status:'ACTIVE' as const,  lastSeen:'2026-05-14T08:14:00' },
  { id:'cli_04', name:'staging-tests',        tier:'SANDBOX'    as const, tps:0,   status:'IDLE' as const,    lastSeen:'2026-05-12T17:14:00' },
  { id:'cli_05', name:'legacy-import-tool',   tier:'SANDBOX'    as const, tps:0,   status:'REVOKED' as const, lastSeen:'2025-11-04T11:00:00' },
];

const TIER_TONE: Record<typeof CLIENTS[number]['tier'], React.ComponentProps<typeof Badge>['tone']> = {
  PRODUCTION: 'info', READONLY: 'success', SANDBOX: 'neutral',
};
const STATUS_TONE: Record<typeof CLIENTS[number]['status'], React.ComponentProps<typeof Badge>['tone']> = {
  ACTIVE: 'success', IDLE: 'neutral', REVOKED: 'danger',
};

export default function ApiClientsPage() {
  return (
    <div className="animate-fade-in p-5">
      <header className="mb-3.5 flex items-end gap-3.5">
        <div className="flex-1">
          <p className="text-[13px] text-text-2">OAuth2 client_credentials clients allowed to issue JWTs.</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">API clients</h2>
        </div>
        <Button variant="primary"><Plus className="size-3.5" /> New client</Button>
      </header>

      <Card>
        <header className="border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">Registered clients</h3>
        </header>
        <div className="grid grid-cols-[1.4fr_120px_120px_110px_140px_36px] gap-3.5 border-b border-border bg-surface-2 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-3">
          <span>Client ID</span><span>Tier</span><span>TPS (1m)</span><span>Status</span><span>Last seen</span><span />
        </div>
        {CLIENTS.map((c, i) => (
          <div key={c.id} className={`grid grid-cols-[1.4fr_120px_120px_110px_140px_36px] items-center gap-3.5 px-4 py-3 text-[13px] ${i < CLIENTS.length - 1 ? 'border-b border-border' : ''}`}>
            <div>
              <div className="font-mono font-medium">{c.name}</div>
              <div className="font-mono text-[11px] text-text-3">{c.id}</div>
            </div>
            <Badge tone={TIER_TONE[c.tier]}>{c.tier}</Badge>
            <span className="tnum">{c.tps}</span>
            <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
            <span className="text-xs text-text-2">{relTime(c.lastSeen)}</span>
            <Button variant="ghost" size="icon" className="size-8 text-text-3"><MoreHorizontal className="size-4" /></Button>
          </div>
        ))}
      </Card>
    </div>
  );
}
