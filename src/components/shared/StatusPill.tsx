import { Badge } from '@/components/ui';
import type { RtpStatus } from '@/types/api';
import { useTranslation } from 'react-i18next';

const TONE: Record<RtpStatus, React.ComponentProps<typeof Badge>['tone']> = {
  PENDING:   'warn',
  ACCEPTED:  'success',
  REJECTED:  'danger',
  EXPIRED:   'neutral',
  CANCELLED: 'neutral',
  INITIATED: 'info',
};

/** Pill that renders an RtpStatus consistently across the app. */
export function StatusPill({ status }: { status: RtpStatus }) {
  const { t } = useTranslation();
  return (
    <Badge tone={TONE[status]} dot>
      {t(`rtp.status.${status}`, { defaultValue: status[0] + status.slice(1).toLowerCase() })}
    </Badge>
  );
}
