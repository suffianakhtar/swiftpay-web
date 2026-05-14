import { Activity } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Sparkline } from '@/components/shared/Sparkline';
import { cn } from '@/lib/utils';

const UPSTREAM = [
  { name:'/preRTPAliasInquiry',          p50:132, p95:318, err:0.04, trend:[2,3,1,4,3,3,3,4,2,3] },
  { name:'/preRTPAliasInquiryAggregator',p50:168, p95:410, err:0.12, trend:[4,3,5,4,6,3,5,4,4,5] },
  { name:'/preRTPTitleFetch',            p50:168, p95:386, err:0.08, trend:[2,3,4,2,3,2,3,4,3,3] },
  { name:'/rtpNowMerchant',              p50:142, p95:340, err:0.21, trend:[5,6,4,7,5,6,7,5,6,8] },
  { name:'/rtpNowAggregator',            p50:152, p95:358, err:0.18, trend:[4,5,4,6,5,4,5,5,5,7] },
  { name:'/rtpLaterMerchant',            p50:138, p95:332, err:0.06, trend:[1,2,1,3,2,2,3,1,2,2] },
  { name:'/rtpLaterAggregator',          p50:156, p95:364, err:0.11, trend:[2,3,3,4,3,3,4,3,3,4] },
  { name:'/statusInquiry',               p50:89,  p95:220, err:0.02, trend:[8,9,7,10,8,9,8,9,10,9] },
  { name:'/rtpCancellation',             p50:104, p95:268, err:0.05, trend:[1,1,2,1,1,2,1,1,2,1] },
];

export default function SystemHealthPage() {
  return (
    <div className="animate-fade-in p-5">
      <header className="mb-3.5 flex items-end gap-3.5">
        <div className="flex-1">
          <p className="text-[13px] text-text-2">Live status of the SwiftPay payment service and its upstream dependencies.</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">System health</h2>
        </div>
        <Button variant="default"><Activity className="size-3.5" /> Open status page</Button>
      </header>

      <div className="mb-3.5 grid grid-cols-4 gap-3.5">
        <Stat label="P50 latency" value="142 ms" delta={-2.1} trend={[160,152,148,144,140,142,142]}     color="var(--c-success)" />
        <Stat label="P95 latency" value="384 ms" delta={1.4}  trend={[380,376,372,380,388,384,384]}     color="var(--c-warn)" />
        <Stat label="Error rate"  value="0.16%"  delta={-12}  trend={[.3,.22,.18,.16,.14,.16,.16]}      color="var(--c-success)" />
        <Stat label="CB state"    value="CLOSED"              trend={[1,1,1,1,1,1,1]}                   color="var(--c-success)" />
      </div>

      <Card>
        <header className="border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">1LINK upstream endpoints</h3>
        </header>
        <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.8fr_1fr] gap-3 border-b border-border bg-surface-2 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-3">
          <span>Endpoint</span><span>Status</span><span>P50</span><span>P95</span><span>Error rate</span><span>Last 1h</span>
        </div>
        {UPSTREAM.map((e, i) => (
          <div
            key={e.name}
            className={cn(
              'grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.8fr_1fr] items-center gap-3 px-4 py-3 text-[12.5px]',
              i < UPSTREAM.length - 1 && 'border-b border-border',
            )}
          >
            <span className="font-mono">{e.name}</span>
            <span className="flex items-center gap-1.5 text-success">
              <span className="size-1.5 rounded-full bg-success" /> OK
            </span>
            <span className="tnum">{e.p50} ms</span>
            <span className={cn('tnum', e.p95 > 350 ? 'text-warn' : '')}>{e.p95} ms</span>
            <span className={cn('tnum', e.err > 0.15 ? 'text-warn' : 'text-text-2')}>{e.err}%</span>
            <div className="w-[120px]"><Sparkline data={e.trend} color="var(--c-accent)" height={22} /></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Stat({ label, value, delta, trend, color }: { label: string; value: string; delta?: number; trend: number[]; color: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-text-2">{label}</div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <div className="tnum text-[22px] font-semibold tracking-[-0.02em]">{value}</div>
        <div className="w-[70px]"><Sparkline data={trend} color={color} height={26} /></div>
      </div>
      {delta !== undefined && (
        <div className={cn('mt-1.5 text-xs', delta >= 0 ? 'text-success' : 'text-danger')}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last 7d
        </div>
      )}
    </Card>
  );
}
