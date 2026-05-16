import prisma from '@/lib/prisma';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { submitOrUpdateRsvpAction } from '@/lib/actions/events';

export default async function InviteRsvpContent({
  token,
  submitted,
}: {
  token: string;
  submitted: boolean;
}) {
  const row = await prisma.eventInvite.findFirst({
    where: {
      token,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          eventDate: true,
        },
      },
    },
  });

  if (!row) {
    notFound();
  }

  const e = row.event;

  const event = {
    title: e.title,
    description: e.description,
    location: e.location,
    eventDate: e.eventDate ? e.eventDate.toISOString() : null,
  };

  const submitRsvpForToken = submitOrUpdateRsvpAction.bind(null, token);

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <Card>
        <CardHeader className='space-y-3'>
          <Badge variant='secondary'>RSVP</Badge>
          <CardTitle>{e.title}</CardTitle>
          <p className='text-sm text-muted-foreground'>
            {event.eventDate
              ? new Date(event.eventDate).toDateString()
              : 'No date set'}{' '}
            {event.location && (
              <span className='ml-2'>
                <MapPin className='size-4 inline-block' />
                {event.location}
              </span>
            )}
          </p>
          {event.description ? (
            <p className='text-sm text-muted-foreground'>{event.description}</p>
          ) : null}
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className='mb-4 p-2 px-4 rounded-md border-2 border-red-300 bg-accent/80'>
              Thanks. Your RSVP has been recorded!
            </p>
          ) : null}
          <form action={submitRsvpForToken} className='space-y-4'>
            <Field>
              <Label htmlFor='name'>Name</Label>
              <Input id='name' name='name' required placeholder='Your name' />
            </Field>
            <Field>
              <Label htmlFor='name'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                placeholder='jdoe@example.com'
              />
            </Field>
            <Field>
              <Label htmlFor='name'>Attendance</Label>
              <select
                name='status'
                id='status'
                required
                defaultValue='attending'
                className='flex h-10 w-full rounded-md border border-border px-2'
              >
                <option value='attending'>Attending</option>
                <option value='notAttending'>Not Attending</option>
                <option value='maybe'>Maybe</option>
              </select>
            </Field>
            <Button type='submit' disabled={submitted}>
              {submitted ? 'Submitted' : 'Submit RSVP'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
