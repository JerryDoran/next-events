import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createEventAction } from '@/lib/actions/events';
import Link from 'next/link';

export default async function NewEventPage() {
  return (
    <div className='mx-auto w-full max-w-2xl'>
      <Card className='bg-transparent backdrop-blur border'>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Create a new event and start sending out invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createEventAction} className='space-y-6'>
            <Field>
              <Label>Title</Label>
              <Input
                type='text'
                id='title'
                name='title'
                placeholder='My Awesome Event'
                required
              />
            </Field>
            <Field>
              <Label>Description</Label>
              <Textarea
                id='description'
                name='description'
                placeholder='A fun event for everyone!'
              />
            </Field>
            <Field>
              <Label>Location</Label>
              <Input
                type='text'
                id='location'
                name='location'
                placeholder='Event Location'
              />
            </Field>
            <Field>
              <Label>Date and Time</Label>
              <Input
                type='datetime-local'
                id='eventDate'
                name='eventDate'
                placeholder='Event Date and Time'
                required
              />
              <FieldDescription>
                Optional, you can set this later
              </FieldDescription>
            </Field>
            <div className='flex items-center gap-3'>
              <Button
                type='submit'
                className='cursor-pointer hover:bg-zinc-400 transition-colors'
              >
                Create Event
              </Button>
              <Button type='button' variant='outline' asChild>
                <Link
                  href='/dashboard'
                  className='text-sm text-muted-foreground'
                >
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
