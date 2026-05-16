import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { countByStatus } from './dashboard-content';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createInviteLinkAction } from '@/lib/actions/events';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function EventDetailsContent({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string | undefined;
}) {
  const row = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      eventDate: true,
      invite: true,
      eventRsvps: { select: { status: true } },
    },
  });

  if (!row) {
    notFound();
  }

  const counts = countByStatus(row.eventRsvps);

  const event = {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    eventDate: row.eventDate ? row.eventDate.toISOString() : null,
    inviteToken: row.invite?.token ?? null,
    attendingCount: counts.attendingCount,
    maybeCount: counts.maybeCount,
    notAttendingCount: counts.notAttendingCount,
  };

  const rsvpRows = await prisma.eventRsvp.findMany({
    where: {
      eventId: event.id,
    },
    orderBy: {
      respondedAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      respondedAt: true,
    },
  });

  const rsvps = rsvpRows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    respondedAt: row.respondedAt.toISOString(),
  }));

  const createInviteLinkForEvent = createInviteLinkAction.bind(null, event.id);

  const inviteLinkUrl = event.inviteToken
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/invite/${event.inviteToken}`
    : null;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {event.title}
          </h1>
          <p className='text-sm'>
            {event.eventDate
              ? new Date(event.eventDate).toDateString()
              : 'No date selected'}
            {event.location ? ` - ${event.location}` : ''}
          </p>
          {event.description && (
            <p className='max-w-2xl text-sm text-muted-foreground mt-6'>
              {event.description}
            </p>
          )}
        </div>
        <Button asChild size='sm' variant='outline'>
          <Link href={'/dashboard'}>Back</Link>
        </Button>
      </div>
      <div className='flex flex-wrap gap-2 text-xs'>
        <Badge>Attending: {event.attendingCount}</Badge>
        <Badge variant='secondary'>Maybe: {event.maybeCount}</Badge>
        <Badge variant='outline'>
          Not Attending: {event.notAttendingCount}
        </Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invite Link</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <p className='text-sm text-muted-foreground'>
            Share this link with guests so they can RSVP without creating an
            account
          </p>
          {inviteLinkUrl ? (
            <div className='rounded-md border border-border bg-surface p-3 text-sm'>
              {inviteLinkUrl}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No invite link generated yet.
            </p>
          )}
          <form action={createInviteLinkForEvent} className='flex'>
            <Button type='submit'>Generate Link</Button>
          </form>
        </CardContent>
      </Card>
      {/* Attendee List */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          {rsvps.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No responses yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rsvps.map((rsvp) => (
                    <TableRow key={rsvp.id} className='text-sm'>
                      <TableCell>{rsvp.name}</TableCell>
                      <TableCell>{rsvp.email}</TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {rsvp.status === 'notAttending'
                            ? 'not attending'
                            : rsvp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(rsvp.respondedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
