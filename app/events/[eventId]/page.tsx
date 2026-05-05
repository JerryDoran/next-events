import EventDetailsContent from '@/components/event-detail-content';
import { getSession } from '@/lib/auth/server';

export default async function EventDetails({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const session = await getSession();

  return (
    <EventDetailsContent eventId={eventId} userId={session.data?.user?.id} />
  );
}
