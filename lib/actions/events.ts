'use server';

import { redirect } from 'next/navigation';
import { getSession } from '../auth/server';
import prisma from '../prisma';
import { RsvpStatus } from '@/app/generated/prisma/enums';

const RSVP_STATUSES = ['attending', 'maybe', 'notAttending'] as const;

function parseCreateEvent(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (title.length < 3 || title.length > 100) {
    throw new Error('Event title must be between 3 and 100 characters');
  }
  const description = String(formData.get('description') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const eventDate = String(formData.get('eventDate') ?? '').trim();

  return {
    title,
    description: description.length ? description.slice(0, 2000) : null,
    location: location.length ? location.slice(0, 255) : null,
    eventDate: eventDate.length ? eventDate : null,
  };
}

function isRsvpStatus(status: string) {
  return (RSVP_STATUSES as readonly string[]).includes(status);
}

function parseRsvp(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  if (name.length < 2 || name.length > 100) {
    throw new Error('Name must be between 2 and 100 characters');
  }

  const email = String(formData.get('email') ?? '').trim();
  if (email.length < 3 || email.length > 320) {
    throw new Error('Please enter a valid email address');
  }

  const status = String(formData.get('status') ?? '').trim();
  if (!isRsvpStatus(status)) {
    throw new Error('Invalid RSVP status');
  }
  return {
    name,
    email,
    status,
  };
}

export async function createEventAction(formData: FormData) {
  const session = await getSession();
  const userId = session.data?.user?.id;

  const eventData = parseCreateEvent(formData);

  try {
    const createdEvent = await prisma.event.create({
      data: {
        ownerUserId: userId!,
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        eventDate: eventData.eventDate ? new Date(eventData.eventDate) : null,
      },
    });
    redirect(`/events/${createdEvent.id}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createInviteLinkAction(eventId: string) {
  try {
    const session = await getSession();
    const userId = session.data?.user?.id;

    const owns = await prisma.event.findFirst({
      where: {
        id: eventId,
        ownerUserId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!owns) {
      throw new Error('You do not own this event');
    }

    const token = crypto.randomUUID().replace(/-/g, '');

    await prisma.eventInvite.upsert({
      where: {
        eventId,
      },
      create: {
        eventId,
        token,
      },
      update: {
        token,
      },
    });
  } catch (error) {
    console.error(error);
  }

  redirect(`/events/${eventId}`);
}

export async function submitOrUpdateRsvpAction(
  token: string,
  formData: FormData
) {
  const input = parseRsvp(formData);

  const invite = await prisma.eventInvite.findFirst({
    where: {
      token,
    },
    select: {
      id: true,
      event: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!invite) {
    throw new Error('Invalid invite token');
  }

  const eventId = invite.event.id;
  const emailNormalized = input.email.toLowerCase();

  await prisma.eventRsvp.upsert({
    where: {
      eventId_emailNormalized: {
        eventId,
        emailNormalized,
      },
    },
    create: {
      eventId,
      inviteId: invite.id,
      email: input.email,
      emailNormalized,
      name: input.name,
      status: input.status as RsvpStatus,
    },
    update: {
      name: input.name,
      status: input.status as RsvpStatus,
      respondedAt: new Date(),
    },
  });

  redirect(`/invite/${token}?submitted=1`);
}
