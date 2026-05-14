import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { CreateRtpDialog } from '@/features/requests/CreateRtpDialog';

const TITLES: Record<string, string> = {
  '/':            'nav.overview',
  '/requests':    'nav.requests',
  '/settlements': 'nav.settlements',
  '/aliases':     'nav.aliases',
  '/accounts':    'nav.accounts',
  '/settings':    'nav.settings',
  '/system':      'nav.system',
  '/clients':     'nav.clients',
  '/audit':       'nav.audit',
};

export function TopBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const titleKey =
    Object.keys(TITLES)
      .filter((p) => pathname === p || (p !== '/' && pathname.startsWith(p)))
      .sort((a, b) => b.length - a.length)[0] ?? '/';
  const title = user?.role === 'admin' && titleKey === '/' ? 'Operator console' : t(TITLES[titleKey]);

  return (
    <header className="flex items-center gap-3.5 border-b border-border bg-surface px-5 py-3">
      <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>

      <button
        onClick={() => {/* TODO: wire ⌘K palette */}}
        className="relative ml-4 flex max-w-[380px] flex-1 cursor-pointer items-center rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-2 text-left text-[13px] text-text-3 hover:bg-surface-3"
      >
        <Search className="absolute left-3 size-3.5 text-text-3" />
        {t('common.search')} requests, aliases, IBANs…
        <kbd className="ml-auto rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10.5px] text-text-2">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
          onClick={() => navigate('?notifications=1')}
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
        </Button>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="size-3.5" />
          {t('rtp.new')}
        </Button>
      </div>

      <CreateRtpDialog open={createOpen} onOpenChange={setCreateOpen} />
    </header>
  );
}
