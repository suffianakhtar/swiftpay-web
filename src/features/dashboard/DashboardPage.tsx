import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Copy, Plus, QrCode,
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Sparkline } from '@/components/shared/Sparkline';
import { Avatar } from '@/components/shared/Avatar';
import { StatusPill } from '@/components/shared/StatusPill';
import { MOCK_USER, MOCK_CONTACTS, MOCK_TREND_14D } from '@/mock/data';
import { useRequests } from '@/features/requests/api';
import { CreateRtpDialog } from '@/features/requests/CreateRtpDialog';
import { fmtPKR, relTime, cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  if (isAdmin) return <AdminOverview />;
  return <UserOverview />;
}

/* ----------------------------- User -------------------------------------- */

function UserOverview() {
  const [createOpen, setCreate] = useState(false);
  const { data: rows = [] } = useRequests();
  const recent = rows.slice(0, 6);

  return (
    <div className="animate-fade-in flex flex-col gap-4.5 p-5">
      <header>
        <p className="text-[13px] text-text-2">Welcome back, {user_first(MOCK_USER.name)}</p>
        <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}
        </h2>
      </header>

      <div className="grid grid-cols-4 gap-3.5">
        <StatCard label="Available balance"  value={fmtPKR(MOCK_USER.balance)} trend={MOCK_TREND_14D}                       color="var(--c-accent)" />
        <StatCard label="Collected — 7 days" value={fmtPKR(184_220)} delta={12.4} trend={[22, 31, 28, 42, 38, 51, 55]}        color="var(--c-success)" />
        <StatCard label="Sent — 7 days"      value={fmtPKR(76_490)}  delta={-4.1} trend={[14, 18, 12, 21, 17, 14, 11]}        color="var(--c-warn)" />
        <StatCard label="Pending requests"   value="3"               delta={0}    trend={[2, 3, 1, 4, 3, 3, 3]}               color="var(--c-text-2)" />
      </div>

      <div className="grid grid-cols-[1fr_1.45fr] gap-4.5">
        {/* Quick send */}
        <Card className="p-4.5">
          <header className="mb-3.5 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Quick send</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCreate(true)}>
              All contacts <ArrowRight className="size-3" />
            </Button>
          </header>

          <div className="grid grid-cols-5 gap-2.5">
            <ContactTile name="New" tone="dashed" onClick={() => setCreate(true)} />
            {MOCK_CONTACTS.map((c) => (
              <ContactTile key={c.handle} name={c.name} tone={c.tone} onClick={() => setCreate(true)} />
            ))}
          </div>

          <div className="mt-4.5 flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-3">
            <div className="grid size-8 place-items-center rounded-lg bg-info-2 text-accent">
              <QrCode className="size-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Your Raast alias</div>
              <div className="font-mono text-[11.5px] text-text-3">
                {MOCK_USER.mobile} · {MOCK_USER.bank}
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="text-xs"
              onClick={() => { navigator.clipboard.writeText(MOCK_USER.mobile); toast.success('Copied'); }}
            >
              <Copy className="size-3" /> Copy
            </Button>
          </div>
        </Card>

        {/* Daily flow */}
        <Card className="p-4.5">
          <header className="mb-2 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold">Daily flow</h3>
              <p className="text-xs text-text-2">Last 14 days · PKR</p>
            </div>
            <div className="flex gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5">
              {['7D', '14D', '30D', '90D'].map((r, i) => (
                <button
                  key={r}
                  className={cn(
                    'rounded-md px-2 py-1 text-[11px] font-medium',
                    i === 1 ? 'bg-surface text-text shadow-[var(--shadow-sm)]' : 'text-text-2',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </header>
          <div className="mt-3.5">
            <Sparkline data={MOCK_TREND_14D} height={150} color="var(--c-accent)" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] text-text-3 tnum">
            <span>May 01</span><span>May 05</span><span>May 09</span><span>May 14</span>
          </div>
        </Card>
      </div>

      {/* Recent requests */}
      <Card>
        <header className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">Recent requests</h3>
          <Button variant="ghost" size="sm" className="ml-auto text-xs" asChild>
            <Link to="/requests">See all <ArrowRight className="size-3" /></Link>
          </Button>
        </header>
        <div>
          {recent.map((r) => {
            const isIn = r.direction === 'IN';
            return (
              <Link
                key={r.id}
                to={`/requests/${r.id}`}
                className="grid grid-cols-[1.4fr_1.1fr_0.8fr_0.9fr_110px_36px] items-center gap-3.5 border-b border-border px-4 py-3 text-[13px] last:border-b-0 hover:bg-surface-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className={cn('grid size-6 shrink-0 place-items-center rounded-md',
                    isIn ? 'bg-success-2 text-success' : 'bg-info-2 text-accent')}>
                    {isIn ? <ArrowDownToLine className="size-3" /> : <ArrowUpRight className="size-3" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{r.counterpartyName}</div>
                    <div className="font-mono text-[11px] text-text-3">{r.id}</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-text-2">{r.alias}</div>
                <div className={cn('tnum font-semibold', isIn && 'text-success')}>
                  {isIn ? '+' : ''}{fmtPKR(r.amount)}
                </div>
                <div className="text-xs text-text-2">{relTime(r.createdAt)}</div>
                <StatusPill status={r.status} />
                <ArrowRight className="size-3.5 justify-self-end text-text-3" />
              </Link>
            );
          })}
        </div>
      </Card>

      <CreateRtpDialog open={createOpen} onOpenChange={setCreate} />
    </div>
  );
}

function ContactTile({
  name, tone, onClick,
}: { name: string; tone: string; onClick: () => void }) {
  const isDashed = tone === 'dashed';
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-xl p-3.5 transition-colors hover:bg-surface-2">
      {isDashed ? (
        <div className="grid size-9 place-items-center rounded-full border border-dashed border-border-2 bg-surface-2 text-text-2">
          <Plus className="size-4" />
        </div>
      ) : (
        <Avatar name={name} size={36} tone={tone} />
      )}
      <span className="max-w-[70px] truncate text-[11px]">{name.split(' ')[0]}</span>
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

function user_first(n: string): string {
  return n.split(' ')[0] ?? n;
}

/* ---------------------------- Admin ------------------------------------- */

function AdminOverview() {
  return (
    <div className="animate-fade-in flex flex-col gap-4.5 p-5">
      <header className="flex items-center gap-3.5">
        <div>
          <p className="text-[13px] text-text-2">Operator console</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">System overview</h2>
        </div>
        <div className="ml-auto inline-flex items-center gap-2.5 rounded-lg border border-[color-mix(in_oklab,var(--c-success)_30%,transparent)] bg-success-2 px-3 py-1.5 text-[12.5px] font-medium text-success">
          <span className="size-2 rounded-full bg-success animate-pulse-ring" />
          All systems operational
        </div>
      </header>

      <div className="grid grid-cols-4 gap-3.5">
        <StatCard label="Volume today"        value="Rs 14.58M"           trend={MOCK_TREND_14D}                color="var(--c-accent)" />
        <StatCard label="Transactions today"  value="1,248"      delta={8.2}  trend={[120, 140, 152, 168, 170, 180, 194]} color="var(--c-success)" />
        <StatCard label="Success rate"        value="98.4%"      delta={0.3}  trend={[97.8, 98.1, 97.9, 98.4, 98.5, 98.4, 98.4]} color="var(--c-success)" />
        <StatCard label="Pending now"         value="37"         delta={-12}  trend={[44, 52, 48, 41, 39, 42, 37]} color="var(--c-warn)" />
      </div>

      <Card className="p-4">
        <p className="text-sm text-text-2">
          Admin views are scaffolded in <code className="font-mono text-xs">src/features/system</code>,{' '}
          <code className="font-mono text-xs">/clients</code>, and{' '}
          <code className="font-mono text-xs">/audit</code> — see the README for the full feature map.
        </p>
      </Card>
    </div>
  );
}
