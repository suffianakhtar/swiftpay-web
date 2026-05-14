import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Check } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { Wordmark } from '@/components/shared/Wordmark';
import { Avatar } from '@/components/shared/Avatar';
import { StatusPill } from '@/components/shared/StatusPill';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { fmtPKR } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  rememberMe: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'ayesha.khan@nessovo.com',
      password: 'developer-secret',
      rememberMe: true,
    },
  });
  const rememberMe = watch('rememberMe');

  const onSubmit = async (values: FormValues) => {
    try {
      await signIn(values.email, values.password);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sign-in failed';
      toast.error(message);
    }
  };

  return (
    <div className="grid h-screen grid-cols-2 bg-bg">
      {/* Left — brand */}
      <div className="relative overflow-hidden border-r border-border bg-gradient-to-br from-[color-mix(in_oklab,var(--c-accent)_28%,var(--c-bg))] to-bg p-11">
        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(60% 60% at 50% 30%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(60% 60% at 50% 30%, black, transparent)',
          }}
        />

        <div className="relative flex h-full flex-col justify-between">
          <Wordmark size={26} />

          <div className="max-w-md">
            <h2 className="text-[36px] font-semibold leading-[1.08] tracking-[-0.03em]">
              Move money on Raast —<br />
              without leaving your desk.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-2">
              One workspace for sending Requests-to-Pay, tracking collections, and managing Raast aliases across every bank in Pakistan.
            </p>

            {/* Mini receipt preview */}
            <div className="mt-7 flex max-w-sm items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
              <Avatar name="Hassan Ali" size={36} tone="#0ea5e9" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">Hassan Ali</div>
                <div className="font-mono text-[11px] text-text-3">0300-XXX-4513 · HBL</div>
              </div>
              <div className="text-right">
                <div className="tnum text-sm font-semibold">{fmtPKR(18_500)}</div>
                <StatusPill status="ACCEPTED" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-3">
            <ShieldCheck className="size-3.5" /> PCI-DSS · Raast certified · ISO 27001
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="grid place-items-center p-9">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <h1 className="text-[22px] font-semibold tracking-tight">{t('auth.signIn')}</h1>
          <p className="mb-7 mt-1.5 text-[13px] text-text-2">
            Use your nessovo workspace credentials.
          </p>

          <div className="space-y-3.5">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" className="mt-1.5" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-accent hover:underline">
                  {t('auth.forgot')}
                </a>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1.5 top-1.5 rounded p-1.5 text-text-3 hover:bg-surface-3"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
            </div>
          </div>

          <label
            className="mt-4 flex cursor-pointer items-center gap-2 text-[13px] text-text-2"
            onClick={() => setValue('rememberMe', !rememberMe)}
          >
            <span
              className={`grid size-4 place-items-center rounded border-2 text-white transition-colors ${
                rememberMe ? 'border-accent bg-accent' : 'border-border-2 bg-transparent'
              }`}
            >
              {rememberMe && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            {t('auth.keepSignedIn')}
          </label>

          <Button type="submit" variant="primary" className="mt-5 w-full" size="lg" loading={isSubmitting}>
            {!isSubmitting && (
              <>
                {t('auth.continue')} <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs text-text-2">
            <Zap className="size-3.5 shrink-0 translate-y-px" />
            <div>Backed by Raast · 1LINK-certified, end-to-end encrypted.</div>
          </div>

          <p className="mt-8 text-center text-xs text-text-3">
            {t('auth.noAccount')}{' '}
            <a href="#" onClick={(e) => e.preventDefault()} className="text-accent hover:underline">
              {t('auth.requestAccess')}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
