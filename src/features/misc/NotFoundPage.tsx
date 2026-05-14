import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function NotFoundPage() {
  return (
    <div className="flex h-full items-center justify-center p-12 text-center">
      <div>
        <div className="font-mono text-[64px] font-semibold text-text-3 leading-none">404</div>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-1 text-sm text-text-2">The page you're looking for doesn't exist or has moved.</p>
        <Button variant="primary" className="mt-5" asChild>
          <Link to="/">Back to overview</Link>
        </Button>
      </div>
    </div>
  );
}
