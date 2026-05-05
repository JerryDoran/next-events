import prisma from '@/lib/prisma';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RsvpStatus as PrismaRsvpStatus } from '@/app/generated/prisma/enums';
import { count } from 'console';

export function countByStatus(eventRsvps: { status: PrismaRsvpStatus }[]) {
  let attendingCount = 0;
  let maybeCount = 0;
  let notAttendingCount = 0;

  for (const r of eventRsvps) {
    if (r.status === 'attending') {
      attendingCount++;
    } else if (r.status === 'maybe') {
      maybeCount++;
    } else if (r.status === 'notAttending') {
      notAttendingCount++;
    }
  }

  return { attendingCount, maybeCount, notAttendingCount };
}

export default async function DashboardContent({ userId }: { userId: string }) {
  const rows = await prisma.event.findMany({
    where: {
      ownerUserId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      location: true,
      eventDate: true,
      eventRsvps: { select: { status: true } },
    },
  });

  const events = rows.map((row) => ({
    id: row.id,
    title: row.title,
    location: row.location,
    eventDate: row.eventDate ? row.eventDate.toISOString() : null,
    ...countByStatus(row.eventRsvps),
  }));

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className=''>
          <h1 className='text-2xl font-semibold tracking-tight'>Your Events</h1>
          <p className='text-sm text-muted-foreground'>
            Track attendee responses and manage invite links
          </p>
        </div>
        <Button asChild>
          <Link href='/events/new'>Create New Event</Link>
        </Button>
      </div>

      {/* List of events */}
      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No events yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Create your first event to start collecting responses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className='space-y-3'>
                <div className='flex items-start justify-between gap-2'>
                  <CardTitle className='text-lg'>{event.title}</CardTitle>
                  <Button size='sm' asChild>
                    <Link href={`/events/${event.id}`}>View</Link>
                  </Button>
                </div>
                <div className='flex flex-wrap gap-2 text-xs'>
                  <Badge>Attending: {event.attendingCount}</Badge>
                  <Badge variant='secondary'>Maybe: {event.maybeCount}</Badge>
                  <Badge variant='outline'>
                    Not Attending: {event.notAttendingCount}
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {event.eventDate
                    ? new Date(event.eventDate).toDateString()
                    : 'No date set'}
                  {event.location ? ` - ${event.location}` : ''}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
