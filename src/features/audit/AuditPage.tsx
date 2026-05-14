import { useState } from 'react';
import { Copy, Search } from 'lucide-react';
import { Badge, Button, Card, Input } from '@/components/ui';

const AUDIT = [
  { t:'2026-05-14T09:32:11', actor:'ayesha.khan',    action:'rtp.create',     resource:'RTP-2410588',  result:'success', cid:'cor_9e7421a4-2c3d' },
  { t:'2026-05-14T09:31:48', actor:'ayesha.khan',    action:'alias.resolve',  resource:'0300-XXX-4513',result:'success', cid:'cor_3b9a01ff-9d12' },
  { t:'2026-05-14T09:21:02', actor:'sp_live_8f2a',   action:'auth.token',     resource:'token',        result:'success', cid:'cor_2d11ba23-77ad' },
  { t:'2026-05-14T08:58:14', actor:'sp_live_c701',   action:'auth.token',     resource:'token',        result:'success', cid:'cor_a1b2c3d4-aaaa' },
  { t:'2026-05-14T08:11:00', actor:'ayesha.khan',    action:'rtp.create',     resource:'RTP-2410587',  result:'success', cid:'cor_fa10b7c2-7711' },
  { t:'2026-05-13T22:04:30', actor:'system',         action:'rtp.accept',     resource:'RTP-2410585',  result:'success', cid:'cor_07c0c0c0-0001' },
  { t:'2026-05-13T19:58:21', actor:'ayesha.khan',    action:'alias.register', resource:'al_004',       result:'pending', cid:'cor_5141cafe-1314' },
  { t:'2026-05-13T14:20:00', actor:'system',         action:'rtp.expire',     resource:'RTP-2410570',  result:'success', cid:'cor_dead0001-beef' },
  { t:'2026-05-13T11:02:14', actor:'mohammad.tariq', action:'rtp.cancel',     resource:'RTP-2410566',  result:'success', cid:'cor_99887766-aabb' },
  { t:'2026-05-13T09:01:00', actor:'sp_test_22ad',   action:'api.key.rotate', resource:'key_03',       result:'success', cid:'cor_11221122-3344' },
  { t:'2026-05-12T17:14:00', actor:'admin',          action:'webhook.create', resource:'wh_02',        result:'success', cid:'cor_ddee00ff-1100' },
  { t:'2026-05-12T16:48:00', actor:'system',         action:'cb.half_open',   resource:'onelink-read', result:'warn',    cid:'cor_8b8a8a8a-1212' },
];

export default function AuditPage() {
  const [q, setQ] = useState('');
  const rows = AUDIT.filter((a) =>
    !q || (a.actor + a.action + a.resource + a.cid).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="animate-fade-in p-5">
      <header className="mb-3.5 flex items-end gap-3.5">
        <div className="flex-1">
          <p className="text-[13px] text-text-2">Every action on your workspace — exportable for compliance.</p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">Audit log</h2>
        </div>
        <Button variant="default"><Copy className="size-3.5" /> Export JSON</Button>
      </header>

      <Card className="mb-3.5 flex items-center gap-2 px-3 py-2.5">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-2.5 top-2 size-3.5 text-text-3" />
          <Input
            placeholder="Search by actor, action, resource, correlation id…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 bg-surface-2 pl-9 text-[13px]"
          />
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-[150px_130px_160px_1fr_90px_200px] gap-3.5 border-b border-border bg-surface-2 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-3">
          <span>Timestamp</span><span>Actor</span><span>Action</span><span>Resource</span><span>Result</span><span>Correlation</span>
        </div>
        {rows.map((a, i) => (
          <div
            key={i}
            className="grid grid-cols-[150px_130px_160px_1fr_90px_200px] items-center gap-3.5 border-b border-border px-4 py-2.5 text-[13px] last:border-b-0"
          >
            <span className="font-mono text-[11.5px] text-text-2">
              {new Date(a.t).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
            <span className={`font-mono text-[12px] ${a.actor === 'system' ? 'text-text-3' : 'text-text'}`}>{a.actor}</span>
            <span className="font-mono text-[11.5px] text-accent">{a.action}</span>
            <span className="font-mono text-[12px] text-text-2">{a.resource}</span>
            <Badge
              tone={
                a.result === 'success' ? 'success' :
                a.result === 'warn'    ? 'warn'    :
                a.result === 'pending' ? 'info'    : 'danger'
              }
            >
              {a.result}
            </Badge>
            <span className="font-mono text-[11px] text-text-3">{a.cid}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
