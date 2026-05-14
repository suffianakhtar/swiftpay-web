import { MoreHorizontal, Plus } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { StatusPill } from '@/components/shared/StatusPill';

const ACCOUNTS = [
  { id:'ba_01', bank:'Habib Bank Ltd.', iban:'PK36HABB••••4912', title:'Ayesha Khan', primary:true,  status:'VERIFIED'              },
  { id:'ba_02', bank:'Meezan Bank',     iban:'PK11MEZN••••8841', title:'Ayesha Khan', primary:false, status:'PENDING_VERIFICATION' },
];

export default function BankAccountsPage() {
  return (
    <div className="animate-fade-in p-5">
      <header className="mb-4 flex items-end gap-3.5">
        <div className="flex-1">
          <p className="text-[13px] text-text-2">
            Settlement and source accounts linked to your SwiftPay workspace.
          </p>
          <h2 className="mt-0.5 text-[22px] font-semibold tracking-[-0.022em]">Bank accounts</h2>
        </div>
        <Button variant="primary"><Plus className="size-3.5" /> Link account</Button>
      </header>

      <div className="grid grid-cols-2 gap-3.5">
        {ACCOUNTS.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-border bg-surface-2 text-[13px] font-semibold tracking-[-0.01em]">
                {a.bank.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{a.bank}</div>
                <div className="text-xs text-text-2">{a.title}</div>
              </div>
              {a.primary && <Badge tone="info">PRIMARY</Badge>}
            </div>
            <div className="mt-4.5 font-mono text-[15px] tracking-[0.06em]">{a.iban}</div>
            <div className="mt-4 flex items-center gap-2.5">
              {a.status === 'VERIFIED' ? (
                <StatusPill status="ACCEPTED" />
              ) : (
                <>
                  <StatusPill status="PENDING" />
                  <span className="text-xs text-text-2">
                    OTP sent · awaiting bank confirmation
                  </span>
                </>
              )}
              <div className="ml-auto flex gap-1.5">
                <Button variant="default" size="sm">Statement</Button>
                <Button variant="ghost" size="icon" className="size-8 text-text-3" aria-label="More">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
