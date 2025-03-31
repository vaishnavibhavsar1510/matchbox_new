import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '../types/event';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

type RsvpStatus = 'going' | 'maybe' | 'not_going';

interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
  updateRSVP: (eventId: string, status: RsvpStatus, notes?: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    setSocket(socket);

    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('eventUpdated', (updatedEvent: Event) => {
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === updatedEvent._id ? updatedEvent : event
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const refreshEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRSVP = async (eventId: string, status: RsvpStatus, notes?: string) => {
    if (!session?.user?.email) {
      setError('You must be logged in to RSVP');
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update RSVP');
      }

      // Update the local state immediately
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event._id === eventId && session?.user?.email) {
            return {
              ...event,
              rsvps: {
                ...event.rsvps,
                [session.user.email]: {
                  status,
                  notes: notes || '',
                  user: {
                    _id: session.user.email,
                    name: session.user.name || '',
                    email: session.user.email,
                    profileImage: session.user.image || undefined
                  },
                  updatedAt: new Date().toISOString()
                }
              }
            };
          }
          return event;
        })
      );

      setError(null);
    } catch (err) {
      console.error('Error updating RSVP:', err);
      setError(err instanceof Error ? err.message : 'Failed to update RSVP');
      throw err;
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      refreshEvents();
    }
  }, [status]);

  return (
    <EventsContext.Provider value={{ events, loading, error, refreshEvents, updateRSVP }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
} 