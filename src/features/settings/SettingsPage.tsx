import { Outlet, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { Badge, Button, Card, Input, Label, Switch } from '@/components/ui';
import { MOCK_USER } from '@/mock/data';
import { cn, relTime } from '@/lib/utils';
import { useState } from 'react';

const TABS = [
  { to: 'profile',  label: 'Profile' },
  { to: 'api-keys', label: 'API keys' },
  { to: 'webhooks', label: 'Webhooks' },
  { to: 'security', label: 'Security' },
  { to: 'notifications', label: 'Notifications' },
] as const;

export default function SettingsPage() {
  return (
    <div className="animate-fade-in p-5">
      <header className="mb-3.5">
        <p className="text-[13px] text-text-2">Manage your workspace, API access and notifications.</p>
        <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">Settings</h2>
      </header>

      <nav className="-mt-1 mb-5 flex gap-0.5 border-b border-border">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => cn(
              'relative px-3.5 py-2.5 text-[13px] font-medium',
              isActive ? 'text-text' : 'text-text-2 hover:text-text',
              isActive && 'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-t-sm after:bg-accent',
            )}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route path="profile"       element={<Profile />} />
        <Route path="api-keys"      element={<ApiKeys />} />
        <Route path="webhooks"      element={<Webhooks />} />
        <Route path="security"      element={<Security />} />
        <Route path="notifications" element={<Notifications />} />
        <Route index               element={<Navigate to="profile" replace />} />
      </Routes>

      <Outlet />
    </div>
  );
}

/* ---- Tabs ---- */

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="mb-3.5">
      <header className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
        <div className="ml-auto">{action}</div>
      </header>
      <div className="px-4 py-3.5">{children}</div>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-[11.5px] uppercase tracking-[0.04em] text-text-3">{label}</div>
      <div className={cn('text-[13.5px]', mono && 'font-mono')}>{value}</div>
    </div>
  );
}

function Profile() {
  return (
    <>
      <Section title="Workspace">
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Business name"    value="Nessovo (Pvt) Ltd." />
          <Field label="Merchant ID"      value="MRT-3041-9821" mono />
          <Field label="MCC"              value="5945 · Computer Software" />
          <Field label="Tax NTN"          value="3019221-4" />
          <Field label="Primary IBAN"     value={MOCK_USER.iban} mono />
          <Field label="Settlement bank"  value={MOCK_USER.bank} />
        </div>
      </Section>
      <Section title="Contact" action={<Button variant="default" size="sm">Edit</Button>}>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Authorized signatory" value={MOCK_USER.name} />
          <Field label="Email"                value={MOCK_USER.email} />
          <Field label="Phone"                value="+92 301 XXX 4521" mono />
          <Field label="Office"               value="3rd Floor, NRTC Plaza, Karachi" />
        </div>
      </Section>
    </>
  );
}

const KEYS = [
  { id:'key_01', name:'Production · web',       prefix:'sp_live_8f2a', lastUsed:'2026-05-14T09:21:00', created:'2024-12-04', scopes:['rtp:write','alias:read'] },
  { id:'key_02', name:'Production · mobile',    prefix:'sp_live_c701', lastUsed:'2026-05-14T08:58:00', created:'2025-01-22', scopes:['rtp:write','alias:read'] },
  { id:'key_03', name:'Staging · dev',          prefix:'sp_test_22ad', lastUsed:'2026-05-12T17:14:00', created:'2025-03-08', scopes:['*'] },
  { id:'key_04', name:'Bookkeeping · readonly', prefix:'sp_live_a019', lastUsed:'2026-04-29T11:02:00', created:'2025-02-14', scopes:['rtp:read'] },
];

function ApiKeys() {
  return (
    <Section title="API keys" action={<Button variant="primary" size="sm">Create key</Button>}>
      <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_130px] gap-3.5 border-b border-border px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-3">
        <span>Name</span><span>Key</span><span>Scopes</span><span>Last used</span><span>Created</span>
      </div>
      {KEYS.map((k) => (
        <div key={k.id} className="grid grid-cols-[1.4fr_1.2fr_1fr_1fr_130px] items-center gap-3.5 border-b border-border px-1 py-3 text-[13px] last:border-b-0">
          <div>
            <div className="font-medium">{k.name}</div>
            <div className="font-mono text-[11px] text-text-3">{k.id}</div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[12px] text-text-2">
            {k.prefix}_•••••••• <Copy className="size-3 text-text-3" />
          </div>
          <div className="flex flex-wrap gap-1">
            {k.scopes.map((s) => (
              <span key={s} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10.5px] text-text-2">{s}</span>
            ))}
          </div>
          <div className="text-xs text-text-2">{relTime(k.lastUsed)}</div>
          <div className="text-xs text-text-3">
            {new Date(k.created).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
          </div>
        </div>
      ))}
    </Section>
  );
}

const WEBHOOKS = [
  { id:'wh_01', url:'https://api.nessovo.com/swiftpay/events',         events:['rtp.accepted','rtp.rejected','rtp.expired'], status:'HEALTHY' as const,  ok:1284, fail:3 },
  { id:'wh_02', url:'https://internal.nessovo.com/hooks/swiftpay-bk',  events:['rtp.*','alias.*'],                          status:'DEGRADED' as const, ok:92,  fail:14 },
];

function Webhooks() {
  return (
    <Section title="Endpoints" action={<Button variant="primary" size="sm">Add endpoint</Button>}>
      {WEBHOOKS.map((w, i) => (
        <div
          key={w.id}
          className={cn(
            'grid grid-cols-[1fr_200px_110px] items-center gap-3.5 py-3.5',
            i < WEBHOOKS.length - 1 && 'border-b border-border',
          )}
        >
          <div className="min-w-0">
            <div className="truncate font-mono text-[12.5px]">{w.url}</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {w.events.map((e) => (
                <span key={e} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10.5px] text-text-2">{e}</span>
              ))}
            </div>
          </div>
          <div className="tnum text-xs text-text-2">
            <span className="text-success">✓ {w.ok}</span> · <span className={w.fail > 5 ? 'text-danger' : 'text-warn'}>✗ {w.fail}</span>
          </div>
          <Badge tone={w.status === 'HEALTHY' ? 'success' : 'warn'}>{w.status}</Badge>
        </div>
      ))}
    </Section>
  );
}

function Security() {
  const [twofa, set2fa] = useState(true);
  const [sms, setSms]   = useState(true);
  const [ip, setIp]     = useState(false);
  return (
    <>
      <Section title="Authentication">
        <Toggle label="Two-factor authentication" sub="Authenticator app · TOTP" value={twofa} onChange={set2fa} />
        <Toggle label="SMS backup codes"          sub="One-time codes if you lose your authenticator" value={sms} onChange={setSms} />
        <Toggle label="Restrict sign-in by IP"    sub="Off — sign-in allowed from any network" value={ip} onChange={setIp} />
      </Section>
      <Section title="JWT issuance">
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Algorithm"  value="HS256 (Nimbus)" mono />
          <Field label="Token TTL"  value="3600 seconds"   mono />
          <Field label="Issuer"     value="swiftpay-payment-service" mono />
          <Field label="Secret last rotated" value="04 May 2026 (10 days ago)" />
        </div>
      </Section>
    </>
  );
}

function Toggle({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center border-b border-border py-2.5 last:border-b-0">
      <div className="flex-1">
        <div className="text-[13.5px] font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-text-2">{sub}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

const NOTIFY_ROWS: Array<[string, boolean[]]> = [
  ['Request created',     [true, false, true, true]],
  ['Request accepted',    [true, true, true, true]],
  ['Request rejected',    [true, true, true, true]],
  ['Request expired',     [false, false, true, true]],
  ['Large amount alert',  [true, true, true, true]],
  ['Settlement received', [true, false, true, true]],
  ['API key created',     [true, false, false, true]],
  ['Sign-in from new IP', [true, true, true, false]],
];

function Notifications() {
  return (
    <Section title="Notifications">
      <p className="mb-3.5 text-sm text-text-2">Choose how you want to be alerted about activity on your account.</p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.05em] text-text-3">
            <th className="py-2 text-left font-medium">Event</th>
            <th className="py-2 font-medium">Email</th>
            <th className="py-2 font-medium">SMS</th>
            <th className="py-2 font-medium">Push</th>
            <th className="py-2 font-medium">Webhook</th>
          </tr>
        </thead>
        <tbody>
          {NOTIFY_ROWS.map(([label, on], i) => (
            <tr key={i} className="border-t border-border">
              <td className="py-2.5">{label}</td>
              {on.map((v, j) => (
                <td key={j} className="py-2.5 text-center">
                  <span
                    className={cn(
                      'relative inline-block h-[18px] w-[34px] rounded-full',
                      v ? 'bg-accent' : 'bg-surface-3',
                    )}
                  >
                    <span
                      className="absolute top-0.5 size-3.5 rounded-full bg-white shadow"
                      style={{ left: v ? 18 : 2 }}
                    />
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

void Input; void Label;
