// app/dashboard/formReturn/error.tsx
'use client';

import DashboardError from '@/components/dashboard/DashboardError';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DashboardError error={error} />;
}