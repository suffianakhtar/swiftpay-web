import { useState } from 'react';
import { Copy, CreditCard, Plus, QrCode, ShieldCheck, X } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { StatusPill } from '@/components/shared/StatusPill';
import { MOCK_USER } from '@/mock/data';
import { toast } from 'sonner';

interface Alias {
  id: string;
  type: 'MOBILE' | 'IBAN';
  value: string;
  bank: string;
  status: 'ACTIVE' | 'PENDING';
  primary: boolean;
  registered: string;
}

const ALIASES: Alias[] = [
  { id:'al_001', type:'MOBILE', value:'0301-XXX-4521',    bank:'Habib Bank Ltd.', status:'ACTIVE',  primary:true,  registered:'2024-09-14' },
  { id:'al_002', type:'IBAN',   value:'PK36HABB••••4912', bank:'Habib Bank Ltd.', status:'ACTIVE',  primary:false, registered:'2024-09-14' },
  { id:'al_003', type:'MOBILE', value:'0345-XXX-1122',    bank:'Meezan Bank',     status:'ACTIVE',  primary:false, registered:'2025-01-22' },
  { id:'al_004', type:'IBAN',   value:'PK11MEZN••••8841', bank:'Meezan Bank',     status:'PENDING', primary:false, registered:'2026-05-12' },
];

export default function AliasesPage() {
  const [list, setList] = useState(ALIASES);

  return (
    <div className="animate-fade-in p-5">
      <header className="mb-3.5 flex items-end gap-3.5">
        <div className="flex-1">
          <p className="text-[13px] text-text-2">
            Your registered Raast aliases. Anyone with these can send you money instantly.
          </p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">Aliases</h2>
        </div>
        <Button variant="default"><QrCode className="size-3.5" /> Show QR</Button>
        <Button variant="primary"><Plus className="size-3.5" /> Register alias</Button>
      </header>

      <Card className="mb-3.5 flex items-center gap-3.5 bg-[color-mix(in_oklab,var(--c-accent)_6%,var(--c-surface))] px-4 py-3.5">
        <div className="grid size-10 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--c-accent)_16%,transparent)] text-accent">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-[13.5px] font-medium">Raast identity verified</div>
          <div className="mt-0.5 text-xs text-text-2">
            Title-fetched from your bank · CNIC last verified 04 Apr 2026
          </div>
        </div>
        <div className="font-mono text-[11px] text-text-3">{MOCK_USER.raastId}</div>
      </Card>

      <Card>
        <header className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">Registered aliases</h3>
          <span className="ml-auto text-xs text-text-3">{list.length} of 5 used</span>
        </header>

        {list.map((a, i) => (
          <div
            key={a.id}
            className={`flex items-center gap-3.5 px-4 py-3.5 ${
              i < list.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div
              className={`grid size-9 place-items-center rounded-lg ${
                a.type === 'MOBILE' ? 'bg-info-2 text-accent' : 'bg-success-2 text-success'
              }`}
            >
              {a.type === 'MOBILE' ? <QrCode className="size-4" /> : <CreditCard className="size-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-medium">{a.value}</span>
                {a.primary && <Badge tone="info">PRIMARY</Badge>}
                {a.status === 'PENDING' && <StatusPill status="PENDING" />}
              </div>
              <div className="mt-0.5 text-xs text-text-2">
                {a.bank} · Registered{' '}
                {new Date(a.registered).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(a.value); toast.success('Copied'); }}
            >
              <Copy className="size-3" /> Copy
            </Button>
            {!a.primary && a.status === 'ACTIVE' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setList(list.map((x) => ({ ...x, primary: x.id === a.id })))}
              >
                Make primary
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-text-3"
              onClick={() => setList(list.filter((x) => x.id !== a.id))}
              aria-label="Remove alias"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}
