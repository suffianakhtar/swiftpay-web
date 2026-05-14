import { NavLink } from 'react-router-dom';
import {
  Home, List, ArrowDownToLine, QrCode, CreditCard, Settings,
  Activity, ShieldCheck, Clock, ChevronRight,
} from 'lucide-react';
import { useAuth, type Role } from '@/contexts/AuthContext';
import { Wordmark } from '@/components/shared/Wordmark';
import { Avatar } from '@/components/shared/Avatar';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export function Sidebar() {
  const { t } = useTranslation();
  const { user, switchRole } = useAuth();
  if (!user) return null;

  const userItems: NavItem[] = [
    { to: '/',            label: t('nav.overview'),    icon: Home },
    { to: '/requests',    label: t('nav.requests'),    icon: List,        badge: 12 },
    { to: '/settlements', label: t('nav.settlements'), icon: ArrowDownToLine },
    { to: '/aliases',     label: t('nav.aliases'),     icon: QrCode },
    { to: '/accounts',    label: t('nav.accounts'),    icon: CreditCard },
    { to: '/settings',    label: t('nav.settings'),    icon: Settings },
  ];
  const adminItems: NavItem[] = [
    { to: '/',         label: t('nav.overview'), icon: Home },
    { to: '/requests', label: t('nav.requests'), icon: List,   badge: '1.2K' },
    { to: '/system',   label: t('nav.system'),   icon: Activity },
    { to: '/clients',  label: t('nav.clients'),  icon: ShieldCheck },
    { to: '/audit',    label: t('nav.audit'),    icon: Clock },
  ];

  const items = user.role === 'admin' ? adminItems : userItems;

  return (
    <aside className="flex flex-col gap-4 border-r border-border bg-surface px-3.5 py-4.5">
      <div className="px-2 pb-2 pt-1">
        <Wordmark size={22} />
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium',
                'text-text-2 transition-colors hover:bg-surface-2 hover:text-text',
                isActive && 'bg-[color-mix(in_oklab,var(--c-accent)_16%,transparent)] text-accent hover:text-accent',
              )
            }
          >
            <it.icon className="size-4" />
            <span>{it.label}</span>
            {it.badge !== undefined && (
              <span className="ml-auto rounded-full bg-surface-3 px-1.5 py-0.5 text-[11px] text-text-2">
                {it.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2.5">
        {/* Role switcher — UI-only until backend RBAC exists */}
        <div className="flex gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5">
          {(['user', 'admin'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={cn(
                'flex-1 rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-[0.04em]',
                user.role === r
                  ? 'bg-surface text-text shadow-[var(--shadow-sm)]'
                  : 'text-text-3',
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Account chip */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2 py-2">
          <Avatar name={user.name} size={28} tone="var(--c-accent)" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium">{user.name}</div>
            <div className="font-mono text-[10.5px] text-text-3">
              {user.role.toUpperCase()}
            </div>
          </div>
          <ChevronRight className="size-3.5 text-text-3" />
        </div>
      </div>
    </aside>
  );
}
