'use server';

import { redirect } from 'next/navigation';
import { getSession } from '../auth/server';
import prisma from '../prisma';

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
