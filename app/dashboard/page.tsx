import DashboardContent from '@/components/dashboard-content';
import { getSession } from '@/lib/auth/server';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return <div>You must be logged in to view this page.</div>;
  }

  return <DashboardContent userId={session.data?.user?.id as string} />;
}
