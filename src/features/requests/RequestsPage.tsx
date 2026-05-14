import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpRight, ChevronRight, ListFilter, Plus, Search } from 'lucide-react';
import { Badge, Button, Card, Input } from '@/components/ui';
import { useRequests } from './api';
import { RequestDetailDrawer } from './DetailDrawer';
import { CreateRtpDialog } from './CreateRtpDialog';
import { Sparkline } from '@/components/shared/Sparkline';
import { StatusPill } from '@/components/shared/StatusPill';
import { fmtPKR, relTime, cn } from '@/lib/utils';
import type { RtpRow, RtpStatus } from '@/types/api';
import { useTranslation } from 'react-i18next';

const STATUSES: Array<{ id: 'all' | Lowercase<RtpStatus>; label: string }> = [
  { id: 'all',       label: 'All' },
  { id: 'pending',   label: 'Pending' },
  { id: 'accepted',  label: 'Accepted' },
  { id: 'rejected',  label: 'Rejected' },
  { id: 'expired',   label: 'Expired' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function RequestsPage() {
  const { t } = useTranslation();
  const { data: rows = [], isLoading } = useRequests();
  const { rtpId } = useParams<{ rtpId?: string }>();
  const navigate  = useNavigate();
  const [q, setQ]                 = useState('');
  const [statusFilter, setStatus] = useState<(typeof STATUSES)[number]['id']>('all');
  const [createOpen, setCreate]   = useState(false);

  const selected = useMemo(
    () => (rtpId ? rows.find((r) => r.id === rtpId) ?? null : null),
    [rtpId, rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (q && !((r.counterpartyName + r.id + r.alias).toLowerCase().includes(q.toLowerCase()))) return false;
      if (statusFilter !== 'all' && r.status.toLowerCase() !== statusFilter) return false;
      return true;
    });
  }, [rows, q, statusFilter]);

  const accepted = filtered.filter((r) => r.status === 'ACCEPTED').length;
  const pending  = filtered.filter((r) => r.status === 'PENDING').length;
  const failed   = filtered.filter((r) => r.status === 'REJECTED' || r.status === 'EXPIRED').length;
  const net      = filtered.reduce((s, r) => s + (r.direction === 'IN' ? r.amount : -r.amount), 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-end gap-3.5 px-5 pt-5 pb-3.5">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-text-2">{filtered.length} of {rows.length} requests</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">Requests</h2>
        </div>
        <Button variant="default"><ArrowDownToLine className="size-3.5" /> Export CSV</Button>
        <Button variant="primary" onClick={() => setCreate(true)}>
          <Plus className="size-3.5" /> {t('rtp.new')}
        </Button>
      </div>

      <div className="px-5 pb-5">
        {/* Stat cards */}
        <div className="mb-3.5 grid grid-cols-4 gap-3.5">
          <StatCard label="Volume (net)" value={fmtPKR(Math.abs(net))} delta={2.1} trend={[8, 12, 9, 14, 11, 18, 16]} />
          <StatCard label="Accepted"     value={accepted}                delta={5}    trend={[5, 7, 6, 8, 9, 8, 10]} color="var(--c-success)" />
          <StatCard label="Pending"      value={pending}                 delta={-1}   trend={[3, 3, 2, 2, 1, 2, 1]}  color="var(--c-warn)" />
          <StatCard label="Rejected / Expired" value={failed}            delta={0}    trend={[1, 1, 2, 1, 1, 1, 1]}  color="var(--c-danger)" />
        </div>

        {/* Filter bar */}
        <Card className="mb-3.5 flex flex-wrap items-center gap-2 px-3 py-2.5">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-2.5 top-2 size-3.5 text-text-3" />
            <Input
              placeholder="Search by name, RTP ID, alias…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-8 bg-surface-2 pl-9 text-[13px]"
            />
          </div>
          <div className="flex gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium',
                  statusFilter === s.id
                    ? 'bg-surface text-text shadow-[var(--shadow-sm)]'
                    : 'text-text-2',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Button variant="default" size="sm" className="ml-auto h-8">
            <ListFilter className="size-3.5" /> Filters
          </Button>
        </Card>

        {/* Table */}
        <Card>
          <div className="grid grid-cols-[1.4fr_1.1fr_0.8fr_0.9fr_110px_36px] gap-3.5 border-b border-border bg-surface-2 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-3">
            <span>Counterparty</span>
            <span>Alias</span>
            <span>Amount</span>
            <span>Time</span>
            <span>Status</span>
            <span />
          </div>

          {isLoading && (
            <div className="px-4 py-10 text-center text-sm text-text-3">{t('common.loading')}</div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-text-3">
              <p className="font-medium text-text">No matches</p>
              <p className="mt-1">Try clearing your filters.</p>
            </div>
          )}

          {filtered.slice(0, 30).map((r) => (
            <RtpRowItem key={r.id} row={r} onSelect={() => navigate(`/requests/${r.id}`)} />
          ))}

          {filtered.length > 30 && (
            <div className="flex items-center gap-2.5 border-t border-border px-4 py-2.5 text-xs text-text-2">
              Showing 1 – 30 of {filtered.length}
              <div className="ml-auto flex gap-1.5">
                <Button variant="default" size="sm" className="h-7 px-2 text-[11px]">‹ Prev</Button>
                <Button variant="primary" size="sm" className="h-7 px-2 text-[11px]">1</Button>
                <Button variant="default" size="sm" className="h-7 px-2 text-[11px]">2</Button>
                <Button variant="default" size="sm" className="h-7 px-2 text-[11px]">Next ›</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <RequestDetailDrawer
        rtp={selected}
        onOpenChange={(v) => { if (!v) navigate('/requests'); }}
      />
      <CreateRtpDialog open={createOpen} onOpenChange={setCreate} />
    </div>
  );
}

function RtpRowItem({ row, onSelect }: { row: RtpRow; onSelect: () => void }) {
  const isIn = row.direction === 'IN';
  return (
    <button
      onClick={onSelect}
      className="grid w-full grid-cols-[1.4fr_1.1fr_0.8fr_0.9fr_110px_36px] items-center gap-3.5 border-b border-border px-4 py-3 text-left text-[13px] transition-colors last:border-b-0 hover:bg-surface-2"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-md',
            isIn ? 'bg-success-2 text-success' : 'bg-info-2 text-accent',
          )}
        >
          {isIn ? <ArrowDownToLine className="size-3" /> : <ArrowUpRight className="size-3" />}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">{row.counterpartyName}</div>
          <div className="font-mono text-[11px] text-text-3">{row.id}</div>
        </div>
      </div>
      <div className="font-mono text-xs text-text-2">{row.alias}</div>
      <div className={cn('tnum font-semibold', isIn && 'text-success')}>
        {isIn ? '+' : ''}{fmtPKR(row.amount)}
      </div>
      <div className="text-xs text-text-2">{relTime(row.createdAt)}</div>
      <StatusPill status={row.status} />
      <ChevronRight className="size-3.5 justify-self-end text-text-3" />
    </button>
  );
}

function StatCard({
  label, value, delta, trend, color = 'var(--c-accent)',
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  trend: number[];
  color?: string;
}) {
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

// keeps Badge import tree-shake-safe while UI primitives are imported via barrel
void Badge;
