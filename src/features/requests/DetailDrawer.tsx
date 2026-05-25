import { useEffect, useState } from 'react';
import { Clock, Copy, ShieldCheck, X } from 'lucide-react';
import {
  Button, Drawer, DrawerContent, DrawerTitle,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, Card,
} from '@/components/ui';
import { Avatar } from '@/components/shared/Avatar';
import { StatusPill } from '@/components/shared/StatusPill';
import { fmtPKR, relTime } from '@/lib/utils';
import { useCancelRtp, useStatusInquiry } from './api';
import { toast } from 'sonner';
import type { RtpRow } from '@/types/api';
import { cn } from '@/lib/utils';

interface Props {
  rtp: RtpRow | null;
  onOpenChange: (v: boolean) => void;
}

export function RequestDetailDrawer({ rtp, onOpenChange }: Props) {
  const [pollingFlash, setPollingFlash] = useState(false);
  const [lastChecked, setLastChecked]   = useState(() => new Date());
  const [cancelOpen, setCancelOpen]     = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<RtpRow['status'] | null>(null);
  const statusInquiry = useStatusInquiry();
  const cancelMut     = useCancelRtp();

  const currentStatus = optimisticStatus ?? rtp?.status;

  // Auto-poll every 8s while pending
  useEffect(() => {
    if (!rtp || currentStatus !== 'PENDING') return;
    const id = setInterval(() => {
      void runStatusInquiry();
    }, 8000);
    return () => clearInterval(id);
     
  }, [rtp?.id, currentStatus]);

  const runStatusInquiry = async () => {
    if (!rtp) return;
    setPollingFlash(true);
    try {
      await statusInquiry.mutateAsync(rtp.paymentRequestId ?? rtp.id);
    } finally {
      setLastChecked(new Date());
      setTimeout(() => setPollingFlash(false), 400);
    }
  };

  const onConfirmCancel = async () => {
    if (!rtp) return;
    try {
      const res = await cancelMut.mutateAsync(rtp.paymentRequestId ?? rtp.id);
      setOptimisticStatus(res.status);
      toast.success('Request cancelled (responseCode 00)');
      setCancelOpen(false);
    } catch {
      toast.error('Failed to cancel — try again');
    }
  };

  return (
    <>
      <Drawer open={!!rtp} onOpenChange={onOpenChange}>
        <DrawerContent width={440}>
          {rtp && (
            <>
              <header className="border-b border-border px-5 py-4">
                <div className="text-[11px] uppercase tracking-[0.06em] text-text-3">
                  {rtp.direction === 'IN' ? 'Incoming request' : 'Outgoing request'}
                </div>
                <DrawerTitle className="mt-0.5 font-mono">{rtp.id}</DrawerTitle>
              </header>

              <div className="border-b border-border px-5 py-6 text-center">
                <div className="inline-flex justify-center">
                  <Avatar
                    name={rtp.counterpartyName}
                    size={56}
                    tone={rtp.direction === 'IN' ? '#22c55e' : '#0ea5e9'}
                  />
                </div>
                <div className="mt-3 text-sm text-text-2">
                  {rtp.direction === 'IN' ? 'From' : 'To'}
                </div>
                <div className="text-lg font-semibold">{rtp.counterpartyName}</div>
                <div
                  className={cn(
                    'tnum mt-3 text-[32px] font-semibold tracking-[-0.03em]',
                    rtp.direction === 'IN' && 'text-success',
                  )}
                >
                  {rtp.direction === 'IN' ? '+' : ''}
                  {fmtPKR(rtp.amount)}
                </div>
                <div className="mt-2">
                  {currentStatus && <StatusPill status={currentStatus} />}
                </div>
              </div>

              {/* Polling banner */}
              {currentStatus === 'PENDING' && (
                <div
                  className={cn(
                    'flex items-center gap-2.5 border-b border-border px-5 py-2.5 transition-colors',
                    pollingFlash ? 'bg-info-2' : 'bg-surface-2',
                  )}
                >
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      pollingFlash
                        ? 'bg-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--c-accent)_30%,transparent)] animate-pulse-ring'
                        : 'bg-warn shadow-[0_0_0_3px_var(--c-warn-2)]',
                    )}
                  />
                  <div className="flex-1 text-xs">
                    {pollingFlash ? (
                      <span className="text-accent">
                        Calling <span className="font-mono">/statusInquiry</span>…
                      </span>
                    ) : (
                      <>
                        <span className="text-text-2">Awaiting recipient · </span>
                        <span className="text-text-3">Last checked {relTime(lastChecked)}</span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-2.5 text-[11px]"
                    onClick={runStatusInquiry}
                    disabled={statusInquiry.isPending}
                  >
                    {statusInquiry.isPending ? 'Polling…' : 'Re-check'}
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2.5 px-5 py-4 text-sm">
                <Row k="Alias"  v={<span className="font-mono">{rtp.alias}</span>} />
                <Row k="Method" v={rtp.aliasType} />
                <Row k="Note"   v={rtp.note ?? '—'} />
                <Row k="Created" v={new Date(rtp.createdAt).toLocaleString('en-GB')} />

                <Card className="mt-2 flex flex-col gap-2 border-dashed bg-surface-2 px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-[0.04em] text-text-3">
                    Replay-safe references
                  </div>
                  {[
                    ['Idempotency-Key', rtp.idempotencyKey ?? '—'],
                    ['Correlation-Id',  rtp.correlationId  ?? '—'],
                    ['Upstream-Ref',    'onelink_rtp_' + rtp.id.slice(-7)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="min-w-[110px] text-[11px] text-text-2">{k}</span>
                      <span className="flex-1 truncate font-mono text-[11px]">{v}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => { navigator.clipboard.writeText(String(v)); toast.success('Copied'); }}
                        aria-label={`Copy ${k}`}
                      >
                        <Copy className="size-3" />
                      </Button>
                    </div>
                  ))}
                </Card>
              </div>

              {currentStatus === 'PENDING' && (
                <footer className="mt-auto flex gap-2 border-t border-border bg-surface-2 px-5 py-3.5">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={runStatusInquiry}
                    disabled={statusInquiry.isPending}
                  >
                    <Clock className="size-3.5" />
                    {statusInquiry.isPending ? 'Checking…' : 'Check status'}
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 border-[color-mix(in_oklab,var(--c-danger)_30%,var(--c-border))] text-danger"
                    onClick={() => setCancelOpen(true)}
                  >
                    <X className="size-3.5" />
                    Cancel request
                  </Button>
                </footer>
              )}
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-[440px]" hideClose>
          <DialogHeader className="flex items-start gap-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-danger-2 text-danger">
              <X className="size-5" />
            </div>
            <div>
              <DialogTitle>Cancel this request?</DialogTitle>
              <DialogDescription>
                This calls <span className="font-mono text-text">/rtpCancellation</span> on Raast.
                Once accepted, the recipient can no longer pay this RTP.
              </DialogDescription>
            </div>
          </DialogHeader>
          {rtp && (
            <div className="px-5 py-3.5">
              <Card className="flex items-center gap-2.5 bg-surface-2 px-3 py-3">
                <Avatar name={rtp.counterpartyName} size={32} tone="#0ea5e9" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{rtp.counterpartyName}</div>
                  <div className="font-mono text-[11px] text-text-3">
                    {rtp.id} · {rtp.alias}
                  </div>
                </div>
                <div className="tnum font-semibold">{fmtPKR(rtp.amount)}</div>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="default" onClick={() => setCancelOpen(false)}>Keep request</Button>
            <Button variant="destructive" onClick={onConfirmCancel} loading={cancelMut.isPending}>
              {!cancelMut.isPending && 'Cancel request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2.5">
      <span className="text-text-2">{k}</span>
      <span>{v}</span>
    </div>
  );
}

void ShieldCheck;
