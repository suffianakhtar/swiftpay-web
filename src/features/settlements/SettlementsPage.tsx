import { ArrowDownToLine, ChevronRight } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { Sparkline } from '@/components/shared/Sparkline';
import { fmtPKR, cn } from '@/lib/utils';

const SETTLEMENTS = [
  { id:'SET-20260514', date:'2026-05-14', bank:'Habib Bank Ltd.', iban:'PK36HABB••••4912', count:14, net:184_220, status:'IN_TRANSIT' },
  { id:'SET-20260513', date:'2026-05-13', bank:'Habib Bank Ltd.', iban:'PK36HABB••••4912', count:22, net:312_840, status:'SETTLED'    },
  { id:'SET-20260512', date:'2026-05-12', bank:'Habib Bank Ltd.', iban:'PK36HABB••••4912', count:17, net:248_510, status:'SETTLED'    },
  { id:'SET-20260511', date:'2026-05-11', bank:'Habib Bank Ltd.', iban:'PK36HABB••••4912', count:8,  net: 71_200, status:'SETTLED'    },
  { id:'SET-20260510', date:'2026-05-10', bank:'Habib Bank Ltd.', iban:'PK36HABB••••4912', count:11, net:142_900, status:'SETTLED'    },
  { id:'SET-20260509', date:'2026-05-09', bank:'Meezan Bank',     iban:'PK11MEZN••••8841', count:3,  net: 28_400, status:'SETTLED'    },
] as const;

export default function SettlementsPage() {
  return (
    <div className="animate-fade-in p-5">
      <header className="mb-3.5 flex items-end gap-3.5">
        <div className="flex-1">
          <p className="text-[13px] text-text-2">Money from accepted requests landing in your bank accounts.</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">Settlements</h2>
        </div>
        <Button variant="default"><ArrowDownToLine className="size-3.5" /> Export</Button>
      </header>

      <div className="mb-3.5 grid grid-cols-4 gap-3.5">
        <Stat label="In-transit"   value={fmtPKR(184_220)} trend={[8, 9, 7, 10, 9, 11, 12]} color="var(--c-warn)" />
        <Stat label="Settled · 7d" value={fmtPKR(803_850)} delta={9.4} trend={[110, 142, 108, 165, 148, 182, 194]} color="var(--c-success)" />
        <Stat label="Avg / day"    value={fmtPKR(114_835)} delta={5.1} trend={[100, 110, 108, 115, 118, 120, 122]} color="var(--c-accent)" />
        <Stat label="Fees · 7d"    value="Free"            trend={[0, 0, 0, 0, 0, 0, 0]}     color="var(--c-text-2)" />
      </div>

      <Card>
        <header className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">Recent settlements</h3>
        </header>
        <div className="grid grid-cols-[140px_1.4fr_100px_1fr_120px_36px] gap-3.5 border-b border-border bg-surface-2 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-3">
          <span>Date</span><span>Bank account</span><span>Requests</span><span>Net</span><span>Status</span><span />
        </div>
        {SETTLEMENTS.map((s) => (
          <div key={s.id} className="grid grid-cols-[140px_1.4fr_100px_1fr_120px_36px] gap-3.5 items-center border-b border-border px-4 py-3 text-[13px] last:border-b-0">
            <div>
              <div className="font-medium">
                {new Date(s.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short' })}
              </div>
              <div className="font-mono text-[11px] text-text-3">{s.id}</div>
            </div>
            <div>
              <div>{s.bank}</div>
              <div className="font-mono text-[11px] text-text-3">{s.iban}</div>
            </div>
            <div className="tnum text-text-2">{s.count}</div>
            <div className="tnum font-semibold">{fmtPKR(s.net)}</div>
            <Badge tone={s.status === 'SETTLED' ? 'success' : 'warn'}>
              {s.status.replace('_', ' ')}
            </Badge>
            <ChevronRight className="size-3.5 justify-self-end text-text-3" />
          </div>
        ))}
      </Card>
    </div>
  );
}

function Stat({
  label, value, delta, trend, color,
}: { label: string; value: React.ReactNode; delta?: number; trend: number[]; color: string }) {
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
