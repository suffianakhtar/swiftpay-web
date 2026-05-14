import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight, Check, Copy, Send, ShieldCheck, X,
} from 'lucide-react';
import {
  Button, Card, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  Input, Label,
} from '@/components/ui';
import { Avatar } from '@/components/shared/Avatar';
import { fmtPKR, uuid } from '@/lib/utils';
import { useCreateRtp, useResolveAlias } from './api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { AliasLookupResponse } from '@/types/api';

type Step = 0 | 1 | 2 | 3;

const schema = z.object({
  aliasKind: z.enum(['MOBILE', 'IBAN']),
  aliasValue: z.string().min(4, 'Required'),
  amount: z.coerce.number().positive('Must be > 0'),
  rtpType: z.enum(['NOW', 'LATER']),
  note: z.string().max(120).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function CreateRtpDialog({
  open, onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState<Step>(0);
  const [resolved, setResolved] = useState<AliasLookupResponse | null>(null);
  const [rtpId, setRtpId] = useState<string | null>(null);
  // Stable idempotency key per dialog open — survives Review-step retries.
  const [idempotencyKey] = useState(() => uuid());

  const { register, control, handleSubmit, watch, getValues, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      aliasKind: 'MOBILE',
      aliasValue: '0300-XXX-4513',
      amount: 18500,
      rtpType: 'NOW',
      note: 'Office rent — May',
    },
  });

  const resolveMut = useResolveAlias();
  const createMut  = useCreateRtp();

  // Reset dialog state on close
  const handleOpen = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setTimeout(() => {
        setStep(0);
        setResolved(null);
        setRtpId(null);
        reset();
      }, 150);
    }
  };

  const onResolve = async () => {
    const v = getValues();
    const res = await resolveMut.mutateAsync({ aliasType: v.aliasKind, aliasValue: v.aliasValue });
    if (!res.resolved) {
      toast.error('Alias could not be resolved on Raast');
      return;
    }
    setResolved(res);
  };

  const onSend = async () => {
    if (!resolved) return;
    const v = getValues();
    const res = await createMut.mutateAsync({
      lookupId: resolved.lookupId,
      partyType: 'MERCHANT',
      rtpType: v.rtpType,
      merchantId: 'MRT-3041-9821',
      instructedAmount: String(v.amount),
      expiryDateTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      transactionType: 'P2P',
      billNo: undefined,
      idempotencyKey,
    });
    setRtpId(res.rtpId);
    setStep(3);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader className="flex items-center gap-4">
          <DialogTitle>{step < 3 ? 'New request to pay' : 'Request sent'}</DialogTitle>
          <Stepper step={step} />
        </DialogHeader>

        <form onSubmit={handleSubmit(onSend)} className="px-5 py-4 min-h-[320px]">
          {step === 0 && (
            <RecipientStep
              register={register}
              control={control}
              resolved={resolved}
              setResolved={setResolved}
              onResolve={onResolve}
              loading={resolveMut.isPending}
            />
          )}

          {step === 1 && (
            <DetailsStep register={register} control={control} errors={errors} watch={watch} />
          )}

          {step === 2 && resolved && (
            <ReviewStep values={getValues()} resolved={resolved} idempotencyKey={idempotencyKey} />
          )}

          {step === 3 && rtpId && (
            <DoneStep amount={getValues('amount')} recipient={resolved?.accountTitle ?? ''} rtpId={rtpId} />
          )}
        </form>

        <DialogFooter>
          {step > 0 && step < 3 && (
            <Button type="button" variant="default" onClick={() => setStep((s) => (s - 1) as Step)}>
              Back
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="default" onClick={() => handleOpen(false)}>
              {step === 3 ? 'Done' : 'Cancel'}
            </Button>
            {step === 0 && (
              <Button type="button" variant="primary" disabled={!resolved} onClick={() => setStep(1)}>
                Continue <ArrowRight className="size-3.5" />
              </Button>
            )}
            {step === 1 && (
              <Button type="button" variant="primary" onClick={() => setStep(2)}>
                Review <ArrowRight className="size-3.5" />
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" variant="primary" loading={createMut.isPending}>
                {!createMut.isPending && (
                  <>
                    Send {fmtPKR(getValues('amount'))} <Send className="size-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---- Step indicators ---- */

function Stepper({ step }: { step: Step }) {
  const labels = ['Recipient', 'Details', 'Review'] as const;
  return (
    <div className="flex items-center gap-2">
      {labels.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'grid size-[18px] place-items-center rounded-full border text-[10px] font-semibold',
              (i < step || step === 3) && 'border-transparent bg-accent text-accent-fg',
              i === step && step < 3 && 'border-accent bg-surface-3 text-accent',
              i > step && step < 3 && 'border-border-2 bg-surface-2 text-text-2',
            )}
          >
            {i < step || step === 3 ? <Check className="size-2.5" strokeWidth={3} /> : i + 1}
          </span>
          <span className={i <= step && step < 3 ? 'text-text' : 'text-text-3'}>{s}</span>
          {i < labels.length - 1 && <span className="mx-1 h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}

/* ---- Step content ---- */

type StepHookFormProps = Pick<ReturnType<typeof useForm<FormValues>>, 'register' | 'control'>;

function RecipientStep({
  register, control, resolved, setResolved, onResolve, loading,
}: StepHookFormProps & {
  resolved: AliasLookupResponse | null;
  setResolved: (v: AliasLookupResponse | null) => void;
  onResolve: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="animate-fade-in">
      <Controller
        control={control}
        name="aliasKind"
        render={({ field }) => (
          <div className="mb-3.5 inline-flex gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5">
            {(['MOBILE', 'IBAN'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { field.onChange(k); setResolved(null); }}
                className={cn(
                  'rounded-md px-3.5 py-1.5 text-[12.5px] font-medium',
                  field.value === k ? 'bg-surface text-text shadow-[var(--shadow-sm)]' : 'text-text-2',
                )}
              >
                {k === 'MOBILE' ? 'Mobile alias' : 'IBAN'}
              </button>
            ))}
          </div>
        )}
      />

      <Label htmlFor="aliasValue">Alias</Label>
      <div className="relative mt-1.5">
        <Input
          id="aliasValue"
          className="pr-[100px] font-mono"
          {...register('aliasValue', { onChange: () => setResolved(null) })}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="absolute right-1 top-1"
          onClick={onResolve}
          loading={loading}
        >
          {!loading && 'Resolve'}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-text-3">We'll look this up on Raast before sending.</p>

      {resolved && (
        <Card className="mt-4 flex animate-fade-in items-center gap-3 bg-surface-2 p-3.5">
          <Avatar name={resolved.accountTitle} size={40} tone="#0ea5e9" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">{resolved.accountTitle}</span>
              <Check className="size-3.5 text-success" />
            </div>
            <div className="font-mono text-[11.5px] text-text-3">
              {resolved.maskedAccount} · Raast ID {resolved.raastId}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function DetailsStep({
  register, control, errors, watch,
}: StepHookFormProps & {
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
  watch: ReturnType<typeof useForm<FormValues>>['watch'];
}) {
  const rtpType = watch('rtpType');
  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <div className="relative mt-1.5">
          <span className="absolute left-3.5 top-2.5 text-sm font-medium text-text-3">Rs</span>
          <Input
            id="amount"
            type="number"
            step="any"
            className="pl-10 text-lg font-semibold tnum"
            {...register('amount')}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-danger">{errors.amount.message}</p>}
      </div>

      <Controller
        control={control}
        name="rtpType"
        render={({ field }) => (
          <div>
            <Label>Timing</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2.5">
              {[
                { id: 'NOW',   title: 'Pay now',   sub: 'Settles instantly on Raast' },
                { id: 'LATER', title: 'Pay later', sub: 'Expires in 24 hours' },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => field.onChange(o.id as 'NOW' | 'LATER')}
                  className={cn(
                    'rounded-lg border p-3.5 text-left',
                    rtpType === o.id
                      ? 'border-accent border-[1.5px] bg-[color-mix(in_oklab,var(--c-accent)_8%,var(--c-surface))]'
                      : 'border-border bg-surface-2',
                  )}
                >
                  <div className="text-[13px] font-semibold">{o.title}</div>
                  <div className="mt-0.5 text-xs text-text-2">{o.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      />

      <div>
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" className="mt-1.5" placeholder="What's this for?" {...register('note')} />
      </div>
    </div>
  );
}

function ReviewStep({
  values, resolved, idempotencyKey,
}: {
  values: FormValues;
  resolved: AliasLookupResponse;
  idempotencyKey: string;
}) {
  const rows: Array<[string, React.ReactNode]> = [
    ['To',       resolved.accountTitle],
    ['Account',  <span className="font-mono" key="acc">{resolved.maskedAccount}</span>],
    ['Raast ID', <span className="font-mono text-[11.5px]" key="raast">{resolved.raastId}</span>],
    ['Amount',   <span className="tnum font-semibold" key="amount">{fmtPKR(values.amount)}</span>],
    ['Type',     values.rtpType === 'NOW' ? 'Pay now (RTP-Now)' : 'Pay later (RTP-Later, 24h expiry)'],
    ['Note',     values.note ?? '—'],
  ];

  return (
    <div className="animate-fade-in flex flex-col gap-3.5">
      <p className="text-sm text-text-2">Confirm before we send this to Raast.</p>
      <Card className="bg-surface-2 px-4 py-3.5">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className={cn(
              'grid grid-cols-[110px_1fr] gap-3 py-2 text-sm',
              i < rows.length - 1 && 'border-b border-dashed border-border',
            )}
          >
            <span className="text-text-2">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </Card>

      <Card className="px-3.5 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5" />
          <span className="text-[12.5px] font-medium">Idempotency-Key</span>
          <span className="text-xs text-text-3">auto-generated · sent on POST /rtp</span>
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-2">
          <span className="flex-1 font-mono text-[11.5px] text-text-2">{idempotencyKey}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => { navigator.clipboard.writeText(idempotencyKey); toast.success('Copied'); }}
            aria-label="Copy"
          >
            <Copy className="size-3" />
          </Button>
        </div>
        <p className="mt-2 text-[11.5px] text-text-3">
          Retrying with the same key returns the original response — you can't double-send.
        </p>
      </Card>
    </div>
  );
}

function DoneStep({ amount, recipient, rtpId }: { amount: number; recipient: string; rtpId: string }) {
  return (
    <div className="animate-fade-in py-5 text-center">
      <div className="relative mx-auto mb-4 grid size-16 place-items-center rounded-full bg-success-2 text-success">
        <Check className="size-7" strokeWidth={3} />
        <span className="absolute -inset-0.5 rounded-full animate-pulse-ring" />
      </div>
      <div className="text-lg font-semibold tracking-tight">
        {fmtPKR(amount)} sent to {recipient}
      </div>
      <div className="mt-1 text-sm text-text-2">The recipient will be notified on their bank app.</div>
      <Card className="mt-5 inline-flex items-center gap-2.5 bg-surface-2 px-3 py-2.5">
        <span className="text-xs text-text-2">RTP ID</span>
        <span className="font-mono text-xs">{rtpId}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => { navigator.clipboard.writeText(rtpId); toast.success('Copied'); }}
        >
          <Copy className="size-3" />
        </Button>
      </Card>
    </div>
  );
}

/* Lint quiet — X used to keep the X import resolved (DialogContent renders its
   own close button, but kept here so the import doesn't get tree-shaken in dev
   mode while we iterate). */
void X;
